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
     * @param {string} data -
     *
     * @return {XMLDocument}
     */
    function loadXml(data) {
        if (!isValidString(data)) {
            throw new TypeError('data is not xml string.');
        }
        return (new DOMParser()).parseFromString(data, 'text/xml');
    }

    /**
     * @param {string} data -
     *
     * @return {Promise<XMLDocument>}
     */
    async function loadXmlByUrl(data) {
        data = await fetch(data)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(response.status + ' ' + response.statusText);
                        }
                        return response.body;
                    })
                    .catch(reason => {
                        throw new Error(reason);
                    });
        return loadXml(data);
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
     * @param {string} data -
     * @param {boolean?} dataIsUrl - default : false
     *
     * @return {Promise<SimpleXmlElementNode>}
     */
    async function loadSimpleXmlElement(data, dataIsUrl = false) {
        if (dataIsUrl) {
            data = await loadXmlByUrl(data);
        } else {
            data = loadXml(data);
        }
        if (!(data instanceof XMLDocument) || data.childElementCount !== 1) {
            throw new Error('data is not xml string.');
        }
        return createSimpleXmlElementNode(data, new WeakMap, new Map);
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
        INITIALIZE: 'initialize',
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
            this.$readyState = READY_STATE.INITIALIZE;
            this.$documentIndexMap.set(elm, this);
            if (isValidString(elm.prefix)) {
                this.$namespaces.set(elm.prefix, elm.namespaceURI);
            }
            appendElements(this, elm.children);
            this.$readyState = READY_STATE.COMPLETE;
        }

        /**
         * Add attribute.
         *
         * @param {string} qualifiedName -
         * @param {string} value -
         * @param {string?} namespace - default : null
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
         * Add child element.
         *
         * @param {string} qualifiedName -
         * @param {string?} value - default : null
         * @param {string?} namespace - default : null
         *
         * @return {SimpleXmlElementNode}
         */
        $addChild(qualifiedName, value = null, namespace = null) {
            check(this);
            let element = null;
            if (isValidString(namespace)) {
                element = XMLDocument.createElementNS(namespace, qualifiedName);
            } else {
                element = XMLDocument.createElement(qualifiedName);
            }
            if (isValidString(value)) {
                element.innerHTML = value;
            }
            this.$elm.appendChild(element);
            return appendElements(this, element)[0];
        }

        /**
         * Add namespace.
         *
         * @param {string} prefix -
         * @param {string} namespace -
         *
         * @return {this}
         */
        $addNS(prefix, namespace) {
            check(this);
            this.$namespaces.set(prefix, namespace);
            return this;
        }

        /**
         * to XML string.
         *
         * @return {string}
         */
        $asXML() {
            check(this);
            return (new XMLSerializer()).serializeToString(this.$elm);
        }

        /**
         * Get attributes.
         *
         * @param {string?} namespaceOrPrefix - default : null
         * @param {boolean?} isPrefix - default : false
         *
         * @return {SimpleXmlElementAttribute[]}
         */
        $attributes(namespaceOrPrefix = null, isPrefix = false) {
            check(this);
            const simpleXmlElementAttributes = [];
            const filterNamespace = isValidString(namespaceOrPrefix);
            const attributes = this.$elm.attributes;

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
         * Get children.
         *
         * @param {string?} namespaceOrPrefix - default : null
         * @param {boolean?} isPrefix - default : false
         *
         * @return {SimpleXmlElementNode[]}
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
         * Count child node.
         *
         * @return {number}
         */
        $count() {
            check(this);
            return this.$elm.childElementCount;
        }

        /**
         * Get name.
         *
         * @return {string}
         */
        $getName() {
            check(this);
            return this.$elm.tagName;
        }

        /**
         * Get XPath.
         *
         * @return {string}
         *
         * @see https://developer.mozilla.org/en-US/docs/Web/XPath/Snippets
         */
        $getXPath() {
            check(this);
            let xpath = '',
                el = this.$elm,
                xml = this.$elm.ownerDocument;
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
          
                xpath = `*[name()='${el.nodeName}' and namespace-uri()='${
                    el.namespaceURI ?? ''
                }'][${pos}]/${xpath}`;
          
                el = el.parentNode;
            }
            xpath = `/*[name()='${xml.documentElement.nodeName}' and namespace-uri()='${
                el.namespaceURI ?? ''
            }']/${xpath}`;
            xpath = xpath.replace(/\/$/, '');
            return xpath;
        }

        /**
         * Has children.
         *
         * @return {boolean}
         */
        $hasChildren() {
            check(this);
            return this.$elm.hasChildNodes();
        }

        /**
         * Get parent.
         *
         * @return {SimpleXmlElementNode|SimpleXmlTextNode|null}
         */
        $parent() {
            check(this);
            const parent = this.$elm.parentNode;
            return parent === null ? null : this.$documentIndexMap.get(parent);
        }

        /**
         * Remove.
         *
         * @return {void}
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
         * Remove child.
         *
         * @param {SimpleXmlElementNode|SimpleXmlTextNode} child -
         *
         * @return {void}
         */
        $removeChild(child) {
            check(this);
            const elm = child.$elm;
            this.$elm.removeChild(elm);
            this.$documentIndexMap.delete(elm);
            delete this.$nodes[elm.localName];
        }

        /**
         * Remove namespace.
         *
         * @param {string} prefix -
         *
         * @return {this}
         */
        $removeNS(prefix) {
            check(this);
            this.$namespaces.delete(prefix);
            return this;
        }

        /**
         * to string.
         *
         * @return {string}
         */
        $text() {
            check(this);
            return this.$elm.innerHTML;
        }

        /**
         * xpath.
         *
         * @param {string} expression -
         * @param {Function?} nsResolver - default : null
         *
         * @return {Array<SimpleXmlElementNode|SimpleXmlTextNode>|number|string|boolean}
         */
        $xpath(expression, nsResolver = null) {
            check(this);
            let xmlDoc = this.$elm;
            if (!(xmlDoc instanceof XMLDocument)) {
                xmlDoc = xmlDoc.ownerDocument;
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
            return (simpleXmlElementNodes.length === 1 && simpleXmlElementNodes[0] instanceof Text) ? simpleXmlElementNodes[0].$text() : simpleXmlElementNodes;
        }
    });

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
         * to string.
         *
         * @return {string}
         */
        $text() {
            return this.$elm.nodeValue;
        }
    }

    class SimpleXmlElementAttribute {
        attribute;

        /**
         * @constructor
         *
         * @param {Attr} attribute -
         */
        constructor(attribute) {
            this.attribute = attribute;
        }

        /**
         * Get LocalName.
         *
         * @return {string}
         */
        $getLocalName() {
            return this.attribute.localName;
        }

        /**
         * Get Name.
         *
         * @return {string}
         */
        $getName() {
            return this.attribute.name;
        }

        /**
         * Get NamespaceURI.
         *
         * @return {string|null}
         */
        $getNamespaceURI() {
            return this.attribute.namespaceURI;
        }

        /**
         * Get prefix.
         *
         * @return {string|null}
         */
        $getPrefix() {
            return this.attribute.prefix;
        }

        /**
         * Get value.
         *
         * @return {string}
         */
        $getValue() {
            return this.attribute.value;
        }

        /**
         * Set value.
         *
         * @param {string} value -
         *
         * @return {void}
         */
        $setValue(value) {
            this.attribute.value = value;
        }

        /**
         * to string.
         *
         * @return {string}
         */
        $text() {
            return this.$getValue();
        }
    }

    _g.loadSimpleXmlElement = loadSimpleXmlElement;
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
    _g.SimpleXmlTextNode = new Proxy(SimpleXmlTextNode, {
        construct(target, args, receiver) {
            throw new TypeError('Illegal constructor.');
        }
    });

})(window);
