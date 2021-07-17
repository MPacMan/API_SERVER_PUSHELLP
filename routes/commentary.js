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
                response.error = err;
                return h.response(response).code(400);
            }
        }
    },
    {
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
                response.error = err;
                return h.response(response).code(400);
            }
        }
    }
    
];