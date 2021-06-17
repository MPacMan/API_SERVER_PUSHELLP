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
const { generateSalt } = require('./utils');


const init = async () => {
    //await client.connect()
    const response = {};

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
            response.error = null;
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
                if(!result.rows[0]){
                    response.error = "You have given a wrong username and/or password";
                    return h.response(response).code(401);
                } //console.log(result);
                // // Compare POST body password to postgresql passsword of user using bcrypt.compare()
                // const match = await bcrypt.compare(password, user[0].password);
                response.body = {
                    username : request.payload.username,
                    //password : request.payload.password,
                    data : result.rows
                }
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
            response.error = null;
            //the request doesn't have all the information for inserting an individual into the database
            if(!request.payload || !request.payload.username || !request.payload.email || !request.payload.password || !request.payload.status){
                response.error = "You must at least give your username, password, email and profile";
                return h.response(response).code(401);
            }
            var text;
            var values;
            var salt = utils.generateRandomSalt();
            var password = utils.hashPassword(request.payload.password, salt);
            console.log("dateToday:");
            var dateToday = utils.formatDate();
            console.log(dateToday);
            if(request.payload.birthday){
                console.log("date birthday:",request.payload.birthday);
                if(!utils.formatDate(request.payload.birthday)){
                    response.error = "The given date has a format incorrect";
                    return h.response(response).code(401);
                }else{
                    var dateBirthday = utils.formatDate()
                    text = "INSERT INTO public.individual(pseudo, email, birthday, status, password, salt, registerdate) VALUES ($1, $2, $3, $4, $5, $6, $7);";
                    values = [request.payload.username, request.payload.email, request.payload.birthday, request.payload.status, password, salt, dateToday];
                }
            }else{
                text = "INSERT INTO public.individual(pseudo, email, status, password, salt, registerdate) VALUES ($1, $2, $3, $4, $5, $6);";
                values = [request.payload.username, request.payload.email, request.payload.status, password, salt, dateToday];
            }
            const query = {
                text: text,
                values: values,
            }
            try{
                const result = await pool.query(query);
                //the insert has not been successful
                if(!result){
                    response.error = "An error occured during the insertion of the user";
                    return h.response(response).code(401);
                }
                return h.response(response).code(200);
            }catch (err) {
                console.log(err.stack)
            }
        }
    });

    server.route({
        method: 'POST',
        path: '/createTicket',
        handler: async (request, h) => {
            response.error = null;
            response.body = [];
            //the request doesn't have all the information for inserting a ticket into the database
            if(!request.payload 
                || !request.payload.title 
                || !request.payload.deadline 
                || !request.payload.priority
                || !request.payload.description
                || !request.payload.idUser){
                response.error = "You must at least give the title, deadline, priority, description and idUser.";
                return h.response(response).code(401);
            }
            
            var values;
            console.log("creationDate: ", utils.formatDate());
            console.log("title: ", request.payload.title );
            console.log("deadline: ", utils.formatDate(request.payload.deadline));
            console.log("priority: ", request.payload.priority );
            console.log("description: ", request.payload.description );
            console.log("idUser: ", request.payload.idUser );

            var text = "INSERT INTO public.ticket(title, creationdate, deadline, status, description, priority, individual_idindividual) VALUES ($1, $2, $3, $4, $5, $6, $7);";
            values = [
                request.payload.title, 
                utils.formatDate(), 
                utils.formatDate(request.payload.deadline), 
                "nouveau", 
                request.payload.description, 
                request.payload.priority,
                request.payload.idUser
            ];
            const query = {
                text: text,
                values: values,
            }
            try{
                const result = await pool.query(query);
                //the insert has not been successful
                if(!result){
                    response.error = "An error occured during the insertion of the ticket";
                    return h.response(response).code(401);
                }
                return h.response(response).code(200);
            }catch (err) {
                console.log(err.stack)
            }
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

    await server.start();
    console.log('Server running on %s', server.info.uri);
    
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();