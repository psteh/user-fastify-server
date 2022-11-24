'use strict';
const ObjectId = require('@fastify/mongodb').ObjectId;

const projection = {
  username: true,
  name: true,
  address: true,
  birthdate: true,
  email: true,
};

const bodySchema = {
  type: 'object',
  required: ['name', 'username', 'email'],
  properties: {
    name: { type: 'string' },
    username: { type: 'string' },
    email: { type: 'string' },
    address: { type: 'string', nullable: true },
    birthdate: { type: 'string', nullable: true },
  },
};

const querySchema = {
  type: 'object',
  properties: {
    query: { type: 'string' },
  },
};

const paramsSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
  },
};

// TODO - add schema for response
// problem: data shows empty object if added for validation
const responseSchema = {
  200: {
    type: 'object',
    properties: {
      data: { type: 'object' },
      message: { type: 'string' },
    },
  },
  500: {
    type: 'object',
    properties: {
      message: { type: 'string' },
    },
  },
};

module.exports = async function (fastify, opts) {
  const collection = fastify.mongo.db.collection('customers');

  // // TODO - put schema for global usage
  // fastify.addSchema({
  //   $id: '2xx',
  //   type: 'object',
  //   properties: {
  //     data: { type: 'object' },
  //     message: { type: 'string' },
  //   },
  // });

  // // TODO - put schema for global usage
  // fastify.addSchema({
  //   $id: '5xx',
  //   type: 'object',
  //   properties: {
  //     message: { type: 'string' },
  //   },
  // });

  // get all customers info
  fastify.get('/api/v1/customers', async function (request, reply) {
    try {
      const customers = await collection.find({}, { projection }).toArray();
      reply.send(customers);
    } catch (error) {}
  });

  // get customer info by username, name, email
  fastify.get(
    '/api/v1/customers/search',
    { schema: { query: querySchema } },
    async function (request, reply) {
      const query = request.query.query || '*';
      const formattedQuery = new RegExp(query, 'i');
      try {
        const customers = await collection
          .find(
            {
              $or: [
                { username: formattedQuery },
                { name: formattedQuery },
                { email: formattedQuery },
              ],
            },
            { projection },
          )
          .toArray();
        reply.send({
          data: customers,
          message: 'successfully fetch all customers info',
        });
      } catch (error) {}
    },
  );

  fastify.post(
    '/api/v1/customers',
    { schema: { body: bodySchema } },
    async function (request, reply) {
      try {
        const { insertedId } = await collection.insertOne(request.body);
        const customer = await collection.findOne({ _id: insertedId });
        reply.status(200).send({
          data: customer,
          message: 'successfully create new customer info',
        });
      } catch (error) {}
    },
  );

  fastify.put(
    '/api/v1/customers/:id',
    { schema: { body: bodySchema } },
    async function (request, reply) {
      try {
        await collection.updateOne(
          { _id: request.params.id },
          { $set: request.body, $currentDate: { lastModified: true } },
        );
        const customers = await collection.findOne({
          _id: ObjectId(request.params.id),
        });
        reply.send(customers);
      } catch (error) {
        console.log(error);
      }
    },
  );

  fastify.delete(
    '/api/v1/customers/:id',
    { schema: { params: paramsSchema } },
    async function (request, reply) {
      try {
        const response = await collection.deleteOne({
          _id: ObjectId(request.params.id),
        });
        if (response.deletedCount === 1) {
          reply.send({ message: 'Successfully deleted customer info' });
        } else {
          reply.status(404).send({ message: 'Failed to delete customer info' });
        }
      } catch (error) {}
    },
  );
};
