const cds = require('@sap/cds');

/**
 * Products Service Handler
 * @module productsService
 * @param {Service} srv - The CDS service instance
 */
function productHandlers(srv) {
  const { Product } = srv.entities;

  /**
   * Before CREATE handler for Products
   * @param {Request} req - The request object
   * @returns {Promise<void>}
   */
  srv.before('CREATE', 'Product', async (req) => {
    if (!req.user.is('Admin')) {
      console.log("this is the user's role",req.user)
      return req.reject(403, 'error.onlyAdminsCreate');
    }

    const { Name, UnitPrice, Quantity } = req.data;
    if (!Name) {
      return req.reject(400, 'error.missingRequiredFields');
    }
    if (typeof UnitPrice !== 'number' || UnitPrice <= 0) {
      return req.reject(400, 'error.invalidPrice');
    }
    if (typeof Quantity !== 'number' || Quantity < 0) {
      return req.reject(400, 'error.invalidStockQuantity');
    }
  });

  /**
   * After CREATE handler for Products - Send notification
   * @param {Object} data - The created product data
   * @param {Request} req - The request object
   * @returns {Promise<void>}
   */
  srv.after('CREATE', 'Product', async (data, req) => {
    // console.log("Product created with ID:", data.ID);

    // Send notification for product creation
    try {
      const alert = await cds.connect.to('notifications');
      await alert.notify({
        recipients: [req.user.id],
        priority: "MEDIUM",
        title: "Product Created Successfully",
        description: `New product "${data.Name}" has been created with ID ${data.ID}. Stock quantity: ${data.Quantity}, Unit price: ${data.UnitPrice}.`
      });
    } catch (notifyError) {
      console.warn('Product creation notification failed:', notifyError.message);
    }
  });

  /**
   * Before UPDATE handler for Products
   * @param {Request} req - The request object
   * @returns {Promise<void>}
   */
  srv.before('UPDATE', 'Product', async (req) => {
    if (!req.user.is('Admin')) {
      return req.reject(403, 'error.onlyAdminsUpdate');
    }

    const { ID } = req.data;
    const existingProduct = await SELECT.from(Product).where({ ID });

    if (!existingProduct.length) {
      return req.reject(404, 'error.productNotFound', [ID]);
    }

    const { Name, UnitPrice, Quantity } = req.data;

    if (UnitPrice !== undefined) {
      if (typeof UnitPrice !== 'number' || UnitPrice <= 0) {
        return req.reject(400, 'error.invalidPrice');
      }
    }

    if (Quantity !== undefined) {
      if (typeof Quantity !== 'number' || Quantity < 0) {
        return req.reject(400, 'error.invalidStockQuantity');
      }
    }

    if (Name !== undefined && !Name.trim()) {
      return req.reject(400, 'error.emptyProductName');
    }

    await UPDATE(Product)
      .set({
        Name: Name ?? existingProduct[0].Name,
        Description: req.data.Description ?? existingProduct[0].Description,
        UnitPrice: UnitPrice ?? existingProduct[0].UnitPrice,
        Category: req.data.Category ?? existingProduct[0].Category,
        Quantity: Quantity ?? existingProduct[0].Quantity,
        LastUpdated: req.data.LastUpdated ?? existingProduct[0].LastUpdated,
      })
      .where({ ID });
  });



  /**
   * DELETE handler for Products
   * @param {Request} req - The request object
   * @returns {Promise<string>}
   */
  srv.on('DELETE', 'Product', async (req) => {
    if (!req.user.is('Admin')) {
      return req.reject(403, 'error.onlyAdminsDelete');
    }

    const { ID } = req.data;
    const existingProduct = await SELECT.from(Product).where({ ID });

    if (!existingProduct.length) {
      return req.reject(404, 'error.productNotFound', [ID]);
    }

    await DELETE.from(Product).where({ ID });
    return 'error.productDeleted';
  });
}

module.exports = productHandlers;
module.exports.productHandlers = productHandlers;