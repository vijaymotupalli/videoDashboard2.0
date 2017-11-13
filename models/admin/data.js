/**
 * Created by Vijay on 27-Jun-17.
 */
var dbhandler = require('../../handlers/dbhandler');
var config = require('../../config/index');


var data = {


    addSchool:function (req,res) {
        var schoolData = {name:req.body.name}
        dbhandler.addData(schoolData,"schools").then(function (school) {
            return res.status(200).json(school)

        },function (errMsg) {
            return res.status(400).json({
                status: 400,
                title: 'Failed to Add School',
                msg: errMsg
            });
        });

    },
    editSchool:function (req,res) {
        var schoolId = req.params.schoolId
        if(!schoolId){
            return res.status(400).json({
                title: 'Failed to Edit School',
                msg: "School Id required"
            })
        }

        var schoolData = {name:req.body.name}
        dbhandler.editData(schoolId,schoolData,"schools").then(function (school) {
            return res.status(200).json(school)

        },function (errMsg) {
            return res.status(400).json({
                status: 400,
                title: 'Failed to Edit School',
                msg: errMsg
            });
        });

    },
    deleteSchool:function (req,res) {
        var schoolId = req.params.schoolId
        if(!schoolId){
            return res.status(400).json({
                title: 'Failed to Edit School',
                msg: "School Id required"
            })
        }

        dbhandler.deleteData(schoolId,"schools").then(function (school) {
            return res.status(200).json(school)

        },function (errMsg) {
            return res.status(400).json({
                status: 400,
                title: 'Failed to Delete School',
                msg: errMsg
            });
        });

    },
    getSchools:function (req,res) {

        return dbhandler.getData("schools").then(function (schools) {
            return res.status(200).json(schools)

        },function (errMsg) {
            return res.status(400).json({
                status: 400,
                title: 'Failed to Get Schools',
                msg: errMsg
            });
        });

    },
    addSubject:function (req,res) {
        var subjectData = {name:req.body.name,image:req.body.image}
        console.log(subjectData)
        dbhandler.addData(subjectData,"subjects").then(function (subject) {
            return res.status(200).json(subject)

        },function (errMsg) {
            return res.status(400).json({
                status: 400,
                title: 'Failed to Add subject',
                msg: errMsg
            });
        });

    },
    getSubjects:function (req,res) {

        return dbhandler.getData("subjects").then(function (subjects) {
            return res.status(200).json(subjects)

        },function (errMsg) {
            return res.status(400).json({
                status: 400,
                title: 'Failed to Get subjects',
                msg: errMsg
            });
        });

    },
    editSubject:function (req,res) {
        var subjectId = req.params.subjectId
        if(!subjectId){
            return res.status(400).json({
                title: 'Failed to Edit Subject',
                msg: "Subject Id required"
            })
        }
        var subjectData = {name:req.body.name}
        dbhandler.editData(subjectId,subjectData,"subjects").then(function (subject) {
            return res.status(200).json(subject)

        },function (errMsg) {
            return res.status(400).json({
                status: 400,
                title: 'Failed to Edit subject',
                msg: errMsg
            });
        });

    },
    deleteSubject:function (req,res) {
        var subjectId = req.params.subjectId
        if(!subjectId){
            return res.status(400).json({
                title: 'Failed to Edit Subject',
                msg: "Subject Id required"
            })
        }
        dbhandler.deleteData(subjectId,"subjects").then(function (subject) {
            return res.status(200).json(subject)

        },function (errMsg) {
            return res.status(400).json({
                status: 400,
                title: 'Failed to Delete subject',
                msg: errMsg
            });
        });

    },
    addStandard:function (req,res) {
        var standardData = {name:req.body.name}
        dbhandler.addData(standardData,"standards").then(function (standard) {
            return res.status(200).json(standard)

        },function (errMsg) {
            return res.status(400).json({
                status: 400,
                title: 'Failed to Add standard',
                msg: errMsg
            });
        });

    },
    getStandards:function (req,res) {

        return dbhandler.getData("standards").then(function (standards) {
            return res.status(200).json(standards)
        },function (errMsg) {
            return res.status(400).json({
                status: 400,
                title: 'Failed to Get standards',
                msg: errMsg
            });
        });

    },
    editStandard:function (req,res) {
        var standardId = req.params.standardId
        if(!standardId){
            return res.status(400).json({
                title: 'Failed to Edit Subject',
                msg: "Subject Id required"
            })
        }
        var standardData = {name:req.body.name}
        dbhandler.editData(standardId,standardData,"standards").then(function (standard) {
            return res.status(200).json(standard)

        },function (errMsg) {
            return res.status(400).json({
                status: 400,
                title: 'Failed to Edit standard',
                msg: errMsg
            });
        });

    },
    deleteStandard:function (req,res) {
        var standardId = req.params.standardId
        if(!standardId){
            return res.status(400).json({
                title: 'Failed to Edit Subject',
                msg: "Subject Id required"
            })
        }
        dbhandler.deleteData(standardId,"standards").then(function (standard) {
            return res.status(200).json(standard)

        },function (errMsg) {
            return res.status(400).json({
                status: 400,
                title: 'Failed to Delete standard',
                msg: errMsg
            });
        });

    },



}


module.exports = data

