### SimpleXmlElementNode

#### Extends

- [SimpleXmlElement](./SimpleXmlElement.md)

#### Method

- **$addAttribute**
  ***
  - Description

    Adds an attribute to the element.

  - Arguments

    | Name | Type | Description |
    |---|:---:|---|
    | qualifiedName | string | The name of the attribute to add. |
    | value | string | The value of the attribute. |
    | namespace | string? | If specified, the namespace to which the attribute belongs. |

  - Return

    | Type | Description |
    |:---:|---|
    | SimpleXmlElementNode | this. |

  - example
    ```
    const xmlElement = await loadSimpleXmlElement(
        `<Foo>
            <Bar>Bar Text</Bar>
        </Foo>`
    );

    xmlElement.Foo.$addAttribute('baz', 'qux');
    console.log(xmlElement.$asXML());
    // <Foo baz="qux">
    //     <Bar>Bar Text</Bar>
    // </Foo>
    ```

- **$addChild**
  ***
  - Description

    Adds a child element to the element.

  - Arguments

    | Name | Type | Description |
    |---|:---:|---|
    | qualifiedName | string | The name of the child element to add. |
    | value | string? | If specified, the value of the child element. |
    | namespace | string? | If specified, the namespace to which the child element belongs. |

  - Return

    | Type | Description |
    |:---:|---|
    | SimpleXmlElementNode? | SimpleXmlElementNode instance representing the child added to the XML node on success; null on failure. |

  - example
    ```
    const xmlElement = await loadSimpleXmlElement(
        `<Foo>
            <Bar>Bar Text</Bar>
        </Foo>`
    );

    xmlElement.Foo.$addChild('Baz', 'qux');
    console.log(xmlElement.$asXML());
    // <Foo>
    //     <Bar>Bar Text</Bar>
    //     <Baz>qux</Baz>
    // </Foo>
    ```

- **$asXML**
  ***
  - Description

    Return a XML string based on SimpleXmlElementNode element.

  - Return

    | Type | Description |
    |:---:|---|
    | string | XML string. |

  - example
    ```
    const xmlElement = await loadSimpleXmlElement(
        `<Foo>
            <Bar>Bar Text</Bar>
        </Foo>`
    );

    console.log(xmlElement.$asXML());
    // <Foo>
    //     <Bar>Bar Text</Bar>
    // </Foo>
    ```

- **$attributes**
  ***
  - Description

    Returns the attributes and values defined within an xml tag.

  - Arguments

    | Name | Type | Description |
    |---|:---:|---|
    | namespaceOrPrefix | string? | An optional namespace for the retrieved attributes. |
    | isPrefix | boolean? | If isPrefix is true, namespaceOrPrefix will be regarded as a prefix. If false, namespaceOrPrefix will be regarded as a namespace URL. |

  - Return

    | Type | Description |
    |:---:|---|
    | SimpleXmlElementAttribute[] | Returns an array of SimpleXmlElementAttribute instances. |

  - example
    ```
    const xmlElement = await loadSimpleXmlElement(
        `<Foo>
            <Bar id="2023-cwola" class="item" data-depth="1">Bar Text</Bar>
        </Foo>`
    );

    xmlElement.Foo.Bar.$attributes().forEach((attr) => {
        console.log(attr.$name() + ' => ' + attr.$getValue());
    });
    // id => 2023-cwola
    // class => item
    // data-depth => 1
    ```

- **$children**
  ***
  - Description

    Returns the children of an element.

  - Arguments

    | Name | Type | Description |
    |---|:---:|---|
    | namespaceOrPrefix | string? | An optional namespace for the retrieved elements. |
    | isPrefix | boolean? | If isPrefix is true, namespaceOrPrefix will be regarded as a prefix. If false, namespaceOrPrefix will be regarded as a namespace URL. |

  - Return

    | Type | Description |
    |:---:|---|
    | SimpleXmlElementNode[] | Returns an array of SimpleXmlElementNode instances. |

  - example
    ```
    const xmlElement = await loadSimpleXmlElement(
        `<Foo>
            <Bar>Bar Text1</Bar>
            <Bar>Bar Text2</Bar>
            <Bar>Bar Text3</Bar>
        </Foo>`
    );

    xmlElement.Foo.$children().forEach((child) => {
        console.log(child.$text());
    });
    // Bar Text1
    // Bar Text2
    // Bar Text3
    ```

