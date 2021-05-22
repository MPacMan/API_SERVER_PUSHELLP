
module.exports = {
    Boom = require('@hapi/boom'),
    handleAuthenticateToken : async function (request, h) {
        // const authHeader = request.headers.authorization;
        const authHeader = request.headers['Authorization'];
        const token = authHeader && authHeader.split(' ')[1];
    
        // have we found a token?
        if (token == null) {
          throw Boom.badRequest('Token not found');
        }
        try {
          // is the token still valid?
          const user = jwt.verify(token, process.env.JWT_KEY);
          return user;
        } catch (err) {
          throw Boom.badRequest('Token invalid');
        }
      },
    foo: function () {
      // whatever
    }
};