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
