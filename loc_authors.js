var fs = require('fs');
var _ = require('lodash');
var request = require('request');
var async = require('async');

var booklist = JSON.parse(fs.readFileSync('loc-booklist.json'));

var findEntity = function(author, cb) {
  author = {
    name: author,
    id: null,
    yearOfBirth: null,
    yearOfDeath: null
  };

  request.get({
    url: "https://www.wikidata.org/w/api.php?action=wbsearchentities&search=" + author.name + "&language=en&format=json",
    json: true
  }, function(err, res, body) {
    if (err) {
      console.log(err);
      return cb('request failed on ' + author.name);
    }
    if (body.search.length) {
      var topHit = body.search.shift();
      author.id = topHit.id;
      request.get({
        // cleaner url? http://wdq.wmflabs.org/api?q=tree[314771][569,570]&props=569,570
        url: 'https://www.wikidata.org/w/api.php?action=wbgetclaims&format=json&entity=' + author.id,
        json: true
      }, function(err1, res1, body1) {
        if (err1) {
          console.log(err1);
          return cb('request failed on ' + author.id);
        }
        // console.log(res);
        // console.log(body1);
        console.log('processing ID', author.id, author.name);
        var year;

        if (_.has(body1, 'claims.P569')) {
          year = body1.claims.P569[0].mainsnak.datavalue.value.time;
          if (year.indexOf('+') === 0) {
            year = year.slice(1);
          }
          year = new Date(year).getFullYear();
          author.yearOfBirth = year;
        }

        if (_.has(body1, 'claims.P570')) {
          year = body1.claims.P570[0].mainsnak.datavalue.value.time;
          if (year.indexOf('+') === 0) {
            year = year.slice(1);
          }
          year = new Date(year).getFullYear();
          author.yearOfDeath = year;
        }
        return cb(null, author);
      });
    } else {
      cb(null, author);
    }
  });
};
    // var authors = _.map(booklist, 'author');
var authors = _(booklist)
  .map('author')
  .uniq()
  .value();

async.mapSeries(authors, findEntity, function(err, results) {
  if (err) {
    console.log(err);
  }
  console.log(results);
  fs.writeFileSync('loc-authors.json', JSON.stringify(results));
});

console.log(authors);
