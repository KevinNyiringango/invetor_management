const cds = require('@sap/cds');

cds.on('bootstrap', (app) => {
  // Add custom middleware here
});

module.exports = cds.server; // Delegate to default server.js

// Register handlers
cds.on('served', () => {
  require('./handlers/Product.handler');
  require('./handlers/Order.handler');
  require('./handlers/Company.handler');
});