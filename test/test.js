'use strict';

const Lab = require('@hapi/lab');
const { expect } = require('@hapi/code');
const { before, after, afterEach, beforeEach, describe, it } = exports.lab = Lab.script();
const { init } = require('../lib/server');

let server;

    // beforeEach(async () => {
    //     server = await init();
    // });

    // afterEach(async () => {
    //     await server.stop();
    // });
    

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
            method: 'get',
            url: '/'
        });
        expect(res.payload).to.equal("Hello World!");
        //expect(res.statusCode).to.equal(200);
    });
});
