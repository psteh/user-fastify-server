'use strict';

const { test } = require('tap');
const ObjectId = require('@fastify/mongodb').ObjectId;

const { build } = require('../helper');

let objectId = '';

const payload = {
  name: 'test',
  username: 'test',
  address: 'test',
  birthdate: null,
  email: 'test@test.com',
};

test('create new customer info', async (t) => {
  const app = await build(t);
  const res = await app.inject({
    method: 'POST',
    url: '/api/v1/customers',
    payload,
  });
  const responsePayload = res.json();
  objectId = ObjectId(responsePayload?.data?._id);

  t.equal(res.statusCode, 200, 'status code is 200');
});

test('update customer info', async (t) => {
  const app = await build(t);
  const res = await app.inject({
    method: 'PUT',
    url: `/api/v1/customers/${objectId}`,
    payload,
  });

  t.equal(res.statusCode, 200, 'status code is 200');
});

test('get all customers info', async (t) => {
  const app = await build(t);
  const res = await app.inject({ method: 'GET', url: '/api/v1/customers' });

  t.equal(res.statusCode, 200, 'status code is 200');
});

test('get specific customer info', async (t) => {
  const app = await build(t);
  const res = await app.inject({
    method: 'GET',
    url: '/api/v1/customers/search',
    query: {
      query: payload.name,
    },
  });

  t.equal(res.statusCode, 200, 'status code is 200');
});

test('delete customer info', async (t) => {
  const app = await build(t);
  const res = await app.inject({
    method: 'DELETE',
    url: `/api/v1/customers/${objectId}`,
  });

  t.equal(res.statusCode, 200, 'status code is 200');
});

test('delete unknown customer info', async (t) => {
  const app = await build(t);
  const res = await app.inject({
    method: 'DELETE',
    url: `/api/v1/customers/637ee291fab66add5307c259`,
  });

  t.equal(res.statusCode, 404, 'status code is 404');
});