- **$countChildren**
  ***
  - Description

    Counts the children of an element.

  - Return

    | Type | Description |
    |:---:|---|
    | number | Returns the number of elements of an element. |

  - example
    ```
    const xmlElement = await loadSimpleXmlElement(
        `<Foo>
            <Bar>Bar Text1</Bar>
            <Bar>Bar Text2</Bar>
            <Bar>Bar Text3</Bar>
        </Foo>`
    );

    console.log(xmlElement.Foo.$countChildren());
    // 3
    ```

- **$depth**
  ***
  - Description

    Returns the depth of an element.

  - Return

    | Type | Description |
    |:---:|---|
    | number | Returns the depth of an element. XMLDocument is 0, Root element is 1 ... |

  - example
    ```
    const xmlElement = await loadSimpleXmlElement(
        `<Foo>
            <Bar>
                <Baz>
                    <Qux>qux</Qux>
                </Baz>
            </Bar>
        </Foo>`
    );

    console.log(xmlElement.Foo.Bar.Baz.Qux.$depth());
    // 4
    ```

- **$document**
  ***
  - Description

    Returns the owner document of an element.

  - Return

    | Type | Description |
    |:---:|---|
    | SimpleXmlElement | Returns the owner document of an element. |

  - example
    ```
    const xmlElement = await loadSimpleXmlElement(
        `<Foo>
            <Bar>
                <Baz>
                    <Qux>qux</Qux>
                </Baz>
            </Bar>
        </Foo>`
    );

    console.log(xmlElement.Foo.Bar.$document() === xmlElement);
    // true
    ```

