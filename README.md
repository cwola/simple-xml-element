# simple-xml-element

JavaScript library, like PHP's SimpleXmlElement.

## Include

```
<script type="text/javascript" src="SimpleXmlElement.js"></script>
```

or

```
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/@cwola/simple-xml-element@${version}/src/SimpleXmlElement.js"></script>
```

## Usage

```
const xmlString = `<Bookshelf>
<Book>
    <Name>The Wealth of Nations</Name>
    <Author>Adam Smith</Author>
    <Publishing>1776</Publishing>
</Book>
<Book>
    <Name>Crime and Punishment</Name>
    <Author>Fyodor Mikhaylovich Dostoyevsky</Author>
    <Publishing>1866</Publishing>
</Book>
<Book>
    <Name>And Then There Were None</Name>
    <Author>Agatha Christie</Author>
    <Publishing>1939</Publishing>
</Book>
</Bookshelf>`;
const xmlElement = simpleXmlLoadString(xmlString);

xmlElement.Bookshelf.Book.forEach((book) => {
    console.log(book.Name.$text() + ' (' + book.Author.$text() + ') - ' + book.Publishing.$text());
});
// The Wealth of Nations (Adam Smith) - 1776
// Crime and Punishment (Fyodor Mikhaylovich Dostoyevsky) - 1866
// And Then There Were None (Agatha Christie) - 1939


const newBook = xmlElement.Bookshelf.$addChild('Book');
newBook.$addChild('Name', 'A Clockwork Orange');
newBook.$addChild('Author', 'Anthony Burgess');
newBook.$addChild('Publishing', '1962');
console.log(xmlElement.$xpath('/Bookshelf/Book[last()]')[0].$asXML());
// <Book>
//     <Name>A Clockwork Orange</Name>
//     <Author>Anthony Burgess</Author>
//     <Publishing>1962</Publishing>
// </Book>


```

## API

- [global](./doc/api/global.md)

- [SimpleXmlElement](./doc/api/SimpleXmlElement.md)

- [SimpleXmlElementAttribute](./doc/api/SimpleXmlElementAttribute.md)

- [SimpleXmlElementNode](./doc/api/SimpleXmlElementNode.md)

- [SimpleXmlCommentNode](./doc/api/SimpleXmlCommentNode.md)

- [SimpleXmlTextNode](./doc/api/SimpleXmlTextNode.md)

## License

[MIT](./LICENSE)