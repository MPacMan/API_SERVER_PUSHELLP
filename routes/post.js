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
        path: '/createPost',
        handler: async (request, h) => {
            response.error = null;
            response.body = [];
            //the request doesn't have all the information for inserting a section into the database
            if(!request.payload 
                || !request.payload.title 
                || !request.payload.content
                || !request.payload.idSection){
                response.error = "You must at least give the title, content and idSection.";
                return h.response(response).code(401);
            }
            var values;
            var text = "INSERT INTO public.post(title, content, numberpush, creationdate, isreceivedreport, section_idsection) VALUES ($1, $2, $3, $4, $5, $6);";
            values = [
                request.payload.title.trim(),  
                request.payload.content.trim(),
                0,
                utils.formatDate(),
                0,
                request.payload.idSection
            ];
            const query = {
                text: text,
                values: values,
            }
            try{
                const result = await pool.query(query);
                //the insert has not been successful
                if(!result){
                    response.error = "An error occured during the insertion of the post";
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
        path: '/getPostsByIdSection',
        handler: async (request, h) => {
            response.error = null;
            response.body = [];
            //the request doesn't have all the information for getting a list of users from the database
            if(!request.query || !request.query.idSection){
                response.error = "You must at least give a idSection.";
                return h.response(response).code(401);
            }
            var id = parseInt(request.query.idSection, 10);
            var text = "SELECT * FROM public.post WHERE section_idsection = $1 ORDER BY idpost DESC;";
            var values = [
                id
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