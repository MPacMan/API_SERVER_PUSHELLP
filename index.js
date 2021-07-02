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
                }
                const result = await pool.query(query);
                //user not found in db
                if(!result.rows[0]){
                    response.error = "You have given a wrong username and/or password";
                    return h.response(response).code(401);
                } 
                response.body = {
                    username : request.payload.username,
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
            var dateToday = utils.formatDate();
            if(request.payload.birthday){
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
                || !request.payload.idUser
                || !request.payload.platform){
                response.error = "You must at least give the title, deadline, priority, description, idUser and platform.";
                return h.response(response).code(401);
            }
            
            var values;
            var text = "INSERT INTO public.ticket(title, creationdate, deadline, status, description, priority, individual_idindividual, application_platformapplication) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);";
            values = [
                request.payload.title, 
                utils.formatDate(), 
                utils.formatDate(request.payload.deadline), 
                "nouveau", 
                request.payload.description, 
                request.payload.priority,
                request.payload.idUser,
                request.payload.platform
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
        method: 'POST',
        path: '/createCommentary',
        handler: async (request, h) => {
            response.error = null;
            response.body = [];
            //the request doesn't have all the information for inserting a commentary into the database
            if(!request.payload 
                || !request.payload.text 
                || !request.payload.idTicket
                || !request.payload.idUser){
                response.error = "You must at least give the text, idUser and idTicket.";
                return h.response(response).code(401);
            }
            
            var values;
            var text = "INSERT INTO public.commentary(text, datecreation, individual_idindividual, ticket_idticket)VALUES ($1, $2, $3, $4);";
            values = [
                request.payload.text, 
                utils.formatDate(), 
                request.payload.idUser, 
                request.payload.idTicket,
            ];
            const query = {
                text: text,
                values: values,
            }
            try{
                const result = await pool.query(query);
                //the insert has not been successful
                if(!result){
                    response.error = "An error occured during the insertion of the commentary";
                    return h.response(response).code(401);
                }
                return h.response(response).code(200);
            }catch (err) {
                console.log(err.stack)
            }
        }
    });
    server.route({
        method: 'PUT',
        path: '/setTicketStatus',
        handler: async (request, h) => {
            response.error = null;
            response.body = [];
            //the request doesn't have all the information for updating a ticket into the database
            if(!request.payload 
                || !request.payload.idTicket 
                || !request.payload.status){
                response.error = "You must at least give the idTicket and the new status.";
                return h.response(response).code(401);
            }
            
            var values;
            var dateToday = utils.formatDate();
            var text = "UPDATE public.ticket SET status = $1, updatedate = $2 WHERE idticket = $3;";
            values = [
                request.payload.status, 
                dateToday, 
                request.payload.idTicket
            ];
            const query = {
                text: text,
                values: values,
            }
            try{
                const result = await pool.query(query);
                //the update has not been successful
                if(!result){
                    response.error = "An error occured during the update of the ticket";
                    return h.response(response).code(401);
                }
                response.body = {
                    status : request.payload.status,
                    updateDate : dateToday,
                    data : result.rows
                }
                return h.response(response).code(200);
            }catch (err) {
                console.log(err.stack)
            }
        }
    });
    server.route({
        method: 'PUT',
        path: '/setTicketPlatform',
        handler: async (request, h) => {
            response.error = null;
            response.body = [];
            //the request doesn't have all the information for updating a ticket into the database
            if(!request.payload 
                || !request.payload.idTicket 
                || !request.payload.platform){
                response.error = "You must at least give the idTicket and the new platform.";
                return h.response(response).code(401);
            }
            
            var values;
            var dateToday = utils.formatDate();
            var text = "UPDATE public.ticket SET application_platformapplication = $1, updatedate = $2 WHERE idticket = $3;";
            values = [
                request.payload.platform, 
                dateToday, 
                request.payload.idTicket
            ];
            const query = {
                text: text,
                values: values,
            }
            try{
                const result = await pool.query(query);
                //the update has not been successful
                if(!result){
                    response.error = "An error occured during the update of the ticket";
                    return h.response(response).code(401);
                }
                response.body = {
                    status : request.payload.status,
                    updateDate : dateToday,
                    data : result.rows
                }
                return h.response(response).code(200);
            }catch (err) {
                console.log(err.stack)
            }
        }
    });
    server.route({
        method: 'PUT',
        path: '/setTicketIdIndividual',
        handler: async (request, h) => {
            response.error = null;
            response.body = [];
            //the request doesn't have all the information for updating a ticket into the database
            if(!request.payload 
                || !request.payload.idTicket 
                || !request.payload.idUser){
                response.error = "You must at least give the idTicket and the idUser.";
                return h.response(response).code(401);
            }
            
            var values;
            var dateToday = utils.formatDate();
            var text = "UPDATE public.ticket SET updatedate = $1, individual_idindividual = $2 WHERE idticket = $3;";
            values = [
                dateToday, 
                request.payload.idUser, 
                request.payload.idTicket
            ];
            const query = {
                text: text,
                values: values,
            }
            try{
                const result = await pool.query(query);
                //the update has not been successful
                if(!result){
                    response.error = "An error occured during the update of the ticket";
                    return h.response(response).code(401);
                }
                response.body = {
                    idUser : request.payload.idUser,
                    updateDate : dateToday,
                    data : result.rows
                }
                return h.response(response).code(200);
            }catch (err) {
                console.log(err.stack)
            }
        }
    });
    server.route({
        method: 'GET',
        path: '/getTicketListByStatus',
        handler: async (request, h) => {
            response.error = null;
            response.body = [];
            //the request doesn't have all the information for getting a ticket from the database
            if(!request.query || !request.query.status){
                response.error = "You must at least give the ticket status.";
                return h.response(response).code(401);
            }
            
            var values;
            var text = "SELECT * FROM public.ticket WHERE status = $1 ORDER BY idticket ASC";
            values = [
                request.query.status
            ];
            const query = {
                text: text,
                values: values,
            }
            try{
                const result = await pool.query(query);
                //the selection has not been successful
                if(!result.rows[0]){
                    response.error = "An error occured during the selection of the ticket";
                    return h.response(response).code(401);
                }
                response.body = {
                    data : result.rows
                }
                return h.response(response).code(200);
            }catch (err) {
                console.log(err.stack)
            }
        }
    });

    server.route({
        method: 'GET',
        path: '/getCommentaryListByIdTicket',
        handler: async (request, h) => {
            response.error = null;
            response.body = [];
            //the request doesn't have all the information for getting a commentary from the database
            if(!request.query || !request.query.idTicket){
                response.error = "You must at least give the id ticket.";
                return h.response(response).code(401);
            }
            
            var values;

            var text = "SELECT * FROM public.commentary WHERE ticket_idticket = $1 ORDER BY datecreation ASC;";
            values = [
                request.query.idTicket
            ];
            const query = {
                text: text,
                values: values,
            }
            try{
                const result = await pool.query(query);
                response.body = {
                    data : result.rows
                }
                return h.response(response).code(200);
            }catch (err) {
                console.log(err.stack)
            }
        }
    });
    server.route({
        method: 'GET',
        path: '/getIndividualById',
        handler: async (request, h) => {
            response.error = null;
            response.body = [];
            //the request doesn't have all the information for getting an user from the database
            if(!request.query || !request.query.idUser){
                response.error = "You must at least give the id user.";
                return h.response(response).code(401);
            }
            
            var values;
            var text = "SELECT * FROM public.individual WHERE idindividual = $1;";
            values = [
                request.query.idUser
            ];
            const query = {
                text: text,
                values: values,
            }
            try{
                const result = await pool.query(query);
                response.body = {
                    data : result.rows
                }
                return h.response(response).code(200);
            }catch (err) {
                console.log(err.stack)
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