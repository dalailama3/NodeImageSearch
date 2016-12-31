var express = require('express')
var https = require('https')
var http = require('http')
var API_KEY = process.env['API_KEY']
var SEARCH_ID = process.env['SEARCH_ID']

var mongo = require('mongodb')
var MongoClient = mongo.MongoClient


var app = express()


var mongoUrl = 'mongodb://localhost:27017/imagesearch'

function insertSearchToDB (search) {
  MongoClient.connect(mongoUrl, function (err, db) {
    if (err) {
      console.log("Could not connect to db")
      throw err
    } else {
      console.log("Connected to db server")
      var collection = db.collection('lastSearches')

      collection.insert({
        "search": search,
        "created_at": new Date()
      })

      db.close()

    }
  })
}

function returnLastSearchesCollection(arr, cb) {

  MongoClient.connect(mongoUrl, function (err, db) {
    if (err) {
      console.log("Could not connect to db")
      throw err
    } else {
      console.log("Connected to db server")
      var collection = db.collection('lastSearches')
      collection.find({}).toArray(function(err, docs) {
        if (err) {
          console.log(err)
        } else {
          arr = docs
          console.log(arr)
          cb(arr)
        }
      })

      db.close()
    }
  })
}



app.get('/', function (req,res) {
  var message = "Welcome to the Image Search App. Add /api/imagesearch/[your search] to the url to see results.\nAppend /api/latest/imagesearch to see the last searches made."
  message += "\nAppend /?offset=[offset] to your search to paginate through results."
  res.send(message)
})

app.get('/api/imagesearch/:search', function (req,response) {
  var results = []
  var images = [];
  var search = req.params.search
  var offset = req.query.offset


  var url = `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${SEARCH_ID}&q=${search}&searchType=image&fileType=jpg&imgSize=medium&num=10`

  if (offset >= 1 && offset <= 101) {
    url = url + '&start=' + offset
  }
  var req = https.request(url, (res) => {
    res.on('data', (chunk) => {
      images.push(chunk)
    }).on('end', () => {
      var body = Buffer.concat(images)
      var imagesObj = JSON.parse(body)

      imagesObj.items.forEach( (item) => {
        var returnJSON = {
          "url": item.link,
          "alt-text": item.snippet,
          "context-url": item.image.contextLink,
          "thumbnail": item.image.thumbnailLink
        }
        results.push(returnJSON)
      })

      response.send(results)
    });

  });
  insertSearchToDB(search)
  req.end();


})

app.get('/api/latest/imagesearch', function (req,res) {

  returnLastSearchesCollection([], (arr) => {
    var copy = arr.slice()
    res.send(copy.reverse())
  })
})

app.listen(3000)
