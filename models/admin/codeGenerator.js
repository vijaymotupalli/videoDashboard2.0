/**
 * Created by Vijay on 27-Jun-17.
 */
var dbhandler = require('../../handlers/dbhandler');
var config = require('../../config/index');


var codes = {


    generateCode:function (req,res) {
        var paidStandards = req.body.paidStandards
        var institute = req.body.institute ? req.body.institute :""
        var numberOfCodes = req.body.numberOfCodes > 0 ? req.body.numberOfCodes : 1
        dbhandler.generateCode(numberOfCodes,paidStandards,institute).then(function (codes) {
            return res.status(200).json(codes)

        },function (errMsg) {
            return res.status(400).json({
                status: 400,
                title: 'Failed to Generate Code',
                msg: errMsg
            });
        });

    },
    getCodes:function (req,res) {
        dbhandler.getCodes().then(function (codes) {
            return res.status(200).json(codes)

        },function (errMsg) {
            return res.status(400).json({
                status: 400,
                title: 'Failed to Get Codes',
                msg: errMsg
            });
        });

    },
    applyCode:function (req,res) {
        var user = req.user
        if(user && user._id){
            user = user._id
        }else if(req.params.userId){
            user = req.params.userId
        }else{
            return res.status(400).json({
                status: 400,
                title: 'User Cant Be Empty',
                msg: "Invalid User"
            });
        }

        var code = req.body.code
        var standard = req.body.standard
        if(!code){
            return res.status(400).json({
                status:400,
                title:"Failed To Apply Code",
                msg:"Code Cant Be empty"
            })
        }
        if(!standard){
            return res.status(400).json({
                status:400,
                title:"Failed To Apply Code",
                msg:"standard Cant Be empty"
            })
        }
        dbhandler.applyCode(code,standard,user).then(function (result) {
            res.status(200).json(result)

        },function (err) {
            return res.status(400).json({
                status: 400,
                title: 'Failed to Apply Code',
                msg: err
            });

        })

    }

}


module.exports = codes

