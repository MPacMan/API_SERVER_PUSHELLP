'use strict';

//prendre en compte les variables dans .env
require('dotenv').config()

//connection de la bdd Postgres
const HapiPostgresConnection = require('hapi-postgres-connection');

const PORT = process.env.PORT || 3000;

//jeton JWT
var jwt = require('jsonwebtoken');

//hash algorithm pbkdf2
var pbkdf2 = require('pbkdf2')

const Hapi = require('@hapi/hapi');

const init = async () => {
    const response = {};
    response.error = null;

    const server = Hapi.server({
        port: PORT,
        host: '0.0.0.0'
    });

    await server.register({
        plugin: HapiPostgresConnection
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
            // let query = "SELECT * FROM public.individual WHERE pseudo = 'Ludovic';";
            // const result = await request.pg.client.query(query);
            // //user not found in db
            // if(!result){
            //     response.error = "You have given a wrong username and/or password";
            //     return h.response(response).code(401);
            // }
            // // Compare POST body password to postgresql passsword of user using bcrypt.compare()
            // const match = await bcrypt.compare(password, user[0].password);
            response.body = {
                username : request.payload.username,
                password : request.payload.password
            }
            console.log(response.body);
            return h.response(response).code(200);
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