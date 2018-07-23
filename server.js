'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var dns = require('dns');
var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true });
var ShortUrl = mongoose.model('ShortUrl', { 
  originurl:  {type: String, required: true}
});

app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

app.post("/api/shorturl/new", (req, res) => {
  let urlinput = req.body.url;
  var hostname = urlinput.replace('http://','').replace('https://','').split(/[/?#]/)[0];
  console.log(hostname);
  dns.lookup(hostname, (err, address, family) => {
    if (err) { res.json({"error":"invalid URL"}) }
    else {
      let shorturl = new ShortUrl({originurl: urlinput});
      shorturl.save(function(err, data) {
        console.log(data);
        res.json({"original_url": data.originurl,"short_url":data._id});
      });
    }
  });
});

app.get("/api/shorturl/:id", (req, res) => {
  ShortUrl.findById(req.params.id, function(err, data) {
    res.redirect(data.originurl);
  });
});

app.listen(port, function () {
  console.log('Node.js listening ...');
});