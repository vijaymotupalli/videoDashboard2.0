/**
 * Created by Vijay on 27-Jun-17.
 */
var dbhandler = require('../../handlers/dbhandler');
var config = require('../../config/index');


var videos = {

    getAppUserVideos:function (req,res) {
        var user = req.user
        if(!user || !user._id){
            return res.status(400).json({
                status: 400,
                title: 'User Cant Be Empty',
                msg: "Invalid User"
            });
        }

        var filters = {
            subject:req.body.subject ? req.body.subject :[],
            standard:req.body.standard ? req.body.standard :[]
        }

       return dbhandler.getAppUserVideos(user._id,filters).then(function (videos) {
            return res.status(200).json(videos)

        },function (errMsg) {
            return res.status(400).json({
                status: 400,
                title: 'Failed to Get Videos',
                msg: errMsg
            });
        });

    },
    getDemoVideos:function (req,res) {

        return dbhandler.getDemoVideos().then(function (videos) {
            return res.status(200).json(videos)

        },function (errMsg) {
            return res.status(400).json({
                status: 400,
                title: 'Failed to Get Demo Video',
                msg: errMsg
            });
        });

    },




}


module.exports = videos

