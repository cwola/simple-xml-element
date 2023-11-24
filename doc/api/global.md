### Global

#### Function

- **loadSimpleXmlElement**
  ***
  - Description

    Load xml string and return [SimpleXmlElementNode](./SimpleXmlElementNode.md) instance.

  - Arguments

    | Name | Type | Description |
    |---|:---:|---|
    | data | string | A well-formed XML string or the path or URL to an XML document if dataIsURL is true. |
    | dataIsUrl | boolean? | By default, dataIsURL is false. Use true to specify that data is a path or URL to an XML document instead of string data. |

  - Return

    | Type | Description |
    |:---:|---|
    | Promise\<SimpleXmlElementNode\> | SimpleXmlElementNode instance. |

  - example
    ```
    const xmlElement = await loadSimpleXmlElement(
        `<Foo>
            <Bar>Bar Text</Bar>
        </Foo>`
    );

    xmlElement instanceof SimpleXmlElementNode;
    // true
    ```
