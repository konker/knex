const Raw = require('./raw');
const Client = require('./client');
const QueryBuilder = require('./query/builder');
const QueryInterface = require('./query/methods');
const Dialect = require(`./dialects/postgres/index.js`);

const makeKnex = require('./util/make-knex');
const parseConnection = require('./util/parse-connection');
const fakeClient = require('./util/fake-client');
const { SUPPORTED_CLIENTS } = require('./constants');
const { resolveClientNameWithAliases } = require('./helpers');

function Knex(config) {
  // If config is a string, try to parse it
  if (typeof config === 'string') {
    const parsedConfig = Object.assign(parseConnection(config), arguments[2]);
    return new Knex(parsedConfig);
  }

  // If config connection parameter is passed as string, try to parse it
  if (typeof config.connection === 'string') {
    config = Object.assign({}, config, {
      connection: parseConnection(config.connection).connection,
    });
  }
  const newKnex = makeKnex(new Dialect(config));
  if (config.userParams) {
    newKnex.userParams = config.userParams;
  }
  return newKnex;
}

// Expose Client on the main Knex namespace.
Knex.Client = Client;
Knex.QueryBuilder = {
  extend: function(methodName, fn) {
    QueryBuilder.extend(methodName, fn);
    QueryInterface.push(methodName);
  },
};

/* eslint no-console:0 */

// Run a "raw" query, though we can't do anything with it other than put
// it in a query statement.
Knex.raw = (sql, bindings) => {
  console.warn(
    'global Knex.raw is deprecated, use knex.raw (chain off an initialized knex object)'
  );
  return new Raw(fakeClient).set(sql, bindings);
};

module.exports = Knex;
