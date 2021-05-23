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

var utils = require('./utils');


const init = async () => {
    //await client.connect()
    const response = {};
    response.error = null;

    const server = Hapi.server({
        port: PORT,
        host: '0.0.0.0'
    });

    server.route({
        method: 'GET',
        path: '/',
        handler: (request, h) => {

            return 'Hello World!';
        }
    });
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
    server.route({
        method: 'POST',
        path: '/login',
        handler: async (request, h) => {
            //the request doesn't have the username or password
            if(!request.payload || !request.payload.username || !request.payload.password){
                response.error = "You must give a username and password";
                return h.response(response).code(401);
            }
            try {
                const query = {
                    text: "SELECT * FROM public.individual WHERE pseudo = $1;",
                    values: [request.payload.username],
                    //rowMode: 'array',
                }
                const result = await pool.query(query);
                //user not found in db
                if(!result){
                    response.error = "You have given a wrong username and/or password";
                    return h.response(response).code(401);
                }
                // // Compare POST body password to postgresql passsword of user using bcrypt.compare()
                // const match = await bcrypt.compare(password, user[0].password);
                response.body = {
                    username : request.payload.username,
                    password : request.payload.password,
                    data : result.rows
                }
                console.log(response.body);
                if(!utils.verifyIfPasswordsAreAuthentic(request.payload.password, result.rows[0].password, result.rows[0].salt)){
                    console.log("The password are not authentic");
                    response.error = "You have given a wrong username and/or password";
                    return h.response(response).code(401);
                }
                console.log("The password are authentic!");
                //await pool.end()
                return h.response(response).code(200);
            } catch (err) {
                console.log(err.stack)
            }
            
        }
    });
    server.route({
        method: 'POST',
        path: '/signup',
        handler: async (request, h) => {
            //the request doesn't have the username or password
            if(!request.payload || !request.payload.username || !request.payload.password){
                response.error = "You must give a username and password";
                return h.response(response).code(401);
            }
            let query = "INSERT INTO public.individual('Ludo', status, password, salt, registerdate) VALUES (?, ?, ?, ?, ?);";
            const result = await request.pg.client.query(query);
            //user not found in db
            if(!result){
                response.error = "You have given a wrong username and/or password";
                return h.response(response).code(401);
            }
            // Compare POST body password to postgresql passsword of user using bcrypt.compare()
            const match = await bcrypt.compare(password, user[0].password);
            return 'Hello World!';
        }
    });

    server.route({
        method: 'GET',
        path: '/testBdd',
        handler: async (request, h) => {
            //let email = 'test@test.net';
            let select = `SELECT * FROM public.individual ORDER BY idindividual ASC `;

            try {
                const result = await request.pg.client.query(select);
                console.log(result);
                return h.response(result.rows[0]);
            } catch (err) {
                console.log(err);
            }
        }
    });

    // server.route({
    //     method: 'PUT',
    //     path: '/test',
    //     handler: async (request, h) => {
    //         var response = {};
    //         response.error = null;
    //         try{
    //             const collectionNotes = client.db("API_SERVER").collection('users');
    //             await collectionNotes.insertOne({
    //                 userId: request.payload.id,
    //                 username: request.payload.username,
    //                 createdAt: Date(),
    //             });
    //             const docs = await collectionNotes.find({}, {sort: {_id: -1}, limit: 1 }).toArray(); //trouver le dernier document de user venant d'être créé
    //             response.user = docs;
    //             return h.response(response).code(200);
    //         }catch(err){
    //             response.error = 'Error in Database';
    //             return h.response(response).code(401);
    //         }
    //     }
    // });

    await server.start();
    console.log('Server running on %s', server.info.uri);
    
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();