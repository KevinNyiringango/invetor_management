const cds = require('@sap/cds');

/**
 * Products Service Handler
 * @module productsService
 * @param {Service} srv - The CDS service instance
 */
function productHandlers(srv) {
  const { Product, Notification } = srv.entities;

  /**
   * Helper function to store notification in database
   * @param {string} recipient - The user ID
   * @param {string} priority - Priority level
   * @param {string} title - Notification title
   * @param {string} description - Notification description
   * @param {string} method - The operation method (CREATE, UPDATE, DELETE)
   */
  async function storeNotification(recipient, priority, title, description, method) {
    try {
      await INSERT.into(Notification).entries({
        recipient,
        priority,
        title,
        description,
        method
      });
    } catch (error) {
      console.warn('Failed to store notification in database:', error.message);
    }
  }

  /**
   * Before CREATE handler for Products
   */
  srv.before('CREATE', 'Product', async (req) => {
    if (!req.user.is('Admin')) {
      console.log("this is the user's role", req.user);
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
   * After CREATE handler for Products - Send notification and store in DB
   */
  srv.after('CREATE', 'Product', async (data, req) => {
    const notificationData = {
      recipient: req.user.id,
      priority: "MEDIUM",
      title: "Product Created",
      description: `New product "${data.Name}" has been created with ID ${data.ID}. Stock quantity: ${data.Quantity}, Unit price: ${data.UnitPrice}.`,
      method: "CREATE"
    };

    // Send notification via plugin (existing functionality)
    try {
      const alert = await cds.connect.to('notifications');
      await alert.notify(notificationData);
    } catch (notifyError) {
      console.warn('Product creation notification failed:', notifyError.message);
    }

    await storeNotification(
      notificationData.recipient,
      notificationData.priority,
      notificationData.title,
      notificationData.description,
      notificationData.method
    );
  });

  /**
   * Before UPDATE handler for Products
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
   * After UPDATE handler for Products - Send notification and store in DB
   */
  srv.after('UPDATE', 'Product', async (data, req) => {
    const notificationData = {
      recipient: req.user.id,
      priority: "HIGH",
      title: "Product Updated",
      description: `Product "${data.Name}" (ID: ${data.ID}) has been updated. New stock quantity: ${data.Quantity}, Unit price: ${data.UnitPrice}.`,
      method: "UPDATE"
    };

    try {
      const alert = await cds.connect.to('notifications');
      await alert.notify(notificationData);
    } catch (notifyError) {
      console.warn('Product update notification failed:', notifyError.message);
    }

    await storeNotification(
      notificationData.recipient,
      notificationData.priority,
      notificationData.title,
      notificationData.description,
      notificationData.method
    );
  });

  /**
   * DELETE handler for Products
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

    // Store the product name before deletion for notification
    const productName = existingProduct[0].Name;

    await DELETE.from(Product).where({ ID });

    // Send delete notification
    const notificationData = {
      recipient: req.user.id,
      priority: "HIGH",
      title: "Product Deleted",
      description: `Product "${productName}" (ID: ${ID}) has been deleted.`,
      method: "DELETE"
    };

    try {
      const alert = await cds.connect.to('notifications');
      await alert.notify(notificationData);
    } catch (notifyError) {
      console.warn('Product deletion notification failed:', notifyError.message);
    }

    await storeNotification(
      notificationData.recipient,
      notificationData.priority,
      notificationData.title,
      notificationData.description,
      notificationData.method
    );

    return 'error.productDeleted';
  });
}

module.exports = productHandlers;
module.exports.productHandlers = productHandlers;