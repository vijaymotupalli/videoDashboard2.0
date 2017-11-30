var mongoose = require('mongoose'),
materializedPathPlugin = require('mongoose-materialized'),
    customId = require('mongoose-hook-custom-id');

// Creating  Schemas

var adminSchema = new mongoose.Schema({
    name:{ type: String},
    email:{ type: String ,required: true},
    password:{ type: String ,required: true},
    phone:{ type: String },
    school:{ type: String },
    schoolLogoUrl:{ type: String },
    address:{ type: String },
    codeToResetPassword:{type:String},
    profilePic:{type:String},
    addedBy:{type:String},
    role:{type:String}
},{ versionKey: false , timestamps: true});

var userSchema = new mongoose.Schema({
    name:{type:String},
    userName:{ type: String},
    email:{ type: String},
    password:{ type: String ,required: true},
    phone:{ type: String },
    paidStandards:[mongoose.Schema.Types.Mixed],
    paymentStatus:{ type: String,required:true},
},{ versionKey: false , timestamps: true});

var videoSchema = new mongoose.Schema({
    title:{ type: String,required: true},
    url:{ type: String,required: true},
    standard:{ type: String ,required: true},
    subject:{ type: String ,required: true},
    description:{ type: String },
    admin:{ type: String,required: true },
    videoThumbnail:{ type: String},
    isDemo:{type:Boolean,defaultValue:false}
},{ versionKey: false , timestamps: true});

var schoolSchema = new mongoose.Schema({
    name:{type: String,required: true}
})
var standardSchema = new mongoose.Schema({
    name:{type: Number,required: true}
})
var subjectSchema = new mongoose.Schema({
    name:{type: String,required: true},
    image:{type: String}
})

var codeSchema = new mongoose.Schema({
    paidStandards:{type:String},
    institute:{type:String},
    codes:[new mongoose.Schema({
        usedBy:{type:String},
        usedOn :{type:Date},
        code:{type:String,required:true}
    },{_id:false})]
},{ versionKey: false , timestamps: true})


//plugins
adminSchema.plugin(customId, {mongoose: mongoose});
videoSchema.plugin(customId, {mongoose: mongoose});
schoolSchema.plugin(customId, {mongoose: mongoose});
subjectSchema.plugin(customId, {mongoose: mongoose});
standardSchema.plugin(customId, {mongoose: mongoose});
userSchema.plugin(customId, {mongoose: mongoose});
codeSchema.plugin(customId, {mongoose: mongoose});

//models

var admins = mongoose.model('admins',adminSchema,'admins');
var users = mongoose.model('users',userSchema,'users');
var videos = mongoose.model('videos',videoSchema,'videos');
var schools = mongoose.model('schools',schoolSchema,'schools');
var subjects = mongoose.model('subjects',subjectSchema,'subjects');
var standards = mongoose.model('standards',standardSchema,'standards');
var codes = mongoose.model('codes',codeSchema,'codes');


//exports

exports.admins = admins;
exports.users = users;
exports.videos = videos;
exports.schools = schools;
exports.standards = standards;
exports.subjects = subjects;
exports.codes = codes;


