/**
 * Created by Vijay on 27-Jun-17.
 */
var dbhandler = require('../../handlers/dbhandler');
var config = require('../../config/index');
var aws = require('aws-sdk')
var multer = require('multer')
var multerS3 = require('multer-s3')
//aws.config.loadFromPath('../../config/config.json');

var videos = {

    uploadVideo:function (req ,res) {
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
                console.log("------error--------",err);
            }

            GetUrlsForUploadedDocs(req.files).then(function (result) {
                res.json(result);
            })
        })

    },
    postVideo:function (req,res) {

        var adminData = req.user
        var title = req.body.title;
        var url = req.body.url;
        var standard = req.body.standard;
        var subject = req.body.subject;
        var description = req.body.description;

        if(!url){
            return res.status(400).json({
                status: 400,
                title: 'Video Cant Be Empty',
                msg: "Upload Video"
            });
        }

        var video = {
            title: title,
            url : url,
            admin:adminData._id,
            standard: standard,
            subject:subject,
            description:description
        }

        if(adminData.role == "SUPER_ADMIN"){

            console.log("----iam demo-----")

            dbhandler.postDemoVideo(video,adminData._id).then(function (video) {
                return res.status(200).json(video)

            },function (errMsg) {
                return res.status(400).json({
                    status: 400,
                    title: 'Failed to Post Video',
                    msg: errMsg
                });
            });
        }else{

            console.log("----iam not demo-----")


            dbhandler.postVideo(video).then(function (video) {
                return res.status(200).json(video)

            },function (errMsg) {
                return res.status(400).json({
                    status: 400,
                    title: 'Failed to Post Video',
                    msg: errMsg
                });
            });
        }

    },
    postDemoVideo:function (req,res) {

        var adminData = req.user
        var title = req.body.title;
        var url = req.body.url;
        var standard = req.body.standard;
        var subject = req.body.subject;
        var description = req.body.description;

        if(!url){
            return res.status(400).json({
                status: 400,
                title: 'Video Cant Be Empty',
                msg: "Upload Video"
            });
        }

        var video = {
            title: title,
            url : url,
            admin:adminData._id,
            standard: standard,
            subject:subject,
            description:description,
            school:adminData.school ? adminData.school :""

        }
        dbhandler.postDemoVideo(video,adminData._id).then(function (video) {
            return res.status(200).json(video)

        },function (errMsg) {
            return res.status(400).json({
                status: 400,
                title: 'Failed to Post Video',
                msg: errMsg
            });
        });

    },
    getVideos:function (req,res) {
        var admin = req.user
        var filters = {
            subject:req.body.subject ? req.body.subject :[],
            standard:req.body.standard ? req.body.standard :[],
            school:req.body.school ? req.body.school:[],
            admin:req.body.admin ? req.body.admin :[]
        }

        console.log(filters)

        if(!admin || !admin._id){
            return res.status(400).json({
                status: 400,
                title: 'User Cant Be Empty',
                msg: "Invalid User"
            });
        }

       return dbhandler.getVideos(admin,filters).then(function (videos) {
            return res.status(200).json(videos)

        },function (errMsg) {
            return res.status(400).json({
                status: 400,
                title: 'Failed to Post Video',
                msg: errMsg
            });
        });

    },
    getDemoVideos:function (req,res) {
        var admin = req.user
        // var filters = {
        //     subject:req.body.subject ? req.body.subject :[],
        //     standard:req.body.standard ? req.body.standard :[],
        //     school:req.body.school ? req.body.school:[],
        //     admin:req.body.admin ? req.body.admin :[]
        // }

        if(!admin || !admin._id){
            return res.status(400).json({
                status: 400,
                title: 'User Cant Be Empty',
                msg: "Invalid User"
            });
        }

       return dbhandler.getDemoVideos(admin).then(function (videos) {
            return res.status(200).json(videos)

        },function (errMsg) {
            return res.status(400).json({
                status: 400,
                title: 'Failed to Post Video',
                msg: errMsg
            });
        });

    },
    editVideo:function (req,res) {

        var title = req.body.title;
        var standard = req.body.standard;
        var subject = req.body.subject;
        var description = req.body.description;
        var videoId = req.params.videoId;

        var videoData = {
            title: title,
            standard: standard,
            subject:subject,
            description:description
        }

        dbhandler.editVideo(videoId,videoData).then(function (video) {
            return res.status(200).json({title:"Video Updated Successfully"})
        },function (errMsg) {
            return res.status(400).json({
                status: 400,
                title: 'Failed to Update Video',
                msg: errMsg
            });
        });

    },
    deleteVideo:function (req,res) {
        var admin = req.user
        var videoId = req.params.videoId;
        dbhandler.deleteVideo(videoId,admin).then(function (video) {
            return res.status(200).json({title:"Video Deleted Successfully"})
        },function (errMsg) {
            return res.status(400).json({
                status: 400,
                title: 'Failed to Delete Video',
                msg: errMsg
            });
        });

    },
    uploadLogo:function (req ,res) {
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
        }).single('file');
        upload(req, res, function (err) {
            if (err) {
                console.log(err);
            }
            else {
                res.status(200);
                res.json(req.file.location);
            }
        });

    },



}
function GetUrlsForUploadedDocs(files) {

    var _geturls = function (file) {

        return  file.location;
    }

    var _urls = files.map(_geturls);
    return Promise.all(_urls);
}

module.exports = videos

