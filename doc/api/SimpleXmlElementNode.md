### SimpleXmlElementNode

@TODO overview

#### Extends

- [SimpleXmlElement](./SimpleXmlElement.md)

#### Method

- **$addAttribute**
  ***
  - Description

    Adds an attribute to the SimpleXmlElementNode element.

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
            <Bar>Bar</Bar>
        </Foo>`
    );

    xmlElement.Foo.$addAttribute('baz', 'qux');
    xmlElement.$asXML();
    // <Foo baz="qux">
    //     <Bar>Bar</Bar>
    // </Foo>
    ```

- **$addChild**
  ***
  - Description

    Adds a child element to the XML node.

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
            <Bar>Bar</Bar>
        </Foo>`
    );

    xmlElement.Foo.$addChild('Baz', 'qux');
    xmlElement.$asXML();
    // <Foo>
    //     <Bar>Bar</Bar>
    //     <Baz>qux</Baz>
    // </Foo>
    ```

- **@TODO**
