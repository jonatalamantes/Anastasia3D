//Create the Libraries
var express    = require('express');
var fs         = require('fs');
var path       = require('path');
var url        = require('url');
var mongoose   = require('mongoose');
var Schema     = mongoose.Schema;
var bodyParser = require('body-parser');

//Configuration Section
var app = module.exports = express();
app.engine('.html', require('ejs').__express);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');

app.use(express.static('public'))

app.use( bodyParser.json() );       
app.use(bodyParser.urlencoded({     
  extended: true
})); 

//Server Section
app.get('/', function(req, res) {
    res.render('index', {
        title: "Anastasia",
        header: "Anastasia"
    });
});

//Empezar el servicio de Express
if (!module.parent) {
  app.listen(6551);
  console.log('Empezar Anastasia en el puerto A3 (6551) [Anastasia3D]');
}

