'use strict';

const fp = require('fastify-plugin');
const fastifyMongoDB = require('@fastify/mongodb');

module.exports = fp(async function (fastify, opts) {
  fastify.register(fastifyMongoDB, {
    forceClose: true,
    url: `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.bqt5b.mongodb.net/${process.env.MONGODB_DATABASE}?retryWrites=true&w=majority&authSource=admin`,
  });
});
