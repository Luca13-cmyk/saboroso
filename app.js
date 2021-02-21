var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const redis = require('redis');
var session = require("express-session");
var RedisStore = require('connect-redis')(session);
var formidable = require('formidable');
// ==
// var connectaRedis = require('connect-redis');
// var RedisStore = connectaRedis(session);
var http = require("http");
var socket = require("socket.io");

let redisClient = redis.createClient();


var app = express();


var http = http.Server(app);

var io = socket(http);


var indexRouter = require('./routes/index')(io);
var adminRouter = require('./routes/admin')(io);

io.on('connection', (socket) => {

  // com socket.emit() apenas o ultimo usuario q se conecto
  // com io.emit(), todos q se conectaram vao receber o emit

  console.log('a user connected');

  socket.on('disconnect', function () {

    console.log('user disconnected');

  });


});



app.use(function(req, res, next){ // Middleware

  if (req.method === 'POST')
  {
    var form = formidable.IncomingForm({

      uploadDir: path.join(__dirname, "/public/images"),
      keepExtensions: true
  
    });
  
    form.parse(req, function(err, fields, files){
  
      req.body = fields;
      req.fields = fields;
      req.files = files;
  
      next();
  
    });
  } else { 

    next();

  }

});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(session({ // Middleware

  store: new RedisStore({ client: redisClient }),
  secret:'p@ssw0rd',
  resave: true,
  saveUninitialized: true

}));

app.use(logger('dev')); // Middleware
app.use(express.json()); // Middleware
// app.use(express.urlencoded({ extended: false })); // Middleware
app.use(cookieParser()); // Middleware
app.use(express.static(path.join(__dirname, 'public'))); // Middleware

app.use('/', indexRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) { // Middleware
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) { // Middleware
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

http.listen(3000, function(){

  console.log("Servidor em execucao...");

});

