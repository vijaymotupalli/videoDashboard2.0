var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var swaggerJSDoc = require('swagger-jsdoc');

var aws = require('aws-sdk')
var multer = require('multer')
var multerS3 = require('multer-s3')
aws.config.loadFromPath('./config/config.json');

var config = require('./config/index')

var app_routes = require('./routes/app');
var data_routes = require('./routes/data');
var admin_routes = require('./routes/admin');

var app = express();
require('expressjs-api-explorer')(app,express);

// swagger definition
var swaggerDefinition = {
    info: {
        title: 'Node Swagger API',
        version: '1.0.0',
        description: 'Demonstrating how to describe a RESTful API with Swagger',
    },
    host: config.server.host +":"+config.server.port,
    basePath: '/',
};

// options for the swagger docs
var options = {
    // import swaggerDefinitions
    swaggerDefinition: swaggerDefinition,
    // path to the API docs
    apis: ['./routes/*.js'],
};

// initialize swagger-jsdoc
var swaggerSpec = swaggerJSDoc(options);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'static')));
// serve swagger
app.get('/swagger.json', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});



function GetUrlsForUploadedDocs(files) {

    var _geturls = function (file) {

        return  file.location;
    }

    var _urls = files.map(_geturls);
    return Promise.all(_urls);
}


app.all('/*', function(req, res, next) {
    // CORS headers
    res.header("Access-Control-Allow-Origin", "*"); // restrict it to the required domain
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    // Set custom headers for CORS
    res.header('Access-Control-Allow-Headers', 'Content-type,Accept,Authorization,usertoken');
    if (req.method == 'OPTIONS') {
        res.status(200).end();
    } else {
        next();
    }
});
app.use('/uploads',express.static(path.join(__dirname, 'static/uploads')));
app.all('/api/*', [require('./middleware/validateAdmin')]);
app.all('/app/*', [require('./middleware/validateAdmin')]);

app.post('/testupload',function (req ,res) {

    var s3 = new aws.S3({});

    var upload = multer({
        storage: multerS3({
            s3: s3,
            bucket: 'codeuniverse',
            acl: 'public-read',
            contentType: multerS3.AUTO_CONTENT_TYPE,
            key: function (req, file, cb) {
                cb(null, file.originalname)
            }
        })
    }).array('file');


    upload(req, res, function (err) {
        if (err) {
            console.log("------hello--------",err);
        }

        GetUrlsForUploadedDocs(req.files).then(function (result) {
            res.json(result);
        })
    })




})


app_routes(app);
admin_routes(app);
data_routes(app);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  res.status(404);
  res.json({status:404,title:"Not Found",msg:"API Endpoint not found"});
  next();
});


module.exports = app;
