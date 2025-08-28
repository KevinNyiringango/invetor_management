const cds = require('@sap/cds');
const productHandler = require('./handlers/Product.handler');
const orderHandler = require('./handlers/Order.handler');
const companyHandler = require('./handlers/Company.handler');


module.exports = cds.service.impl(async function () {
  productHandler(this);
  orderHandler(this);
  companyHandler(this);

  // // Register change tracking handler
  // changeTrackingHandler(this);

  console.log('✅ Change tracking enabled for service:', this.name);
});