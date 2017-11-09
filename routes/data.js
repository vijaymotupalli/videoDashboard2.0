var data = require('../models/admin/data');

module.exports = function (app) {

    app.get('/data/schools',data.getSchools);
    app.get('/data/subjects',data.getSubjects);
    app.get('/data/standards',data.getStandards);

    app.post('/data/schools',data.addSchool);
    app.post('/data/subjects',data.addSubject);
    app.post('/data/standards',data.addStandard);

    app.put('/data/schools/:schoolId',data.editSchool);
    app.put('/data/subjects/:subjectId',data.editSubject);
    app.put('/data/standards/:standardId',data.editStandard);

    app.delete('/data/schools/:schoolId',data.deleteSchool);
    app.delete('/data/subjects/:subjectId',data.deleteSubject);
    app.delete('/data/standards/:standardId',data.deleteStandard);

}




