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
            //the request doesn't have all the information for inserting a section into the database
            if(!request.payload 
                || !request.payload.title 
                || !request.payload.description){
                response.error = "You must at least give the title and description.";
                return h.response(response).code(401);
            }
            
            var values;
            var text = "INSERT INTO public.section(title, description) VALUES ($1, $2);";
            values = [
                request.payload.title.trim(),  
                request.payload.description.trim()
            ];
            const query = {
                text: text,
                values: values,
            }
            try{
                const result = await pool.query(query);
                //the insert has not been successful
                if(!result){
                    response.error = "An error occured during the insertion of the section";
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
        path: '/getSections',
        handler: async (request, h) => {
            response.error = null;
            response.body = [];
            
            var text = "SELECT * FROM public.section ORDER BY idsection ASC;";
            try{
                const result = await pool.query(text);
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
        path: '/setSectionById',
        handler: async (request, h) => {
            response.error = null;
            response.body = [];
            //the request doesn't have all the information for updating a section into the database
            if(!request.payload 
                || !request.payload.idSection 
                || !request.payload.title
                || !request.payload.description){
                response.error = "You must at least give the idSection, title and description.";
                return h.response(response).code(401);
            }
            
            var values;
            var text = "UPDATE public.section SET title=$1, description=$2 WHERE idsection = $3;";
            values = [
                request.payload.title, 
                request.payload.description, 
                request.payload.idSection
            ];
            const query = {
                text: text,
                values: values,
            }
            try{
                const result = await pool.query(query);
                //the update has not been successful
                if(!result){
                    response.error = "An error occured during the update of the section";
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
        path: '/deleteSectionById',
        handler: async (request, h) => {
            response.error = null;
            response.body = [];
            //the request doesn't have all the information for deleting a section from the database
            if(!request.payload 
                || !request.payload.idSection){
                response.error = "You must at least give the idSection.";
                return h.response(response).code(401);
            }
            
            var values;
            var text = "DELETE FROM public.section WHERE idsection = $1;";
            values = [
                request.payload.idSection
            ];
            const query = {
                text: text,
                values: values,
            }
            try{
                const result = await pool.query(query);

                //the deletion has not been successful
                if(!result){
                    response.error = "An error occured during the deletion of the section";
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