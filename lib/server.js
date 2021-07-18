'use strict';

//prendre en compte les variables dans .env
require('dotenv').config();

//connection de la bdd Postgres
const { Pool, Client } = require('pg');
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({
  connectionString,
})

const PORT = process.env.PORT || 3000;

//jeton JWT
var jwt = require('jsonwebtoken');


const Hapi = require('@hapi/hapi');

var utils = require('../utils');
const { generateSalt } = require('../utils');

const server = Hapi.server({
    port: PORT,
    host: '0.0.0.0'
});
var user = require('../routes/user');
var commentary = require('../routes/commentary');
var ticket = require('../routes/ticket');

server.route({
    method: 'GET',
    path: '/',
    handler: (request, h) => {

        return 'Hello World!';
    }
});
server.route(user);
server.route(ticket);
server.route(commentary);
 // server.route({
    //     method: 'GET',
    //     path: '/',
    //     options: {
    //         pre: [
    //           { method: handleAuthenticateToken, assign: 'auth', failAction: 'log' },
    //         ],
    //     },
    //     handler: (request, h) => {
    //     // the user is not connected
    //     if (request.pre.auth.output) {
    //         response.error = 'Utilisateur non connecté';
    //         return h.response(response).code(401);
    //     }
    //     // is the data in the token have the user id?
    //     if (!request.pre.auth.id) {
    //         response.error = 'Pas d\'id trouvé';
    //         return h.response(response).code(401);
    //     }
    //         return 'Hello World!';
    //     }
    // });

exports.init = async () => {
    await server.initialize();
    return server;
    
};
exports.start = async () => {
    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
    return server;
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

//init();