const cds = require('@sap/cds');

/**
 * Products Service Handler
 * @module productsService
 * @param {Service} srv - The CDS service instance
 */
module.exports = (srv) => {
  const { Product } = srv.entities;

  /**
   * Before CREATE handler for Products
   * @param {Request} req - The request object
   * @returns {Promise<void>}
   */
  srv.before('CREATE', 'Product', async (req) => {
    const { Name, UnitPrice, Quantity } = req.data;
    if (!Name) {
      return req.reject(400,'error.missingRequiredFields');
    }
    if (typeof UnitPrice !== 'number' || UnitPrice <= 0) {
      return req.reject(400,'error.invalidPrice');
    }
    if (typeof Quantity !== 'number' || Quantity < 0) {
      return req.reject(400,'error.invalidStockQuantity');
    }
  });

  /**
   * Before UPDATE handler for Products
   * @param {Request} req - The request object
   * @returns {Promise<void>}
   */
  srv.before('UPDATE', 'Product', async (req) => {
    const { ID } = req.data;
    const existingProduct = await SELECT.from(Product).where({ ID });

    if (!existingProduct.length) {
      return req.reject(404,'error.productNotFound', [ID]);
    }

    const { Name, UnitPrice, Quantity } = req.data;

    if (UnitPrice !== undefined) {
      if (typeof UnitPrice !== 'number' || UnitPrice <= 0) {
        return req.reject(400,'error.invalidPrice');
      }
    }

    if (Quantity !== undefined) {
      if (typeof Quantity !== 'number' || Quantity < 0) {
        return req.reject(400,'error.invalidStockQuantity');
      }
    }

    if (Name !== undefined && !Name.trim()) {
      return req.reject(400,'error.emptyProductName');
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
    const { ID } = req.data;
    const existingProduct = await SELECT.from(Product).where({ ID });

    if (!existingProduct.length) {
      return req.reject(404,'error.productNotFound', [ID]);
    }

    await DELETE.from(Product).where({ ID });
    return('error.productDeleted');
  });
};