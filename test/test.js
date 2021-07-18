'use strict';

const Lab = require('@hapi/lab');
const { expect } = require('@hapi/code');
const { before, after, afterEach, beforeEach, describe, it } = exports.lab = Lab.script();
const { init } = require('../lib/server');
const { indexOf } = require('../routes/user');

let server;

    // beforeEach(async () => {
    //     server = await init();
    // });

    // afterEach(async () => {
    //     await server.stop();
    // });
    
/**** first tests ****/
it('returns true when 1 + 1 equals 2', () => {
    expect(1 + 1).to.equal(2);
});

describe('GET /', () => {
    before(async () => {
        server = await init();
    });

    after(async () => {
        await server.stop();
    });

    it('should return a source response "Hello World!"', async () => {
        const res = await server.inject({
            method: 'GET',
            url: '/'
        });
        expect(res.payload).to.equal("Hello World!");
    });
});
/******* *******/

/**** users tests ****/
describe('Users:', () => {
    var idHapiTestUser;
    before(async () => {
        server = await init();
    });

    after(async () => {
        await server.stop();
    });

    it('creating an user should return a response with status code 200', async () => {
        const res = await server.inject({
            method: 'POST',
            url: '/signup',
            payload: {
                username: 'hapi-test-user',
                email: 'hapi-test-email@gmail.com',
                password: 'hapi-test-password',
                status: 'client'
            }
        });
        expect(res.statusCode).to.equal(200);
    });

    it('login as the user created should return a response with status code 200', async () => {
        const res = await server.inject({
            method: 'POST',
            url: '/login',
            payload: {
                username: 'hapi-test-user',
                password: 'hapi-test-password'
            }
        });
        var indexToIdIndividual = res.payload.indexOf("idindividual") + ("idindividual\":".length); //get the id test user hapi from the response payload
        idHapiTestUser = res.payload.slice(indexToIdIndividual, indexToIdIndividual+2);
        console.log(idHapiTestUser);    
        expect(res.statusCode).to.equal(200);
    });

    it('getting the test user hapi should return a response with status code 200', async () => {
        const res = await server.inject({
            method: 'GET',
            url: '/getIndividualById?idUser=' + idHapiTestUser
        });
        expect(res.statusCode).to.equal(200);
    });


    it('delating the test user hapi should return a response with status code 200', async () => {
        const res = await server.inject({
            method: 'DELETE',
            url: '/deleteUserById',
            payload: {
                idUser: idHapiTestUser
            }
        });
        expect(res.statusCode).to.equal(200);
    });
    
});
/******* *******/
