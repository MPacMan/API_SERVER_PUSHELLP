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
                response.error = err;
                return h.response(response).code(400);
            }
        }
    },
    {
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
                response.error = err;
                return h.response(response).code(400);
            }
        }
    },
    {
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
                response.error = err;
                return h.response(response).code(400);
            }
        }
    },
    {
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
                response.error = err;
                return h.response(response).code(400);
            }
        }
    },
    {
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
                response.error = err;
                return h.response(response).code(400);
            }
        }
    }
];