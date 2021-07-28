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
    },
    {
        method: 'GET',
        path: '/getIndividualsWithPostsByIds',
        handler: async (request, h) => {
            response.error = null;
            response.body = [];
            if(!request.query 
                || !request.query.idUser 
                || !request.query.idPost){
                response.error = "You must at least give an idUser and idPost.";
                return h.response(response).code(400);
            }

            var text = "SELECT COUNT (*) FROM public.individual_has_post WHERE individual_idindividual = $1 AND post_idpost = $2;";
            var values = [
                parseInt(request.query.idUser,10),
                parseInt(request.query.idPost,10)
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
                response.error = err;
                return h.response(response).code(400);
            }
        }
    },
    {
        method: 'POST',
        path: '/pushPostByIdUserWithIdPost',
        handler: async (request, h) => {
            response.error = null;
            response.body = [];
            if(!request.payload 
                || !request.payload.idUser 
                || !request.payload.idPost){
                response.error = "You must at least give an idUser and idPost.";
                return h.response(response).code(400);
            }
            var idUser = parseInt(request.payload.idUser,10);
            var idPost = parseInt(request.payload.idPost,10);
            var text = "SELECT COUNT (*) FROM public.individual_has_post WHERE individual_idindividual = $1 AND post_idpost = $2;";
            var values = [
                idUser,
                idPost
            ];
            var query = {
                text: text,
                values: values,
            }
            try{
                const result = await pool.query(query);
                const val = result.rows[0].count;         
                if(val === '0'){ //the user didn't push the current post => we add his push to it
                    var query = {
                        text: "INSERT INTO public.individual_has_post(individual_idindividual, post_idpost) VALUES ($1, $2);",
                        values: values,
                    }
                    const resInsert = await pool.query(query);
                    if(!resInsert){
                        response.error = "An error occured during the process of push";
                        return h.response(response).code(401);
                    }
                    text = "UPDATE public.post SET numberpush = numberpush + 1 WHERE idpost = $1;"
                    values = [
                        idPost
                    ]
                    var query = {
                        text: text,
                        values: values,
                    }
                    const resUpdate = pool.query(query);
                    if(!resUpdate){
                        response.error = "An error occured during the process of push";
                        return h.response(response).code(401);
                    }
                }else{ //the user did push the current post => we remove his push to it
                    var query = {
                        text: "DELETE FROM public.individual_has_post WHERE individual_idindividual = $1 AND post_idpost = $2;",
                        values: values,
                    }
                    const resInsert = await pool.query(query);
                    if(!resInsert){
                        response.error = "An error occured during the process of unpush";
                        return h.response(response).code(401);
                    }
                    text = "UPDATE public.post SET numberpush = numberpush - 1 WHERE idpost = $1;"
                    values = [
                        idPost
                    ]
                    var query = {
                        text: text,
                        values: values,
                    }
                    const resUpdate = pool.query(query);
                    if(!resUpdate){
                        response.error = "An error occured during the process of unpush";
                        return h.response(response).code(401);
                    }
                }
                text = "SELECT * FROM public.post WHERE idpost = $1;"
                values = [
                    idPost
                ];
                var query = {
                    text: text,
                    values: values,
                }
                const res = await pool.query(query);
                const numberPush = res.rows[0].numberpush;
                console.log(numberPush);
                response.body = {
                    data : numberPush
                }
                return h.response(response).code(200);
            }catch (err) {
                response.error = err;
                return h.response(response).code(400);
            }
        }
    }
];