//Write All Mongo Queries Here
var config = require('../config/index');
var mongoose = require('mongoose');
var models = require('../handlers/schema');
var moment = require('moment');
var async = require("async");
var jwt = require('../utils/jwt');
var crypto = require('crypto');
var Hashids = require('hashids');
var hashids = new Hashids();
var shortid = require('shortid');
var utils = require('../utils/utils');

shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@');



mongoose.connect(config.db.host, {
    user: config.db.username, pass: config.db.password, auth: {
        authdb: 'admin'
    }
}, function (err) {
    if (err) {
        console.log("----DATABASE CONNECTION FAILED----", err);
    } else {
        console.log("connected to database" + " " + config.db.database + " ");
    }
});

var db = mongoose.connection.db;

var dbHandler = {

    //admin
    login: function (email, password) {
        return new Promise(function (resolve, reject) {
            models.admins.findOne({email: email, password: password}, {password: 0},function (err, admin) {
                    if (!err) {
                        if(admin){
                            var code = jwt.generateAuthToken(admin);
                            admin = Object.assign({access_token:code},JSON.parse(JSON.stringify(admin)))
                        }
                        resolve(admin)
                    }
                })
        });
    },
    userLogin: function (username, password) {
        return new Promise(function (resolve, reject) {
          return  models.users.aggregate([{$match:{userName: username, password: password}},
              {$lookup:{from:"standards",localField:"paidStandards",foreignField:"_id",as:"paidStandards"}},{$project:{password:0}}
          ],function (err, user) {
              if(!user)return reject("User Not Found")
              user = user.pop()
                    if (!err) {
                        if(user){
                            var code = jwt.generateAuthToken(user);
                            user = Object.assign({access_token:code},JSON.parse(JSON.stringify(user)))
                        }
                       return resolve(user)
                    }
                   return reject(err);
                })
        });
    },
    register: function (admin) {
        return new Promise(function (resolve, reject) {
            return models.admins.findOne({email: admin.email}).then(function (existedAdmin, err) {
                if (existedAdmin) {
                    reject("Email Already Exists")
                }
                if (err) {
                    reject(err);
                }
                return models.admins.create({
                    name: admin.name,
                    email: admin.email,
                    password: admin.password,
                    phone: admin.phone,
                    school: admin.school,
                    address: admin.address,schoolLogoUrl:admin.schoolLogoUrl
                }).then(function (admin, err) {
                    if (!err) {
                        resolve(admin);
                    }
                }).catch(function (error) {
                    reject(error)
                })
            })

        });
    },
    appRegister: function (user) {
        return new Promise(function (resolve, reject) {
            return models.users.findOne({userName: user.username}).then(function (existedUser, err) {
                if (existedUser) {
                   return reject("UserName Already Exists")
                }

                if (err) {
                   return reject(err);
                }
                return models.users.findOne({phone:user.phone}).then(function (existedUser,err) {
                    if(existedUser){
                       return reject("Phone Number Already Exists")
                    }
                    if (err) {
                       return reject(err);
                    }

                   return models.users.findOne({email:user.email}).then(function (existedUser,err) {
                       if (existedUser && user.email) {
                          return reject("Email Already Linked With Another User")
                       }
                       if (err) {
                          return reject(err);
                       }
                        return models.users.create({
                            name:user.name,
                            userName: user.username,
                            email: user.email,
                            password: user.password,
                            phone: user.phone,
                            paymentStatus:"UNPAID",
                            paidStandards:[]
                        }).then(function (user, err) {
                            if (!err) {
                               return resolve(user);
                            }
                        }).catch(function (error) {
                            reject(error)
                        })

                   })
                })

            })

        });
    },
    postVideo: function (video) {
        return new Promise(function (resolve, reject) {
            return models.videos.create({
                    title: video.title,
                    url : video.url,
                    standard: video.standard,
                    subject:video.subject,
                    description:video.description,
                    school:video.school,
                    admin:video.admin,
                    videoThumbnail:video.videoThumbnail,
                    isDemo:false
            }).then(function (video, err) {
                    if (!err) {
                        resolve(video);
                    }
                }).catch(function (error) {
                    reject(error)
                })


        });
    },
    postDemoVideo: function (video,admin) {
        return new Promise(function (resolve, reject) {
            return models.videos.findOne({isDemo:true}).then(function (demoVideo, err) {
                if (err) {
                    return reject(err);
                }
                if(demoVideo){
                   demoVideo.title= video.title
                   demoVideo.videoThumbnail= video.videoThumbnail
                   demoVideo.url = video.url
                   demoVideo.standard= video.standard
                   demoVideo.subject=video.subject
                   demoVideo .description=video.description
                   demoVideo .admin=video.admin
                   demoVideo.save(function (err,updatedDemoVideo) {
                       return resolve(updatedDemoVideo)
                   })
               }else{
                    return models.videos.create(video).then(function (demoVideo,err) {
                        if(err)return reject(err)
                        resolve(demoVideo)
                    })
                }
                }).catch(function (error) {
                    reject(error)
                })
        });
    },
    getVideos: function (admin,filters) {
        var andQuery = []
        var query = {admin:admin._id}
        if(admin.role != config.superAdmin){andQuery.push(query)}
        if(filters.subject && filters.subject.length)andQuery.push({subject :{$in:filters.subject}})
        if(filters.standard && filters.standard.length)andQuery.push({standard :{$in:filters.standard}})
        if(admin.role == config.superAdmin && filters.school && filters.school.length)andQuery.push({school :{$in:filters.school}})
        if(admin.role == config.superAdmin && filters.admin && filters.admin.length)andQuery.push({admin :{$in:filters.admin}})
        var finalQuery = andQuery.length ? {$and:andQuery}:{}

        return new Promise(function (resolve, reject) {
            return models.videos.aggregate([
                // {$lookup:{from:"admins",localField:"admin",foreignField:"_id",as:"fulladmin"}},
                // {$match:{"fulladmin.role":{$ne:"SUPER_ADMIN"}}},{$project:{fulladmin:0}},
                {$match:finalQuery},{$match:{isDemo:false}},
                {$lookup:{from:"schools",localField:"school",foreignField:"_id",as:"school"}},
                {$lookup:{from:"standards",localField:"standard",foreignField:"_id",as:"standard"}},
                {$lookup:{from:"subjects",localField:"subject",foreignField:"_id",as:"subject"}},
                {$addFields:{school:{$arrayElemAt:["$school",0]},standard:{$arrayElemAt:["$standard",0]},
                    subject:{$arrayElemAt:["$subject",0]}}},{$sort:{createdAt:-1}}
            ]).then(function (videos, err) {
                    if (!err) {
                        resolve(videos);
                    }
                }).catch(function (error) {
                    reject(error)
                })
        });
    },
    getDemoVideos: function (admin) {
        return new Promise(function (resolve, reject) {
            return models.videos.aggregate([
                // {$lookup:{from:"admins",localField:"admin",foreignField:"_id",as:"admin"}},
                // {$match:{"admin.role":"SUPER_ADMIN"}},{$project:{admin:0}},
                {$match:{isDemo:true}},
                {$lookup:{from:"standards",localField:"standard",foreignField:"_id",as:"standard"}},
                {$lookup:{from:"subjects",localField:"subject",foreignField:"_id",as:"subject"}},
                {$addFields:{standard:{$arrayElemAt:["$standard",0]},
                    subject:{$arrayElemAt:["$subject",0]}}},{$sort:{createdAt:-1}}
            ]).then(function (videos, err) {
                    if (!err) {
                        resolve(videos);
                    }
                }).catch(function (error) {
                    reject(error)
                })


        });
    },
    getAdminDetails: function (admin) {
        return new Promise(function (resolve, reject) {
            return models.admins.findOne({_id:admin}).then(function (admin, err) {
                if (!err) {
                        resolve(admin);
                    }
                }).catch(function (error) {
                    reject(error)
                })

        });
    },
    getUserDetails: function (admin) {
        return new Promise(function (resolve, reject) {
            return models.admins.findOne({email:admin}).then(function (admin, err) {
                if (!err) {
                        resolve(admin);
                    }
                }).catch(function (error) {
                    reject(error)
                })

        });
    },
    getAppUserDetails: function (userId) {
        return new Promise(function (resolve, reject) {

            console.log("----appuserid-----",userId)
            return models.users.aggregate({$match:{_id:userId}},
                {$lookup:{from:"standards",localField:"paidStandards",foreignField:"_id",as:"paidStandards"}},
                {$project:{password:0}}
            ).then(function (user, err) {
                if(!user)return reject("User Not Found")
                user = user.pop()
                if (!err) {
                        resolve(user);
                    }
                }).catch(function (error) {
                    reject(error)
                })

        });
    },
    getAdmins: function () {
        return new Promise(function (resolve, reject) {
            return models.admins.find({}).then(function (admins, err) {
                if (!err) {
                        resolve(admins);
                    }
                }).catch(function (error) {
                    reject(error)
                })

        });
    },
    getAppUsers: function () {
        return new Promise(function (resolve, reject) {
            return models.users.find({},{password:0}).sort({createdAt:-1}).then(function (users, err) {
                if (!err) {
                    resolve(users);
                }
            }).catch(function (error) {
                reject(error)
            })

        });
    },
    deleteAdmin: function (adminId) {
        return new Promise(function (resolve, reject) {
            return models.admins.remove({_id:adminId}).then(function (data, err) {
                if (!err) {
                    resolve({title:"Deleted Successfully"});
                }
            }).catch(function (error) {
                reject(error)
            })
        });
    },
    deleteAppUser: function (userId) {
        return new Promise(function (resolve, reject) {
            return models.users.remove({_id:userId}).then(function (data, err) {
                if (!err) {
                    resolve({title:"Deleted Successfully"});
                }
            }).catch(function (error) {
                reject(error)
            })
        });
    },
    editAdmin : function (adminId,updateData) {
        return new Promise(function (resolve, reject) {
            return models.admins.update({email:adminId},updateData).then(function (admin, err) {
                if (err) {
                    reject(err);
                }
                resolve(admin)
            }).catch(function (error) {
                reject(error)
            })

        });
    },
    editAppUser : function (userId,updateData) {
        return new Promise(function (resolve, reject) {
            return models.users.update({_id:userId},updateData).then(function (user, err) {
                if (err) {
                    reject(err);
                }
                if(!user.n){
                    return reject("Something Went Wrong,Failed To Update User")
                }
                resolve(user)
            }).catch(function (error) {
                reject(error)
            })

        });
    },
    editVideo : function (videoId,updateData) {
        return new Promise(function (resolve, reject) {
            return models.videos.update({_id:videoId},updateData).then(function (video, err) {
                if (err) {
                    reject(err);
                }
                resolve(video)
            }).catch(function (error) {
                reject(error)
            })

        });
    },
    deleteVideo : function (videoId,admin) {

       var query = ""
        query = {_id:videoId,admin:admin._id}

        if(admin.role == config.superAdmin){
            query = {_id:videoId}
        }

        return new Promise(function (resolve, reject) {
            return models.videos.remove(query).then(function (video, err) {
                if (err) {
                    reject(err);
                }
                if(!video.result.n){
                    reject("Video Not Found")
                }
                resolve("Video Deleted Successfully")

            }).catch(function (error) {
                reject(error)
            })

        });
    },
    addData: function (data,collection) {
        return new Promise(function (resolve, reject) {
            return models[collection].create(data).then(function (data, err) {
                if (!err) {
                    resolve(data);
                }
            }).catch(function (error) {
                reject(error)
            })
        });
    },
    editData: function (id,data,collection) {
        return new Promise(function (resolve, reject) {
            return models[collection].update({_id:id},{name:data.name}).then(function (data, err) {
                if (!err) {
                    resolve(data);
                }
            }).catch(function (error) {
                reject(error)
            })
        });
    },
    deleteData: function (id,collection) {
        return new Promise(function (resolve, reject) {
            return models[collection].remove({_id:id}).then(function (data, err) {
                if (!err) {
                    resolve({title:"Deleted Successfully"});
                }
            }).catch(function (error) {
                reject(error)
            })
        });
    },
    getData: function (collection) {
        return new Promise(function (resolve, reject) {
            return models[collection].find().then(function (data, err) {
                if (!err) {
                    resolve(data);
                }
            }).catch(function (error) {
                reject(error)
            })
        });
    },
    getAppUserVideos: function (user,filters) {
        return new Promise(function (resolve, reject) {
            return models.users.findOne({_id:user}).then(function (user,err) {
                if(err){return reject(err)}
                if(!user){return reject("User Not Found")}

                var andQuery = []

                // var demoVideosQuery = [{$lookup:{from:"admins",localField:"admin",foreignField:"_id",as:"admin"}},
                //                            {$match:{"admin.role":"SUPER_ADMIN"}},{$project:{admin:0}}]


                var demoVideosQuery = [{$match:{isDemo:true}}]

                if(filters.subject && filters.subject.length)andQuery.push({subject :{$in:filters.subject}})

                var standardQuery = {$and:[{standard:{$in:user.paidStandards}}]}

                if(filters.standard && filters.standard.length)standardQuery.$and.push({standard:{$in:filters.standard}})

                andQuery.push(standardQuery);

                var customQuery = (user.paymentStatus == "PAID") ? [{$match:{$and:andQuery}}] :demoVideosQuery

                var aggregateQuery = [
                    {$lookup:{from:"standards",localField:"standard",foreignField:"_id",as:"standard"}},
                    {$lookup:{from:"subjects",localField:"subject",foreignField:"_id",as:"subject"}},
                    {$addFields:{
                        standard:{$arrayElemAt:["$standard",0]},
                        subject:{$arrayElemAt:["$subject",0]}}
                    },
                    {$sort:{createdAt:-1}}]

                 aggregateQuery =   customQuery.concat(aggregateQuery)
                return models.videos.aggregate(aggregateQuery).then(function (videos, err) {
                    if (!err) {
                        resolve(videos);
                    }
                }).catch(function (error) {
                    reject(error)
                })

            })

        });
    },
    addPaidStandards: function (user,standards) {
        return new Promise(function (resolve, reject) {
            var userId = user
            return models.users.findOne({_id:user}).then(function (user, err) {
                if (err) {
                   return reject(user);
                }
                if(!user){
                    return reject("User Not Found")
                }
                user.paidStandards = user.paidStandards.concat(standards);
                    user.paidStandards = user.paidStandards.filter(function(item, pos) {
                        return (user.paidStandards).indexOf(item) == pos;
                    })
                    user.paymentStatus = "PAID"
                    user.save(function (err,result) {
                        if(err){
                            return reject(err);
                        }
                        return dbHandler.getAppUserDetails(userId).then(function (user) {
                            return resolve(user);
                        },function (err) {
                            return reject(err)
                        })
                    })

            }).catch(function (error) {
                reject(error)
            })
        });
    },
    sendCodeToChangePassword: function (email) {
        return new Promise(function (resolve, reject) {

          return  models.admins.findOne({email: email},function (err, admin) {

              console.log(email,admin)
              if(err)return reject(err);
                if(!admin)return reject("Invalid Email ,User Not Found")
                // generating email verification code

                var email_verification_code = shortid.generate()

                var reset_email = "Dear " + admin.name + ",<br> We recieved a password reset request from you ," +
                    " <br> please enter <b>"+ email_verification_code +" </b>to reset your password <br>";
                reset_email += "<br><br> Ignore this email if you did not initiate a password reset request.<br><br>Regards,<br>Team Vr Science";
                return  utils.send_mail(admin.email, config.email.subjects.password_reset, reset_email).then(function (emailResult) {
                    admin.codeToResetPassword = email_verification_code
                    admin.save(function (err,result) {
                        resolve()
                    })

                },function (err) {
                  reject(err);
              });

            })
        });

    },
    verifyCodeToChangePassword:function (email,code) {
        return new Promise(function (resolve,reject) {
            return models.admins.findOne({email:email}).then(function (admin,err) {
                if(err)return reject(err)
                if(!admin)return reject(admin)
                if(admin.codeToResetPassword != code){
                    return reject("Invalid Code");
                }
                return resolve("Valid Code")
            })
        })
    },
    changePassword:function (email,password) {
        return new Promise(function (resolve,reject) {
            return models.admins.findOne({email:email}).then(function (admin,err) {
                if(err)return reject(err)
                if(!admin)return reject(admin)
                admin.password = password
                admin.codeToResetPassword = ""
                admin.save(function (err,admin) {
                    if(err)return reject(err)
                    resolve("Password Changed Successfully")
                })
            })
        })
    },

    //code generator

    generateCode: function (numberOfCodes,paidStandards) {
        return new Promise(function (resolve, reject) {
            var codes = []
            if(Number(numberOfCodes) > 30 ){
                numberOfCodes = 30
            }
            for(i=1;i<=numberOfCodes;i++){
                var code = {
                    code:shortid.generate(),
                    paidStandards:paidStandards ? paidStandards :"",
                    isActive:true
                }
                codes.push(code);
            }

            return models.codes.insertMany(codes,function (err,codes) {
                if(err)return reject(err);
                    resolve(codes)

            })

        });

    },
    getCodes:function () {
        return new Promise(function (resolve, reject) {
            return models.codes.aggregate([{$lookup:{from:"standards",localField:"paidStandards",foreignField:"_id",as:"paidStandards"}},
                {$lookup:{from:"users",localField:"usedBy",foreignField:"_id",as:"usedBy"}},
                {
                    $addFields: {
                        "usedBy": {$arrayElemAt: ["$usedBy.userName", 0]},
                    }
                },  {
                    $addFields: {
                        "paidStandards": {$arrayElemAt: ["$paidStandards.name", 0]}
                    }
                }
            ]).then(function (data, err) {
                if (!err) {
                    resolve(data);
                }
            }).catch(function (error) {
                reject(error)
            })
        });
    },
    applyCode:function (code,standard,user) {
        var userId = user
        return new Promise (function (resolve,reject) {
            return models.codes.findOne({code:code,isActive:true}).then(function (validCode,err) {
                if(err)return reject(err)
                if(!validCode)return reject("Invalid Code");
                if(validCode.paidStandards){
                    if(standard != validCode.paidStandards)return reject("Code Not Valid For Selected Standard");

                }
                return models.users.findOne({_id:user}).then(function (user, err) {
                    if (err) {
                        return reject(user);
                    }
                    if(!user){
                        return reject("User Not Found")
                    }
                    user.paidStandards.push(standard);
                    user.paidStandards = user.paidStandards.filter(function(item, pos) {
                        return (user.paidStandards).indexOf(item) == pos;
                    })
                    user.paymentStatus = "PAID"
                    user.save(function (err,result) {
                        if(err){
                            return reject(err);
                        }
                        return models.codes.update({code:code},{isActive:false,usedBy:userId,usedOn:new Date()}).then(function (result,err) {
                            if(err){
                                return reject(err);
                            }
                            return dbHandler.getAppUserDetails(userId).then(function (user) {
                                return resolve(user);
                            },function (err) {
                                return reject(err)
                            })

                        })

                    })

                })


            })

        })

    }

}


module.exports = dbHandler







