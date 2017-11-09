var config = require("../config/index");
var multer = require('multer');
var path = require('path');


var fileHandler = {

    uploadFile: function (req, res) {
        var storage = multer.diskStorage({
            destination: function (req, file, callback) {
                callback(null, config.fileUpload.uploadPath);
            },
            filename: function (req, file, callback) {
                callback(null,  Date.now() + path.extname(file.originalname));
            }
        });


        var upload = multer({storage: storage}).single('file');

        upload(req, res, function (err) {
            if (err) {
                console.log(err);
            }
            else {
                res.status(200);
                res.json({
                    status: 200,
                    urlPath: req.protocol + "://" + req.headers.host + config.fileUpload.downloadPath + req.file.filename
                });
            }


        });

    },/*uploadFile*/
    uploadMultipleFiles: function (req, res) {

        var storage = multer.diskStorage({
            destination: function (req, file, callback) {
                callback(null, config.fileUpload.uploadPath);
            },
            filename: function (req, file, callback) {
                callback(null, Date.now() + path.extname(file.originalname));
            }
        });


        var upload = multer({storage: storage}).array('file');

        upload(req, res, function (err) {
            if (err) {
                res.json({
                    status: 500,
                    title: 'Oops! Something went wrong',
                    err: err
                })
            }
            else {

                if (req.files) {
                    GetUrlsForUploadedDocs(req.headers.host, req.protocol, req.files).then(function (_fileUrl) {

                        res.status(200);
                        res.json(_fileUrl);

                    });
                }
                else {
                    res.json({
                        status: 500,
                        title: 'Oops! Something went wrong',
                        err: err
                    })
                }
            }
        });


    }/*uploadFile*/
}

function GetUrlsForUploadedDocs(host, protocol, files) {

    var _geturls = function (file) {
        var urlPath = protocol + "://" + host + config.fileUpload.downloadPath + file.filename;
        return  urlPath
    }

    var _urls = files.map(_geturls);
    return Promise.all(_urls);
}

module.exports = fileHandler