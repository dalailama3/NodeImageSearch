var express = require('express')
var https = require('https')
var http = require('http')
var API_KEY = 'AIzaSyDRwhq1mt9KyLBySU_66k6f4s4W8Ohy-s8'
var SEARCH_ID = '015375743846369420198:cnraqfuetko'

var app = express()

app.get('/', function (req,res) {
  res.send("Welcome to the Image Search App. Add /api/imagesearch/[your search] to the url to see results.")
})

app.get('/api/imagesearch/:search', function (req,response) {
  var results = []
  var images = [];
  var search = req.params.search
  var offset = req.query.offset || 0


  var url = `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${SEARCH_ID}&q=${search}&searchType=image&fileType=jpg&imgSize=medium&num=2`
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
  req.end();


})

app.listen(3000)
