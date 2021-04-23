//prendre en compte les variables dans .env
require('dotenv').config()

const uri = process.env.MONGODB_URI;
const PORT = process.env.PORT || 3000;
const MongoClient = require('mongodb').MongoClient;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
/*client.connect(err => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
});*/

'use strict';

const Hapi = require('@hapi/hapi');

const init = async () => {
    console.log("before connect");
   await client.connect();
   console.log("after connect");

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

    server.route({
        method: 'PUT',
        path: '/test',
        /*options: {
            pre: [
                { method: handleAuthenticateToken, assign: 'auth', failAction: 'log'}
            ]
        },*/
        handler: async (request, h) => {
            var response = {};
            response.error = null;
            console.log("here");
            try{
                console.log("here2");
                const collectionNotes = client.db("API_SERVER").collection('users');
                await collectionNotes.insertOne({
                    userId: request.payload.id,
                    username: request.payload.username,
                    createdAt: Date(),
                });
                console.log("here3");
                const docs = await collectionNotes.find({}, {sort: {_id: -1}, limit: 1 }).toArray(); //trouver le dernier document de user venant d'être créé
                response.user = docs;
                return h.response(response).code(200);
            }catch(err){
                response.error = 'Error in Database';
                return h.response(response).code(401);
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