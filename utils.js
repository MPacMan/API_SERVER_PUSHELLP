//used to generate a salt
var crypto = require('crypto');

//manage error request http
Boom = require('@hapi/boom');

//hash algorithm pbkdf2
var pbkdf2 = require('pbkdf2');


module.exports = {
    // handleAuthenticateToken : async function (request, h) {
    //   // const authHeader = request.headers.authorization;
    //   const authHeader = request.headers['Authorization'];
    //   const token = authHeader && authHeader.split(' ')[1];
  
    //   // have we found a token?
    //   if (token == null) {
    //     throw Boom.badRequest('Token not found');
    //   }
    //   try {
    //     // is the token still valid?
    //     const user = jwt.verify(token, process.env.JWT_KEY);
    //     return user;
    //   } catch (err) {
    //     throw Boom.badRequest('Token invalid');
    //   }
    // },

    /**
     * Function to verify is the format of a given date is correct.
     * Examples of correct format dates:
     * - 2021-06-05
     * - 2021-06-05 10:33:01
     * - 2021-06-05T14:51:06
     * - 2012-11-04T14:51:06.157Z
     * @param {Date} date The date to verify if its format is correct. 
     * @returns true if the format date is correct, false if not.
     */
    verifyDateFormat: function(date){
      return /^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])([T ](\d{2}:){2}\d{2}(\.\d{3}[A-Z])?)?$/.test(date);
    },
    /**
     * Function to create a Date TIMESTAMP with a specific format:
     * new Date().toISOString().replace('T', ' ').substr(0, 19);
     * The line code above removes the letter T, Z and fraction of seconds of format date like 2021-06-005T11:51:00.146Z so we get a Date as 2021-06-005 11:51:00
     * @param {Date?} date An optionnal date to format.
     * @returns the date of today if there is no a given date, or the given date if its format is correct, or null if the date is incorrect. Each date is formatted as YYYY-MM-DD HH:MI:SS.
     */
    formatDate: function(date){
      if(date && !module.exports.verifyDateFormat(date)){
        return null;
      }else if(date && module.exports.verifyDateFormat(date)){
        return new Date(date).toISOString().replace('T', ' ').substr(0, 19);
      }else{
        return new Date().toISOString().replace('T', ' ').substr(0, 19);
      }
    },
    /**
     * Function to generate a random salt
     * @returns A base64 salt
     */
    generateRandomSalt: function(){
      var salt = crypto.randomBytes(16);
      return salt.toString('base64');
    },
    /**
     * Function to hash + salt a given password
     * @param {String} password : The password to be hashed
     * @param {String} salt : The salt used to hash furthermore our password
     * @returns An encoded base64 hashed password
     */
    hashPassword: function (password, salt) {
      console.log("Salt:", salt);
      var derivedKey = pbkdf2.pbkdf2Sync(password, salt, 65536, 24);
      return derivedKey.toString('base64');
    },
    /**
     * Function to verify if a given password in the process of authentication match with the password in database.
     * @param {String} passwordRequest : The given password in the process of authentication
     * @param {Object} hashedPasswordDB : The hashed password stored in database
     * @param {String} salt : The salt stored in database
     * @returns true if the passwords match each other, false otherwise.
     */
    verifyIfPasswordsAreAuthentic: function(passwordRequest, hashedPasswordDB, salt){
      console.log("PasswordRequest:", passwordRequest);
      
      var hashedPasswordRequest = this.hashPassword(passwordRequest, salt);
      console.log("HashedPasswordRequest:", hashedPasswordRequest);
      console.log("HashedPasswordDB     :", hashedPasswordDB);
      console.log(typeof hashedPasswordRequest.toString());
      console.log(typeof hashedPasswordDB);
      if(hashedPasswordRequest.localeCompare(hashedPasswordDB)){ //if the 2 passwords are no equals
        return false;
      }else{
        return true;
      }
    },
    
};