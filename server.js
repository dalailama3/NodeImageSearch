var express = require('express')
var https = require('https')

var app = express()

app.get('/', function (req,res) {
  res.send("Welcome to the Image Search App. Add /api/imagesearch/[your search] to the url to see results.")
})

app.get('/api/imagesearch/:search', function (req,res) {

  var search = req.params.search
  var offset = req.query.offset || 0



})

app.listen(3000)
