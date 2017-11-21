var dbhandler = require('../../handlers/dbhandler');
var jwt = require('../../utils/jwt');
var crypto = require('crypto');

var authentication = {
    
    login:function (req,res) {
        dbhandler.login(req.username,req.passwordHash).then(function (admin) {
            if(!admin){
                return res.status(401).json({
                    title: 'Invalid credentials',
                    msg: "Incorrect Username or Password "
                })
            }
                return res.json(admin)
        },function (errMsg) {
            res.status(401);
            return res.json({
                title: 'Unauthorized Access',
            });
        })

    },
    register:function (req,res) {
        var email = req.body.email;
        var name = req.body.name;
        var password = req.body.password;
        var phone = req.body.phone;
        var school = req.body.school ? req.body.school:"";
        var schoolLogoUrl = req.body.schoolLogoUrl ? req.body.schoolLogoUrl:"";
        var address = req.body.address;
        var profilePic = req.body.profilePic

        if(!email){
            return res.status(400).json({
                status: 400,
                title: 'Email Cant Be Empty',
                msg: "Enter Email"
            });
        }
        if(!password){
            return res.status(400).json({
                status: 400,
                title: 'password Cant Be Empty',
                msg: "Enter Password"
            });
        }

        var admin = {
            email: email,
            name : name,
            password: crypto.createHash('md5').update(password).digest("hex"),
            phone:phone,
            school:school,
            address:address,
            schoolLogoUrl:schoolLogoUrl,
            profilePic:profilePic
        }

        dbhandler.register(admin).then(function (admin) {
            return res.status(200).json(admin)

        },function (errMsg) {
           return res.status(400).json({
                status: 400,
                title: 'Failed to register Admin',
                msg: errMsg
            });
        });

    },
    getAdminDetails:function (req,res) {
        var admin = req.user._id
        if(!admin){
            return res.status(400).json({
                title: 'Admin  Cant Be Empty',
                msg: 'Please Enter Admin '
            });
        }
        dbhandler.getAdminDetails(admin).then(function (admin) {

            if(!admin){
                return res.status(404).json({
                    title: 'Admin Not Found',
                    msg: "Admin You Are looking Not Found"
                })
            }

            res.status(200).json(admin)
        },function (errMsg) {
            res.status(400);
            return res.json({
                title: 'Failed To Get Admin Details',
                msg: errMsg
            });
        }).catch(function (err) {
            res.status(400);
            return res.json({
                title: 'Failed To Get Admin Details',
                msg: err
            });
        })

    },
    getUserDetails:function (req,res) {
        var admin = req.params.adminId
        if(!admin){
            return res.status(400).json({
                title: 'Admin  Cant Be Empty',
                msg: 'Please Enter Admin '
            });
        }
        dbhandler.getUserDetails(admin).then(function (admin) {

            if(!admin){
                return res.status(404).json({
                    title: 'Admin Not Found',
                    msg: "Admin You Are looking Not Found"
                })
            }

            res.status(200).json(admin)
        },function (errMsg) {
            res.status(400);
            return res.json({
                title: 'Failed To Get Admin Details',
                msg: errMsg
            });
        }).catch(function (err) {
            res.status(400);
            return res.json({
                title: 'Failed To Get Admin Details',
                msg: err
            });
        })

    },
    editAdmin:function (req,res) {

        var phone = req.body.phone;
        var adminId = req.params.adminId
        var name = req.body.name;
        var address = req.body.address;
        var schoolLogoUrl = req.body.schoolLogoUrl
        var profilePic = req.body.profilePic

        if(!adminId){
            return res.status(400).json({
                title: 'Admin Id Cant Be Empty',
                msg: 'Please Enter Admin Id'
            });
        }
        var updateData = {name:name,address:address,phone:phone,schoolLogoUrl:schoolLogoUrl,profilePic :profilePic}

        dbhandler.editAdmin(adminId,updateData).then(function (updatedAdmin) {
            res.status(200).json(updatedAdmin)

        },function (errMsg) {
            res.status(400);
            return res.json({
                title: 'Failed To Update Admin',
                msg: errMsg
            });
        }).catch(function (err) {
            res.status(400);
            return res.json({
                title: 'Failed To Update Admin',
                msg: err
            });
        })

    },
    getAdmins:function (req,res) {

        dbhandler.getAdmins().then(function (admins) {

            if(!admins){
                return res.status(404).json({
                    title: 'Admins Not Found',
                    msg: "Admins You Are looking Not Found"
                })
            }

            res.status(200).json(admins)
        },function (errMsg) {
            res.status(400);
            return res.json({
                title: 'Failed To Get Admins',
                msg: errMsg
            });
        }).catch(function (err) {
            res.status(400);
            return res.json({
                title: 'Failed To Get Admins',
                msg: err
            });
        })

    },
    deleteAdmin:function (req,res) {
        var adminId = req.params.adminId
        if(!adminId){
            return res.status(400).json({
                title: 'Failed to Remove Admin',
                msg: "Admin Id required"
            })
        }
        dbhandler.deleteAdmin(adminId).then(function (result) {
            return res.status(200).json(result)

        },function (errMsg) {
            return res.status(400).json({
                status: 400,
                title: 'Failed to Delete Admin',
                msg: errMsg
            });
        });

    },
    sendCodeToChangePassword: function (req,res) {
        var email = req.body.email
        if(!email){
            return res.status(400).json({
                title: 'Email Cant Be Empty',
                msg: 'Please Enter Email To Reset Password'
            });
        }

        dbhandler.sendCodeToChangePassword(email).then(function (result) {
            return res.status(200).json({
                status: 200,
                title:"Code Successfully Sent To registered Email",
                result:result
            });
        },function (errMsg) {
            return res.status(400).json({
                status: 400,
                title: 'Failed to Check User Exists or Not',
                msg: errMsg
            });
        })

    } ,
    verifyCodeToChangePassword: function (req,res) {
        var email = req.body.email
        var code = req.body.code
        if(!email){
            return res.status(400).json({
                title: 'Email Cant Be Empty',
                msg: 'Please Enter Email To Reset Password'
            });
        }
        if(!code){
            return res.status(400).json({
                title: 'Code Cant Be Empty',
                msg: 'Please Enter Code To Reset Password'
            });
        }

        dbhandler.verifyCodeToChangePassword(email,code).then(function (result) {
            return res.status(200).json(result);
        },function (errMsg) {
            return res.status(400).json({
                status: 400,
                title: 'Failed to Reset User Password',
                msg: errMsg
            });
        })

    },
    changePassword: function (req,res) {
        var email = req.body.email
        var password = req.body.password
        password = crypto.createHash('md5').update(password).digest("hex")
        if(!email){
            return res.status(400).json({
                title: 'Email Cant Be Empty',
                msg: 'Please Enter Email To Reset Password'
            });
        }
        if(!password){
            return res.status(400).json({
                title: 'password Cant Be Empty',
                msg: 'Please Enter New password'
            });
        }

        dbhandler.changePassword(email,password).then(function (result) {
            return res.status(200).json(result);
        },function (errMsg) {
            return res.status(400).json({
                status: 400,
                title: 'Failed to Reset User Password',
                msg: errMsg
            });
        })

    }


}

module.exports = authentication