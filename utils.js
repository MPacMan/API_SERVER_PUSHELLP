
//manage error request http
Boom = require('@hapi/boom')

//hash algorithm pbkdf2
var pbkdf2 = require('pbkdf2')


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
     * function to hash + salt a given password
     * @param {String} password : the password to be hashed
     * @param {String} salt : the salt used to hash furthermore our password
     * @returns an encoded base64 hashed password
     */
    hashPassword: function (password, salt) {
      console.log("Salt:", salt);
      console.log(typeof salt);

      var derivedKey = pbkdf2.pbkdf2Sync(password, salt, 65536, 24);
      return derivedKey.toString('base64');
    },
    /**
     * function to verify if a given password in the process of authentication match with the password in database.
     * @param {String} passwordRequest : the given password in the process of authentication
     * @param {Object} hashedPasswordDB : the hashed password stored in database
     * @param {String} salt : the salt stored in database
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