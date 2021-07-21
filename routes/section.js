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
        path: '/createSection',
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
    }
];