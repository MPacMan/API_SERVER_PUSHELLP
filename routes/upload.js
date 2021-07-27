//prendre en compte les variables dans .env
require('dotenv').config();

//connection de la bdd Postgres
const { Pool, Client } = require('pg');
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({
  connectionString,
})

//read the stream of a file
const { Readable } = require('stream');

const fs = require('fs')

var utils = require('../utils');
const response = {};

const handleFileUpload = function(path, file){
    //await fs.promises.writeFile(path, file)
    return new Promise((resolve, reject) => {
      fs.writeFile(path, file, err => {
         if (err) {
          reject(err)
         }
         resolve({ message: 'Upload successfully!' })
      })
    })
   }
module.exports = [
    {
        method: 'POST',
        path: '/uploadImageSection',
        options: {
            payload: {
                output: 'stream',
                parse: true,
                multipart: true
                //allow: ['application/json', 'image/jpeg','image/png', 'multipart/form-data','application/pdf']
            }
        },
        handler: async (req, h) => {
            response.error = null;
            response.body = [];
            console.log(req);
            //the request doesn't have all the information for uploading an image into the api-server
            if(!req.payload || !req.payload.file){
                response.error = "You must at least give a file to upload";
                return h.response(response).code(401);
            }
            const data = req.payload.file;
            const name = data.filename;

            var extension = utils.getExtensionOfFileName(name);
            //the file is not an image
            if(extension != "png" && extension != "jpg" && extension != "svg" && extension != "webp"){
                response.error = "The file must be an image";
                return h.response(response).code(401);
            }

            const path =  "./uploads/images/sections/" + name;
            const file = fs.createWriteStream(path);

            file.on('error', (err) => console.error(err));

            data.pipe(file);

            data.on('end', (err) => { 
                const ret = {
                    filename: data.filename,
                    headers: data.headers
                }
                return JSON.stringify(ret);
            })
            return h.response(response).code(200);
        }
    }
];