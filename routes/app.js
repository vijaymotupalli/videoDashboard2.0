var users = require('../models/app/user');
var videos = require('../models/app/videos');
var codes = require('../models/admin/codeGenerator');


module.exports = function (app) {

    app.post('/app/login/',users.login);
    app.put('/app/users/addpaidstandards/:userId*?',users.addPaidStandards);
    app.post('/app/users/applycode/:userId*?',codes.applyCode);
    app.post('/app/users/',users.createUser);
    app.get('/app/users/',users.getAppUsers);
    app.put('/app/users/:userId*?',users.editAppUser);
    app.delete('/app/users/:userId',users.deleteAppUser);
    app.get('/app/users/:userId*?',users.getAppUserDetails);

    //for app
    app.get('/app/getuserdetails/:userId*?',users.getAppUserDetails);
    app.put('/app/edituserdetails/:userId*?',users.editAppUser);


    app.post('/app/videos/applyfilter',videos.getAppUserVideos);

    app.get('/app/demovideos',videos.getDemoVideos);





}




