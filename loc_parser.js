var fs = require('fs');

var json = fs.readFileSync('loc-raw-author-data.json');
var data = JSON.parse(json).map(function(book) {
  return {
    title: book[0],
    author: book[1],
    sort_author: book[8],
    pub_date: parseInt(book[2], 10),
    description: book[3]
  };
});

fs.writeFileSync('loc-booklist.json', JSON.stringify(data, null, 2));
