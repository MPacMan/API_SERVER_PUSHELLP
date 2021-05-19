//prendre en compte les variables dans .env
require('dotenv').config()

//connection de la bdd Postgres
const HapiPostgresConnection = require('hapi-postgres-connection');

const uri = process.env.MONGODB_URI;
const PORT = process.env.PORT || 3000;
const MongoClient = require('mongodb').MongoClient;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

'use strict';

const Hapi = require('@hapi/hapi');

const init = async () => {
   await client.connect();

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