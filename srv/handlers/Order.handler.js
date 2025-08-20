const cds = require('@sap/cds');

module.exports = (srv) => {
  const { Order, OrderItem, Product, Company } = srv.entities;

  /**
   * Before CREATE handler for Orders
   */
  srv.before('CREATE', 'Order', async (req) => {
    if (!req.user.is('User')) {
      return req.reject(403, 'error.onlyUsersCreate');
    }

    const { Company_ID, Items } = req.data;

    if (!Company_ID) {
      return req.reject(400, 'error.missingRequiredFields', ['Company_ID']);
    }

    const company = await SELECT.one.from(Company).where({ ID: Company_ID });
    if (!company) {
      return req.reject(400, 'error.invalidCompanyID', [Company_ID]);
    }

    if (!Items?.length) {
      return req.reject(400, 'error.missingOrderItems');
    }
  });

  /**
   * Submit Order with Transaction Handling
   */
  srv.on('submitOrder', async (req) => {
    const { companyId, items = [] } = req.data;
    
    if (!req.user.is('User')) {
      return req.reject(403, 'error.onlyUsersCreate');
    }

    if (!companyId || !items.length) {
      return req.reject(400, 'Company ID and items are required');
    }

    const tx = cds.tx(req);

    try {
      // 1. Validate company
      const company = await tx.read(Company, companyId);
      if (!company) {
        throw new Error(`Company with ID ${companyId} not found`);
      }

      // 2. Process items and validate stock
      let totalAmount = 0;
      const validatedItems = [];

      for (const item of items) {
        const { productId, quantity } = item;
        
        if (!productId || quantity <= 0) {
          throw new Error('Valid product ID and positive quantity required');
        }

        const product = await tx.read(Product, productId);
        if (!product) {
          throw new Error(`Product ${productId} not found`);
        }

        if (quantity > product.Quantity) {
          throw new Error(`Insufficient stock for product ${product.Name}`);
        }

        validatedItems.push({
          Product_ID: productId,
          Quantity: quantity,
          UnitPrice: product.UnitPrice
        });

        totalAmount += product.UnitPrice * quantity;
      }

      // 3. Create order
      const order = await tx.create(Order).entries({
        Company_ID: companyId,
        TotalAmount: totalAmount,
        Status: 'Confirmed',
        OrderDate: new Date()
      });

      // 4. Create order items
      const orderItems = validatedItems.map(item => ({
        ...item,
        Order_ID: order.ID,
        ID: cds.utils.uuid()
      }));

      await tx.create(OrderItem).entries(orderItems);

      // 5. Update product stock
      for (const item of validatedItems) {
        await tx.run(
          UPDATE(Product)
            .set('Quantity -=', item.Quantity)
            .where({ ID: item.Product_ID })
        );
      }

      // Return success response
      return {
        orderId: order.ID,
        totalAmount,
        status: 'Confirmed',
        itemCount: orderItems.length
      };

    } catch (error) {
      // Transaction will automatically rollback on error
      console.log(`Order failed - Rolling back: ${error.message}`);
      req.reject(500, `Order creation failed: ${error.message}`);
    }
  });

  /**
   * Cancel Order with Transaction Handling
   */
  srv.on('cancelOrder', async (req) => {
    const { orderId } = req.data;
    
    if (!req.user.is('Admin')) {
      return req.reject(403, 'error.onlyAdminsCancel');
    }

    if (!orderId) {
      return req.reject(400, 'Order ID is required');
    }

    const tx = cds.tx(req);

    try {
      // 1. Check if order exists
      const order = await tx.run(
        SELECT.one.from(Order).where({ ID: orderId })
      );

      if (!order) {
        throw new Error(`Order with ID ${orderId} not found`);
      }

      // 2. Find items in OrderItems table with explicit columns
      const orderItems = await tx.run(
        SELECT.from(OrderItem)
          .columns(['Product_ID', 'Quantity'])
          .where({ Order_ID: orderId })
      );

      console.log('Found order items:', orderItems); // Debug log

      // 3. Restore product quantities with verification
      for (const item of orderItems) {
        // Verify current product quantity first
        const product = await tx.run(
          SELECT.one.from(Product)
            .columns(['ID', 'Quantity', 'Name'])
            .where({ ID: item.Product_ID })
        );

        console.log(`Current stock for ${product.Name}:`, product.Quantity);
        
        // Update product quantity
        await tx.run(
          UPDATE(Product)
            .set({ Quantity: { '+=': parseInt(item.Quantity) } })
            .where({ ID: item.Product_ID })
        );

        // Verify update
        const updatedProduct = await tx.run(
          SELECT.one.from(Product)
            .columns(['ID', 'Quantity', 'Name'])
            .where({ ID: item.Product_ID })
        );

        console.log(`Updated stock for ${updatedProduct.Name}:`, updatedProduct.Quantity);
      }

      // 4. Delete order items
      await tx.run(
        DELETE.from(OrderItem).where({ Order_ID: orderId })
      );

      // 5. Delete order
      await tx.run(
        DELETE.from(Order).where({ ID: orderId })
      );

      return {
        orderId: orderId,
        status: 'Cancelled',
        message: `Order cancelled and ${orderItems.length} items restored to inventory`
      };

    } catch (error) {
      console.error('Cancel order failed:', error);
      req.reject(500, `Order cancellation failed: ${error.message}`);
    }
  });

  /**
   * Before DELETE handler for Orders
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

  /**
   * After CREATE handler for Orders
   */
  srv.after('CREATE', 'Order', async (data) => {
    const orderId = data.ID;
    const items = await SELECT.from(OrderItem).where({ Order_ID: orderId });

    if (items?.length) {
      for (const item of items) {
        await UPDATE(Product)
          .set('Quantity -=', item.Quantity)
          .where({ ID: item.Product_ID });
      }
    }
  });
};