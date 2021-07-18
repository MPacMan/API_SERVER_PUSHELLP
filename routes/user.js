//prendre en compte les variables dans .env
require('dotenv').config();

//connection de la bdd Postgres
const { Pool, Client } = require('pg');
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({
  connectionString,
})

var utils = require('../utils');
const response = {};
module.exports = [
    {
        method: 'POST',
        path: '/signup',
        handler: async (request, h) => {
            response.error = null;
            response.body = [];
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
                response.body = {
                    username : request.payload.username,
                    data : result.rows
                }
                return h.response(response).code(200);
            }catch (err) {
                console.log(err.stack)
                response.error = err;
                return h.response(response).code(400);
            }
        }
    },
    {
        method: 'POST',
        path: '/login',
        handler: async (request, h) => {
            response.error = null;
            response.body = [];
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
                if(!utils.verifyIfPasswordsAreAuthentic(request.payload.password, result.rows[0].password, result.rows[0].salt)){
                    console.log("The password are not authentic");
                    response.error = "You have given a wrong username and/or password";
                    return h.response(response).code(401);
                }
                response.body = {
                    username : request.payload.username,
                    data : result.rows
                }
                return h.response(response).code(200);
            }catch (err) {
                console.log(err.stack)
                response.error = err;
                return h.response(response).code(400);
            }
            
        }
    },
    {
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
                response.error = err;
                return h.response(response).code(400);
            }
        }
    },
    {
        method: 'GET',
        path: '/getIndividualsByStatus',
        handler: async (request, h) => {
            response.error = null;
            response.body = [];
            //the request doesn't have all the information for getting a list of users from the database
            if(!request.query || !request.query.status){
                response.error = "You must at least give a status.";
                return h.response(response).code(401);
            }
            var status = request.query.status;
            if(status !== "programmer" && status !== "client" && status !== "admin" && status !== "superadmin"){
                response.error = "The given status doesn't figure in our list of status";
                return h.response(response).code(401);
            }
            var values;
            var text = "SELECT * FROM public.individual WHERE status = $1;";
            values = [
                status
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
                response.error = err;
                return h.response(response).code(400);
            }
        }
    },
    {
        method: 'PUT',
        path: '/setUserStatusAdminByIdUser',
        handler: async (request, h) => {
            response.error = null;
            response.body = [];
            //the request doesn't have all the information for updating an user into the database
            if(!request.payload 
                || !request.payload.idUserToPromote 
                || !request.payload.idUserWhoPromotes){
                response.error = "You must at least give the idUsers.";
                return h.response(response).code(401);
            }
            
            var values;
            var text = "UPDATE public.individual SET status = $1, individual_idindividual = $2 WHERE idindividual = $3 AND status = $4;";
            values = [
                "admin", 
                request.payload.idUserWhoPromotes, 
                request.payload.idUserToPromote,
                "client"
            ];
            const query = {
                text: text,
                values: values,
            }
            try{
                const result = await pool.query(query);
                //the update has not been successful
                if(!result){
                    response.error = "An error occured during the update of the user";
                    return h.response(response).code(401);
                }
                response.body = {
                    data : result.rows
                }
                return h.response(response).code(200);
            }catch (err) {
                console.log(err.stack)
                response.error = err;
                return h.response(response).code(400);
            }
        }
    },
    {
        method: 'DELETE',
        path: '/deleteUserById',
        handler: async (request, h) => {
            response.error = null;
            response.body = [];
            //the request doesn't have all the information for deleting an user from the database
            if(!request.payload 
                || !request.payload.idUser){
                response.error = "You must at least give the idUser.";
                return h.response(response).code(401);
            }
            
            var values;
            var text = "DELETE FROM public.individual WHERE idindividual = $1 AND (status = $2 OR status = $3);"; //to delete a user, we must have his id and his status must be either "client" or "admin"
            values = [
                request.payload.idUser,
                "admin", 
                "client"
            ];
            const query = {
                text: text,
                values: values,
            }
            try{
                const result = await pool.query(query);

                //the deletion has not been successful
                if(!result){
                    response.error = "An error occured during the deletion of the user";
                    return h.response(response).code(401);
                }
                response.body = {
                    data : result.rows
                }
                return h.response(response).code(200);
            }catch (err) {
                console.log(err.stack)
                response.error = err;
                return h.response(response).code(400);
            }
        }
    }
];