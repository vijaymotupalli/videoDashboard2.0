
var nodemailer = require('nodemailer');

var config = require("../config/index");


var util = {


	send_mail:function(email,subject,message){

		return new Promise (function (resolve,reject) {

				var mailOptions = {
				from: config.email.from, // sender address
				to: email, // list of receivers
				subject: subject, // Subject line
				text: 'Test mail from nodejs', // plaintext body
				html: message // html body
			};

			var transporter = nodemailer.createTransport({
				service: 'Gmail',
				auth: {
					user: config.email.username,
					pass: config.email.password
				},
				secure:false,
				tls: {
					rejectUnauthorized: false
				}
			});

			return transporter.sendMail(mailOptions, function(error, info){
				if(error){
					console.log("Error sending email:"+error);
					status = false;
					console.log('Status from transporter fail :'+status);
					//callback(false);
					reject(status)
				}else{
					console.log('Message sent: ' + info.response);
					status = true;
					console.log('Status from transporter pass :'+status);
					//callback(true);
					resolve(status);
				}
			});

		// return	transporter.sendMail(mailOptions, function(error, info){
		// 	if(error)return reject(error)
		// 	resolve(info)
		// });

	})
	}

}

module.exports = util;
