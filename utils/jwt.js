var jwt = require('jwt-simple');
var config = require('../config/index')

var _jwt={

    generateAuthToken:function (user) {

        var dateObj = new Date();
        var expires = dateObj.setDate(dateObj.getDate() + config.auth.admin.tokenExpiry) // 7 days

        var token = jwt.encode({
            exp: expires,
            user:user
        },config.auth.admin.authSecret);

        return token;
    },

    decodeBearerToken:function(token){
        return  jwt.decode(token, config.auth.admin.authSecret);
    },
    decodeToken:function(token){
        return  jwt.decode(token, config.auth.admin.authSecret);
    },

    decodeBasicToken:function(token){
        var base_64_decoded = Buffer.from(token, 'base64');
        var _token = base_64_decoded.toString().split(':');
        return token = {
            username : _token[0],
            password : _token[1]
        }

    },

}

module.exports = _jwt;