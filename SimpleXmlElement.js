((_g) => {

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
            const node = new SimpleXmlElementNode(element, obj.$documentIndexMap, obj.$namespaces);
            nodes[nodes.length] = node;

            if (obj[element.localName] && Object.hasOwn(obj, element.localName)) {
                if (obj[element.localName] instanceof SimpleXmlElementNode) {
                    obj[element.localName] = [obj[element.localName]];
                }
                obj[element.localName].push(node);
            } else {
                obj[element.localName] = node;
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
        return new SimpleXmlElementNode(data, new WeakMap, new Map);
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

    class SimpleXmlElementNode extends SimpleXmlElement {
        $documentIndexMap;
        $namespaces;

        /**
         * @constructor
         *
         * @param {Element} elm -
         * @param {WeakMap} documentIndexMap -
         * @param {WeakMap} namespaces -
         */
        constructor(elm, documentIndexMap, namespaces) {
            super(elm);
            if (documentIndexMap.has(elm)) {
                throw new Error('Only one element on document allowed.');
            }
            this.$documentIndexMap = documentIndexMap;
            documentIndexMap.set(elm, this);
            this.$namespaces = namespaces;
            if (isValidString(elm.prefix)) {
                namespaces.set(elm.prefix, elm.namespaceURI);
            }
            appendElements(this, elm.children);
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
            this.$namespaces.set(prefix, namespace);
            return this;
        }

        /**
         * to XML string.
         *
         * @return {string}
         */
        $asXML() {
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
            if (!this.$hasChildren()) {
                return [];
            }
            const simpleXmlElementNodes = [];
            const filterNamespace = isValidString(namespaceOrPrefix);

            for (const key in this) {
                if (!Object.hasOwn(this, key) || key.substring(0, 1) === '$') {
                    continue;
                }
                const children = Array.isArray(this[key]) ? this[key] : [this[key]];
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
            return this.$elm.childElementCount;
        }

        /**
         * Get name.
         *
         * @return {string}
         */
        $getName() {
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
            return this.$elm.hasChildNodes();
        }

        /**
         * Get parent.
         *
         * @return {SimpleXmlElementNode|SimpleXmlTextNode|null}
         */
        $parent() {
            const parent = this.$elm.parentNode;
            return parent === null ? null : this.$documentIndexMap.get(parent);
        }

        /**
         * Remove.
         *
         * @return {void}
         */
        $remove() {
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
            const elm = child.$elm;
            this.$elm.removeChild(elm);
            this.$documentIndexMap.delete(elm);
            delete this[elm.localName];
        }

        /**
         * Remove namespace.
         *
         * @param {string} prefix -
         *
         * @return {this}
         */
        $removeNS(prefix) {
            this.$namespaces.delete(prefix);
            return this;
        }

        /**
         * to string.
         *
         * @return {string}
         */
        $text() {
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

})(window);
