((_g) => {

    /**
     * loilo/magic-methods.js - PHP Magic Methods in JavaScript
     * @link https://gist.github.com/loilo/4d385d64e2b8552dcc12a0f5126b6df8
     * @license https://gist.github.com/loilo/3860e53e4aa4010d36a4c08a3da67419
     */
    function magicMethods (clazz) {
        const classHandler = Object.create(null);

        // Trap for class instantiation
        classHandler.construct = (target, args, receiver) => {
            // Wrapped class instance
            const instance = Reflect.construct(target, args, receiver);

            // Instance traps
            const instanceHandler = Object.create(null);
    
            // $__get()
            // Catches "instance.property"
            const get = Object.getOwnPropertyDescriptor(clazz.prototype, '$__get')
            if (get) {
                instanceHandler.get = (target, name, receiver) => {
                    if (name.substring(0, 1) === '$') {
                        return Reflect.get(target, name, receiver);
                    } else {
                        return get.value.call(target, name);
                    }
                }
            }
        
            // $__set()
            // Catches "instance.property = ..."
            const set = Object.getOwnPropertyDescriptor(clazz.prototype, '$__set')
            if (set) {
                instanceHandler.set = (target, name, value, receiver) => {
                    if (Object.hasOwn(target, name)) {
                        return Reflect.set(target, name, value, receiver);
                    } else {
                        return target.$__set.call(target, name, value);
                    }
                }
            }
        
            // $__unset()
            // Catches "delete instance.property"
            const unset = Object.getOwnPropertyDescriptor(clazz.prototype, '$__unset')
            if (unset) {
                instanceHandler.deleteProperty = (target, name) => {
                    return unset.value.call(target, name);
                }
            }

            return new Proxy(instance, instanceHandler);
        }

        return new Proxy(clazz, classHandler)
    }

    /**
     * typeof value === 'string' && value !== ''
     *
     * @param {any} value -
     *
     * @return {boolean}
     */
    function isValidString(value) {
        return (typeof value === 'string' && value !== '');
    }

    /**
     * append element to object.
     *
     * @param {object} obj -
     * @param {Element|Element[]|HTMLCollection} elements -
     *
     * @return {SimpleXmlElementNode[]}
     */
    function appendElements(obj, elements) {
        if (elements instanceof HTMLCollection) {
            elements = Array.from(elements);
        } else if (elements instanceof Element) {
            elements = [elements];
        } else if (!Array.isArray(elements)) {
            throw new TypeError('InternalError : elements is not element (appendElements)');
        }

        const nodes = [];
        for (let i = 0, len = elements.length; i < len; i++) {
            const element = elements[i];
            const node = createSimpleXmlElementNode(element, obj.$documentIndexMap, obj.$namespaces);
            nodes[nodes.length] = node;

            if (obj.$nodes[element.localName] && Object.hasOwn(obj.$nodes, element.localName)) {
                if (obj.$nodes[element.localName] instanceof SimpleXmlElementNode) {
                    obj.$nodes[element.localName] = [obj.$nodes[element.localName]];
                }
                obj.$nodes[element.localName].push(node);
            } else {
                obj.$nodes[element.localName] = node;
            }
        }
        return nodes;
    }

    /**
     * Load xml string and return SimpleXmlElementNode instance.
     *
     * @param {string} data - A well-formed XML string.
     *
     * @return {SimpleXmlElementNode} SimpleXmlElementNode instance.
     */
    function simpleXmlLoadString(data) {
        if (!isValidString(data)) {
            throw new TypeError('data is not xml string.');
        }
        const xml = (new DOMParser()).parseFromString(data, 'text/xml');
        if (!(xml instanceof XMLDocument) || xml.childElementCount !== 1) {
            throw new Error('data is not xml string.');
        }
        return createSimpleXmlElementNode(xml, new WeakMap, new Map);
    }

    /**
     * Load URL and return SimpleXmlElementNode instance.
     *
     * @param {string} url - The path or URL to an XML document.
     *
     * @return {Promise<SimpleXmlElementNode>} SimpleXmlElementNode instance.
     */
    async function simpleXmlLoadUrl(url) {
        if (!isValidString(url)) {
            throw new TypeError('argument is not url.');
        }
        const xml = await fetch(url)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(response.status + ' ' + response.statusText);
                        }
                        return response.body;
                    })
                    .catch(reason => {
                        throw new Error(reason);
                    });
        return simpleXmlLoadString(xml);
    }

    function createSimpleXmlElementNode(elm, documentIndexMap, namespaces) {
        const simpleXmlElementNode = new SimpleXmlElementNode(elm, documentIndexMap, namespaces);
        simpleXmlElementNode.$init();
        return simpleXmlElementNode;
    }

    class SimpleXmlElement {
        $elm;

        /**
         * @constructor
         *
         * @param {Element|Text} elm -
         */
        constructor(elm) {
            this.$elm = elm;
        }
    }

    const READY_STATE = {
        PENDING: 'pending',
        INITIALIZATION: 'initialization',
        COMPLETE: 'complete'
    };
    function check(simpleXmlElementNode) {
        if (simpleXmlElementNode.$readyState !== READY_STATE.COMPLETE) {
            throw new Error('This instance has not yet been initialized.');
        }
    }
    const SimpleXmlElementNode = magicMethods(class SimpleXmlElementNode extends SimpleXmlElement {
        $nodes;
        $documentIndexMap;
        $namespaces;
        $readyState = READY_STATE.PENDING;

        $__get(name) {
            return this.$nodes[name];
        }

        $__set(name, value) {
            throw new SyntaxError('TREE cannot be added directly. Use $addChild().');
        }

        $__unset(name) {
            this.$nodes[name].$remove();
            return true;
        }

        /**
         * @constructor
         *
         * @param {Element} elm -
         * @param {WeakMap} documentIndexMap -
         * @param {Map} namespaces -
         */
        constructor(elm, documentIndexMap, namespaces) {
            super(elm);
            this.$nodes = {};
            this.$documentIndexMap = documentIndexMap;
            this.$namespaces = namespaces;
        }

        /**
         * Initialize.
         *
         * @return {void}
         */
        $init() {
            const elm = this.$elm;
            if (this.$readyState !== READY_STATE.PENDING) {
                throw new Error('This instance has already been initialized.');
            } else if (this.$documentIndexMap.has(elm)) {
                throw new Error('Only one element on document allowed.');
            }
            this.$readyState = READY_STATE.INITIALIZATION;
            this.$documentIndexMap.set(elm, this);
            if (isValidString(elm.prefix)) {
                this.$namespaces.set(elm.prefix, elm.namespaceURI);
            }
            appendElements(this, elm.children);
            this.$readyState = READY_STATE.COMPLETE;
        }

        /**
         * Adds an attribute to the element.
         *
         * @param {string} qualifiedName - The name of the attribute to add.
         * @param {string} value - The value of the attribute.
         * @param {string?} namespace - If specified, the namespace to which the attribute belongs.
         *
         * @return {this}
         */
        $addAttribute(qualifiedName, value, namespace = null) {
            check(this);
            if (isValidString(namespace)) {
                this.$namespaces.set(qualifiedName.split(':')[0], namespace);
                this.$elm.setAttributeNS(namespace, qualifiedName, value);
            } else {
                this.$elm.setAttribute(qualifiedName, value);
            }
            return this;
        }

        /**
         * Adds a child element to the element.
         *
         * @param {string} qualifiedName - The name of the child element to add.
         * @param {string?} value - If specified, the value of the child element.
         * @param {string?} namespace - If specified, the namespace to which the child element belongs.
         *
         * @return {SimpleXmlElementNode|null} SimpleXmlElementNode instance representing the child added to the XML node on success; null on failure.
         */
        $addChild(qualifiedName, value = null, namespace = null) {
            check(this);
            let element = null,
                xmlDoc = this.$document().$elm;
            if (isValidString(namespace)) {
                element = xmlDoc.createElementNS(namespace, qualifiedName);
            } else {
                element = xmlDoc.createElement(qualifiedName);
            }
            if (isValidString(value)) {
                element.innerHTML = value;
            }
            this.$elm.appendChild(element);
            return appendElements(this, element)[0];
        }

        /**
         * Return a XML string based on SimpleXmlElementNode element.
         *
         * @return {string} XML string.
         */
        $asXML() {
            check(this);
            return (new XMLSerializer()).serializeToString(this.$elm);
        }

        /**
         * Returns the attributes and values defined within an xml tag.
         *
         * @param {string?} namespaceOrPrefix - An optional namespace for the retrieved attributes.
         * @param {boolean?} isPrefix - If isPrefix is true, namespaceOrPrefix will be regarded as a prefix. If false, namespaceOrPrefix will be regarded as a namespace URL.
         *
         * @return {SimpleXmlElementAttribute[]} Returns an array of SimpleXmlElementAttribute instances.
         */
        $attributes(namespaceOrPrefix = null, isPrefix = false) {
            check(this);
            const simpleXmlElementAttributes = [];
            const filterNamespace = isValidString(namespaceOrPrefix);
            const attributes = this.$elm.attributes || [];

            for (let i = 0, len = attributes.length; i < len; i++) {
                const attribute = attributes[i];
                if (filterNamespace) {
                    if (isPrefix && namespaceOrPrefix === attribute.prefix
                        || !isPrefix && namespaceOrPrefix === attribute.namespaceURI)
                    {
                        simpleXmlElementAttributes[simpleXmlElementAttributes.length] = new SimpleXmlElementAttribute(attribute);
                    }
                    continue;
                }
                simpleXmlElementAttributes[simpleXmlElementAttributes.length] = new SimpleXmlElementAttribute(attribute);
            }
            return simpleXmlElementAttributes;
        }

        /**
         * Returns the children of a node.
         *
         * @return {SimpleXmlElement[]} Returns an array of SimpleXmlElement instances.
         */
        $childNodes() {
            check(this);
            const elm = this.$elm;
            if (!elm.hasChildNodes()) {
                return [];
            }
            const simpleXmlElementNodes = [];

            for (let i = 0, len = elm.childNodes.length; i < len; i++) {
                const node = elm.childNodes[i];
                if (node instanceof Comment) {
                    simpleXmlElementNodes[simpleXmlElementNodes.length] = new SimpleXmlCommentNode(node);
                } else if (node instanceof Text) {
                    simpleXmlElementNodes[simpleXmlElementNodes.length] = new SimpleXmlTextNode(node);
                } else {
                    simpleXmlElementNodes[simpleXmlElementNodes.length] = this.$documentIndexMap.get(node);
                }
            }
            return simpleXmlElementNodes;
        }

        /**
         * Returns the children of an element.
         *
         * @param {string?} namespaceOrPrefix - An optional namespace for the retrieved elements.
         * @param {boolean?} isPrefix - If isPrefix is true, namespaceOrPrefix will be regarded as a prefix. If false, namespaceOrPrefix will be regarded as a namespace URL.
         *
         * @return {SimpleXmlElementNode[]} Returns an array of SimpleXmlElementNode instances.
         */
        $children(namespaceOrPrefix = null, isPrefix = false) {
            check(this);
            if (!this.$hasChildren()) {
                return [];
            }
            const simpleXmlElementNodes = [];
            const filterNamespace = isValidString(namespaceOrPrefix);

            for (const key in this.$nodes) {
                if (!Object.hasOwn(this.$nodes, key) || key.substring(0, 1) === '$') {
                    continue;
                }
                const children = Array.isArray(this.$nodes[key]) ? this.$nodes[key] : [this.$nodes[key]];
                for (let i = 0, len = children.length; i < len; i++) {
                    const child = children[i];
                    if (filterNamespace) {
                        if (isPrefix && namespaceOrPrefix === child.$elm.prefix
                            || !isPrefix && namespaceOrPrefix === child.$elm.namespaceURI)
                        {
                            simpleXmlElementNodes[simpleXmlElementNodes.length] = child;
                        }
                        continue;
                    }
                    simpleXmlElementNodes[simpleXmlElementNodes.length] = child;
                }
            }
            return simpleXmlElementNodes;
        }

        /**
         * Counts the children of an element.
         *
         * @return {number} Returns the number of elements of an element.
         */
        $countChildren() {
            check(this);
            return Object.keys(this.$nodes).length;
        }

        /**
         * Returns the depth of an element.
         *
         * @return {number} Returns the depth of an element. XMLDocument is 0, Root element is 1 ...
         */
        $depth() {
            check(this);
            let parent = this.$parent(),
                depth = 0;
            while (parent) {
                depth++;
                parent = parent.$parent();
            }
            return depth;
        }

        /**
         * Returns the owner document of an element.
         *
         * @return {SimpleXmlElement} Returns the owner document of an element.
         */
        $document() {
            check(this);
            return (this.$elm instanceof XMLDocument) ? this : this.$documentIndexMap.get(this.$elm.ownerDocument);
        }

        /**
         * Returns the XPath of an element.
         *
         * @return {string} Returns the XPath of an element.
         *
         * @see https://developer.mozilla.org/en-US/docs/Web/XPath/Snippets
         */
        $getXPath() {
            check(this);
            let xpath = '',
                el = this.$elm,
                xml = this.$document().$elm;
            let pos,
                tempitem2;

            while (el !== xml.documentElement) {
                pos = 0;
                tempitem2 = el;
                while (tempitem2) {
                    if (tempitem2.nodeType === 1 && tempitem2.nodeName === el.nodeName) {
                        // If it is ELEMENT_NODE of the same name
                        pos += 1;
                    }
                    tempitem2 = tempitem2.previousSibling;
                }

                xpath = `*[name()='${el.nodeName}'`
                        + (el.namespaceURI ? ` and namespace-uri()='${el.namespaceURI}'` : '')
                        + `][${pos}]/${xpath}`;
                el = el.parentNode;
            }
            xpath = `*[name()='${xml.documentElement.nodeName}'`
                        + (el.namespaceURI ? ` and namespace-uri()='${el.namespaceURI}'` : '')
                        + `]/${xpath}`;
            xpath = xpath.replace(/\/$/, '');
            return xpath;
        }

        /**
         * Checks whether the current element has sub elements.  
         * Note that TextNode does not count as a child element.
         *
         * @return {boolean} true if the current element has sub-elements, otherwise false.
         */
        $hasChildren() {
            check(this);
            return this.$countChildren() > 0;
        }

        /**
         * Gets the tagName of the element.
         *
         * @return {string} Returns as a string the name of the XML tag referenced by the SimpleXMLElementNode instance.
         */
        $name() {
            check(this);
            return this.$elm.tagName;
        }

        /**
         * Gets the parent element of this element.
         *
         * @return {SimpleXmlElementNode|null} Returns the parent element of this element.
         */
        $parent() {
            check(this);
            const parent = this.$elm.parentNode;
            return parent === null ? null : this.$documentIndexMap.get(parent);
        }

        /**
         * Registers a namespace to be passed to the nsResolver closure used in the $xpath method.  
         * Note that namespaces are not set for XML Nodes.
         *
         * @param {string} prefix - The prefix of the namespace to register.
         * @param {string} namespace - The namespace URI of the namespace to register.
         *
         * @return {this}
         */
        $registerNS(prefix, namespace) {
            check(this);
            this.$namespaces.set(prefix, namespace);
            return this;
        }

        /**
         * Remove this element from the parent element.
         *
         * @return {void} No value is returned.
         */
        $remove() {
            check(this);
            const parent = this.$parent();
            if (parent === null || parent instanceof SimpleXmlTextNode) {
                throw new Error('this element is not deletable.');
            }
            parent.$removeChild(this);
        }

        /**
         * Remove child element from this element.
         *
         * @param {SimpleXmlElementNode} child - A SimpleXmlElementNode that is the child element to be removed from this element.
         *
         * @return {void} No value is returned.
         */
        $removeChild(child) {
            check(this);
            const elm = child.$elm;
            const prev = elm.previousSibling;
            if (prev !== null && prev.nodeType === Node.TEXT_NODE && prev.nodeValue.trim() === '') {
                this.$elm.removeChild(prev);
            }
            this.$elm.removeChild(elm);
            this.$documentIndexMap.delete(elm);

            const nodes = this.$nodes;
            if (!Array.isArray(nodes[elm.localName]) || nodes[elm.localName].length < 2) {
                delete nodes[elm.localName];
            } else {
                const index = nodes[elm.localName].indexOf(child);
                if (index >= 0) {
                    nodes[elm.localName].splice(index, 1);
                    if (nodes[elm.localName].length === 1) {
                        nodes[elm.localName] = nodes[elm.localName][0];
                    }
                }
            }
        }

        /**
         * Returns the innerHTML property of an element.
         *
         * @return {string} Returns the innerHTML property of an element.
         */
        $text() {
            check(this);
            return this.$elm.innerHTML;
        }

        /**
         * Unregisters a namespace to be passed to the nsResolver closure used in the $xpath method.  
         * Note that namespaces are not unset for XML Nodes.
         *
         * @param {string} prefix - The prefix of the namespace to unregister.
         *
         * @return {this}
         */
        $unregisterNS(prefix) {
            check(this);
            this.$namespaces.delete(prefix);
            return this;
        }

        /**
         * Runs XPath query on XML data.
         *
         * @param {string} expression - An XPath path.
         * @param {Function?} nsResolver - A function that will be passed any namespace prefixes and should return a string representing the namespace URI associated with that prefix.
         *
         * @return {SimpleXmlElement[]|number|string|boolean} Returns an array of SimpleXmlElement instances, number, string or boolean.
         */
        $xpath(expression, nsResolver = null) {
            check(this);
            const xmlDoc = this.$document().$elm;
            if (!(this.$elm instanceof XMLDocument)) {
                const xpath = this.$getXPath();
                if (expression.substring(0, 1) === '/') {
                    expression = xpath + expression;
                } else {
                    expression = xpath + '/' + expression;
                }
            }

            nsResolver = nsResolver || function(prefix) {
                const ns = this.$namespaces;
                return ns.has(prefix) ? ns.get(prefix) : null;
            }.bind(this);
            const res = xmlDoc.evaluate(expression, xmlDoc, nsResolver, XPathResult.ANY_TYPE, null);
            switch (res.resultType) {
                case XPathResult.NUMBER_TYPE:
                    return res.numberValue;
                case XPathResult.STRING_TYPE:
                    return res.stringValue;
                case XPathResult.BOOLEAN_TYPE:
                    return res.booleanValue;
                case XPathResult.UNORDERED_NODE_ITERATOR_TYPE:
                    break;
                default:
                    throw new Error('');
            }

            // res.resultType === XPathResult.UNORDERED_NODE_ITERATOR_TYPE
            const simpleXmlElementNodes = [];
            const it = xmlDoc.evaluate(expression, xmlDoc, nsResolver, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
            try {
                let thisNode = it.iterateNext();
                const documentIndexMap = this.$documentIndexMap;
                while (thisNode) {
                    simpleXmlElementNodes[simpleXmlElementNodes.length] = (thisNode instanceof Text)
                                                                            ? new SimpleXmlTextNode(thisNode)
                                                                            : documentIndexMap.get(thisNode);
                    thisNode = it.iterateNext();
                }
            } catch (e) {
                throw new Error('Document tree modified during iteration ' + e);
            }
            return (simpleXmlElementNodes.length === 1 && simpleXmlElementNodes[0] instanceof SimpleXmlTextNode)
                    ? simpleXmlElementNodes[0].$text() : simpleXmlElementNodes;
        }
    });

    class SimpleXmlCommentNode extends SimpleXmlElement {
        /**
         * @constructor
         *
         * @param {Comment} elm -
         */
        constructor(elm) {
            super(elm);
        }

        /**
         * Returns the nodeValue property of a CommectNode.
         *
         * @return {string} Returns the nodeValue property of a CommectNode.
         */
        $text() {
            return this.$elm.nodeValue;
        }
    }

    class SimpleXmlTextNode extends SimpleXmlElement {
        /**
         * @constructor
         *
         * @param {Text} elm -
         */
        constructor(elm) {
            super(elm);
        }

        /**
         * Returns the nodeValue property of a TextNode.
         *
         * @return {string} Returns the nodeValue property of a TextNode.
         */
        $text() {
            return this.$elm.nodeValue;
        }
    }

    class SimpleXmlElementAttribute {
        $attribute;

        /**
         * @constructor
         *
         * @param {Attr} attribute -
         */
        constructor(attribute) {
            this.$attribute = attribute;
        }

        /**
         * Returns the localName property of an Attribute.
         *
         * @return {string} Returns the localName property of an Attribute.
         */
        $localName() {
            return this.$attribute.localName;
        }

        /**
         * Returns the name property of an Attribute.
         *
         * @return {string} Returns the name property of an Attribute.
         */
        $name() {
            return this.$attribute.name;
        }

        /**
         * Returns the namespaceURI property of an Attribute.
         *
         * @return {string|null} Returns the namespaceURI property of an Attribute.
         */
        $namespaceURI() {
            return this.$attribute.namespaceURI;
        }

        /**
         * Returns the prefix property of an Attribute.
         *
         * @return {string|null} Returns the prefix property of an Attribute.
         */
        $prefix() {
            return this.$attribute.prefix;
        }

        /**
         * Returns the value property of an Attribute.
         *
         * @return {string} Returns the value property of an Attribute.
         */
        $getValue() {
            return this.$attribute.value;
        }

        /**
         * Sets the value property of an Attribute.
         *
         * @param {string} value - Attribute value.
         *
         * @return {void} No value is returned.
         */
        $setValue(value) {
            this.$attribute.value = value;
        }

        /**
         * Alias of $getValue().
         *
         * @return {string} Returns the value property of an Attribute.
         */
        $text() {
            return this.$getValue();
        }
    }

    _g.simpleXmlLoadString = simpleXmlLoadString;
    _g.simpleXmlLoadUrl = simpleXmlLoadUrl;
    _g.SimpleXmlElement = new Proxy(SimpleXmlElement, {
        construct(target, args, receiver) {
            throw new TypeError('Illegal constructor.');
        }
    });
    _g.SimpleXmlElementNode = new Proxy(SimpleXmlElementNode, {
        construct(target, args, receiver) {
            throw new TypeError('Illegal constructor.');
        }
    });
    _g.SimpleXmlCommentNode = new Proxy(SimpleXmlCommentNode, {
        construct(target, args, receiver) {
            throw new TypeError('Illegal constructor.');
        }
    });
    _g.SimpleXmlTextNode = new Proxy(SimpleXmlTextNode, {
        construct(target, args, receiver) {
            throw new TypeError('Illegal constructor.');
        }
    });
    _g.SimpleXmlElementAttribute = new Proxy(SimpleXmlElementAttribute, {
        construct(target, args, receiver) {
            throw new TypeError('Illegal constructor.');
        }
    });

})(window);
