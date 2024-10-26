### Global

#### Function

- **simpleXmlLoadString**
  ***
  - Description

    Load xml string and return [SimpleXmlElementNode](./SimpleXmlElementNode.md) instance.

  - Arguments

    | Name | Type | Description |
    |---|:---:|---|
    | data | string | A well-formed XML string. |

  - Return

    | Type | Description |
    |:---:|---|
    | SimpleXmlElementNode | SimpleXmlElementNode instance. |

  - example
    ```
    const xmlElement = simpleXmlLoadString(
        `<Foo>
            <Bar>Bar Text</Bar>
        </Foo>`
    );

    xmlElement instanceof SimpleXmlElementNode;
    // true
    ```
  
  - **simpleXmlLoadDom**
  ***
  - Description

    Load DOM and return [SimpleXmlElementNode](./SimpleXmlElementNode.md) instance.

  - Arguments

    | Name | Type | Description |
    |---|:---:|---|
    | rootNode | Node\|Attr | The Node to use as the root of the DOM tree or subtree for which to construct an XML representation. |

  - Return

    | Type | Description |
    |:---:|---|
    | SimpleXmlElementNode | SimpleXmlElementNode instance. |

  - example
    ```
    const xmlElement = simpleXmlLoadDom(document.getElementById('container'));

    xmlElement instanceof SimpleXmlElementNode;
    // true
    ```

- **simpleXmlLoadUrl**
  ***
  - Description

    Load URL and return [SimpleXmlElementNode](./SimpleXmlElementNode.md) instance.

  - Arguments

    | Name | Type | Description |
    |---|:---:|---|
    | url | string | The path or URL to an XML document. |

  - Return

    | Type | Description |
    |:---:|---|
    | Promise\<SimpleXmlElementNode\> | SimpleXmlElementNode instance. |

  - example
    ```
    const xmlElement = await simpleXmlLoadUrl('https://www.w3schools.com/xml/note.xml');

    xmlElement instanceof SimpleXmlElementNode;
    // true
    ```
