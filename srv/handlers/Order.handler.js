// filepath: c:\Users\KevinNyiringango\invetor_management\srv\handlers\Order.handler.js
const cds = require('@sap/cds');

/**
 * Orders Service Handler
 * @module ordersService
 * @param {Service} srv - The CDS service instance
 */
module.exports = (srv) => {
  const { Order, OrderItem, Product, Company } = srv.entities;

  /**
   * Before CREATE handler for Orders
   * @param {Request} req - The request object
   * @returns {Promise<void>}
   */
  srv.before('CREATE', 'Order', async (req) => {
    if (!req.user.is('User')) {
      return req.reject(403, 'error.onlyUsersCreate');
    }

    const { Company_ID, Items } = req.data;

    // Validate Company_ID
    if (!Company_ID) {
      return req.reject(400, 'error.missingRequiredFields', ['Company_ID']);
    }

    // Check if the Company_ID is valid
    const company = await SELECT.one.from(Company).where({ ID: Company_ID });
    if (!company) {
      return req.reject(400, 'error.invalidCompanyID', [Company_ID]);
    }

    // Validate Items array
    if (!Items || !Items.length) {
      return req.reject(400, 'error.missingOrderItems');
    }

    let totalAmount = 0;
    const productCache = new Map(); // Cache for product data

    // Process each item one by one
    for (const item of Items) {
      const { Product_ID, Quantity } = item;

      if (!Product_ID) {
        return req.reject(400, 'error.missingProductID');
      }

      // Check if the Product_ID is valid
      let product = productCache.get(Product_ID);
      if (!product) {
        product = await SELECT.one.from(Product).where({ ID: Product_ID });
        if (!product) {
          return req.reject(400, 'error.invalidProductID', [Product_ID]);
        }
        productCache.set(Product_ID, product);
      }

      // Validate Quantity
      if (Quantity <= 0) {
        return req.reject(400, 'error.invalidQuantity', ['Quantity must be greater than zero']);
      }
      if (Quantity > product.Quantity) {
        return req.reject(400, 'error.insufficientStock', [Product_ID]);
      }

      // Set the UnitPrice from the Product entity
      item.UnitPrice = product.UnitPrice;

      // Calculate the total amount for the order
      totalAmount += product.UnitPrice * Quantity;
    }

    // Set the total amount for the order
    req.data.TotalAmount = totalAmount;
    console.log(`TotalAmount calculated: ${totalAmount}`); // Debug statement
  });

  /**
   * After CREATE handler for Orders
   * @param {Object} data - The created entity data
   * @returns {Promise<void>}
   */
  srv.after('CREATE', 'Order', async (data) => {
    const orderId = data.ID;

    // Fetch the OrderItems using the Order ID
    const items = await SELECT.from(OrderItem).where({ Order_ID: orderId });

    if (!items || !items.length) {
      return; // Nothing to update
    }

    for (const item of items) {
      const { Product_ID, Quantity } = item;

      // Update stock
      await UPDATE(Product)
        .set('Quantity -=', Quantity)
        .where({ ID: Product_ID });
    }
  });

  /**
   * Before DELETE handler for Orders
   * @param {Request} req - The request object
   * @returns {Promise<void>}
   */
  srv.before('DELETE', 'Order', async (req) => {
    if (!req.user.is('Admin')) {
      return req.reject(403, 'error.onlyAdminsDelete');
    }

    const { ID } = req.data;
    const order = await SELECT.one.from(Order).where({ ID });
    if (!order) {
      return req.reject(404, 'error.orderNotFound');
    }
  });
};