- **$getXPath**
  ***
  - Description

    Returns the XPath of an element.

  - Return

    | Type | Description |
    |:---:|---|
    | string | Returns the XPath of an element. |

  - example
    ```
    const xmlElement = await loadSimpleXmlElement(
        `<Foo>
            <Bar>
                <Baz>
                    <Qux>qux</Qux>
                </Baz>
            </Bar>
        </Foo>`
    );

    console.log(
        xmlElement.$xpath(xmlElement.Foo.Bar.Baz.Qux.$getXPath())[0] === xmlElement.Foo.Bar.Baz.Qux
    );
    // true
    ```

  - link

    - [https://developer.mozilla.org/en-US/docs/Web/XPath/Snippets](https://developer.mozilla.org/en-US/docs/Web/XPath/Snippets)

- **$hasChildren**
  ***
  - Description

    Checks whether the current element has sub elements.  
    Note that TextNode does not count as a child element.

  - Return

    | Type | Description |
    |:---:|---|
    | boolean | true if the current element has sub-elements, otherwise false. |

  - example
    ```
    const xmlElement = await loadSimpleXmlElement(
        `<Foo>
            <Bar>Bar Text</Bar>
        </Foo>`
    );

    console.log(xmlElement.Foo.Bar.$hasChildren());
    // false
    ```

- **$name**
  ***
  - Description

    Gets the tagName of the element.

  - Return

    | Type | Description |
    |:---:|---|
    | string | Returns as a string the name of the XML tag referenced by the SimpleXMLElementNode instance. |

  - example
    ```
    const xmlElement = await loadSimpleXmlElement(
        `<Foo>
            <Bar>Bar Text</Bar>
        </Foo>`
    );

    console.log(xmlElement.Foo.Bar.$name());
    // Bar
    ```

- **$parent**
  ***
  - Description

    Gets the parent element of this element.

  - Return

    | Type | Description |
    |:---:|---|
    | SimpleXmlElementNode? | Returns the parent element of this element. |

  - example
    ```
    const xmlElement = await loadSimpleXmlElement(
        `<Foo>
            <Bar>Bar Text</Bar>
        </Foo>`
    );

    console.log(xmlElement.Foo.Bar.$parent() === xmlElement.Foo);
    // true
    ```

- **$registerNS**
  ***
  - Description

    Registers a namespace to be passed to the nsResolver closure used in the $xpath method.  
    Note that namespaces are not set for XML Nodes.

  - Arguments

    | Name | Type | Description |
    |---|:---:|---|
    | prefix | string | The prefix of the namespace to register. |
    | namespace | string | The namespace URI of the namespace to register. |

  - Return

    | Type | Description |
    |:---:|---|
    | SimpleXmlElementNode | this. |

  - example
    ```
    const xmlElement = await loadSimpleXmlElement(
        `<Foo xmlns="http://simple-xml-element.cwola.jp/baz">
            <Bar>Bar Text</Bar>
        </Foo>`
    );

    xmlElement.$registerNS('baz', 'http://simple-xml-element.cwola.jp/baz');
    console.log(xmlElement.$xpath('/baz:Foo/baz:Bar/text()'));
    // Bar Text
    ```

- **$remove**
  ***
  - Description

    Remove this element from the parent element.

  - Return

    | Type | Description |
    |:---:|---|
    | void | No value is returned. |

  - example
    ```
    const xmlElement = await loadSimpleXmlElement(
        `<Foo>
            <Bar>Bar Text</Bar>
        </Foo>`
    );

    xmlElement.Foo.Bar.$remove();
    console.log(xmlElement.$asXML());
    // <Foo>
    // </Foo>
    ```

- **$removeChild**
  ***
  - Description

    Remove child element from this element.

  - Arguments

    | Name | Type | Description |
    |---|:---:|---|
    | child | SimpleXmlElementNode | A SimpleXmlElementNode that is the child element to be removed from this element. |

  - Return

    | Type | Description |
    |:---:|---|
    | void | No value is returned. |

  - example
    ```
    const xmlElement = await loadSimpleXmlElement(
        `<Foo>
            <Bar>Bar Text</Bar>
        </Foo>`
    );

    xmlElement.Foo.$removeChild(xmlElement.Foo.Bar);
    console.log(xmlElement.$asXML());
    // <Foo>
    // </Foo>
    ```

- **$text**
  ***
  - Description

    Returns the innerHTML property of an element.

  - Return

    | Type | Description |
    |:---:|---|
    | string | Returns the innerHTML property of an element. |

  - example
    ```
    const xmlElement = await loadSimpleXmlElement(
        `<Foo>
            <Bar>Bar Text</Bar>
        </Foo>`
    );

    console.log(xmlElement.Foo.Bar.$text());
    // Bar Text
    ```

- **$unregisterNS**
  ***
  - Description

    Unregisters a namespace to be passed to the nsResolver closure used in the $xpath method.  
    Note that namespaces are not unset for XML Nodes.

  - Arguments

    | Name | Type | Description |
    |---|:---:|---|
    | prefix | string | The prefix of the namespace to unregister. |

  - Return

    | Type | Description |
    |:---:|---|
    | SimpleXmlElementNode | this. |

- **$xpath**
  ***
  - Description

    Runs XPath query on XML data.

  - Arguments

    | Name | Type | Description |
    |---|:---:|---|
    | expression | string | An XPath path. |
    | nsResolver | Function? | A function that will be passed any namespace prefixes and should return a string representing the namespace URI associated with that prefix. |

  - Return

    | Type | Description |
    |:---:|---|
    | SimpleXmlElement[]|number|string|boolean | Returns an array of SimpleXmlElement instances, number, string or boolean. |

  - example
    ```
    const xmlElement = await loadSimpleXmlElement(
        `<Foo xmlns="http://simple-xml-element.cwola.jp/baz">
            <Bar>Bar Text</Bar>
        </Foo>`
    );

    console.log(xmlElement.$xpath('/baz:Foo/baz:Bar/text()', (prefix) => {
        return (prefix === 'baz' ? 'http://simple-xml-element.cwola.jp/baz' : null);
    }));
    // Bar Text

    // is same ...
    xmlElement.$registerNS('baz', 'http://simple-xml-element.cwola.jp/baz');
    console.log(xmlElement.$xpath('/baz:Foo/baz:Bar/text()'));
    ```
