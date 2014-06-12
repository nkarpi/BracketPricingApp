var express = require('express');
var path = require('path');
var logger = require('morgan');
var routes = require('./routes/index');
var users = require('./routes/users');
var bodyParser = require('body-parser');
var json = require('json');
var urlencode = require('urlencode');
var logfmt = require("logfmt");

var app = express();

// view engine setup
app.engine('.html', require('ejs').__express);
app.use(express.static(__dirname, + '/public'));
app.set('views', __dirname + '/views');
app.set('view engine', 'html');

app.use(bodyParser());
app.set('title', 'nodeapp');

var xlsxj = require("xlsx-to-json");
xlsxj({
	input: "data.xlsx",
	output: "data.json"
}, function(err,result){
	if(err) {
		console.error(err);
	}
	else {
		console.log(result);
	}
});


app.get('/', function(req, res) {
  res.render('index');
});

app.get('/form.html', function(req, res) {
	res.render('form');
});

app.get('/estimate.html', function(req, res) {
	res.render('estimate');
});

//app.get('/Estimate.pdf', function(req, res) {
//	res.render('estimate');
//});


var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});

module.exports = app;
