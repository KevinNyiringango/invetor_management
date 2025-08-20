const axios = require('axios');

// Configure test instance with Admin user
const api = axios.create({
  baseURL: 'http://localhost:4004/odata/v4',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Basic ' + Buffer.from('alice:admin').toString('base64'), // Updated credentials
  },
});

// Configure non-admin API instance
const nonAdminApi = axios.create({
  baseURL: 'http://localhost:4004/odata/v4',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Basic ' + Buffer.from('user:user').toString('base64'),
  },
});

// Suppress console.error during tests
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  console.error.mockRestore();
});

describe("Product CRUD Handler Tests", () => {
  let productId;

  beforeAll(async () => {
    // Verify server is running
    try {
      const response = await api.get('/inventory/$metadata');
      console.log('✅ Server connection verified');
    } catch (error) {
      throw new Error('Server not accessible. Make sure it\'s running on localhost:4004');
    }
  });

  afterAll(async () => {
    // Cleanup: Delete test product if it exists
    if (productId) {
      try {
        await api.delete(`/inventory/Product(ID=${productId})`);
        console.log('✅ Cleanup: Test product deleted');
      } catch (error) {
        console.log('⚠️ Cleanup failed (product may not exist)');
      }
    }
  });

  describe("CREATE Product", () => {
    test("should create a new product with valid data as Admin", async () => {
      const productData = {
        Name: "Test Product",
        Description: "Test product for handler testing",
        UnitPrice: 29.99,
        Quantity: 100,
        Category: "Electronics",
      };

      const response = await api.post("/inventory/Product", productData);
console.log("this is the response",response)
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty("ID");
      expect(response.data.Name).toBe(productData.Name);
      expect(response.data.UnitPrice).toBe(productData.UnitPrice);
      expect(response.data.Quantity).toBe(productData.Quantity);

      productId = response.data.ID;
      console.log(`✅ Product created with ID: ${productId}`);
    });

    test("should reject product creation with excessively long Name", async () => {
      const invalidData = {
        Name: "A".repeat(256), 
        UnitPrice: 19.99,
        Quantity: 10,
      };

      await expect(api.post("/inventory/Product", invalidData))
        .rejects.toMatchObject({
          response: { status: 400 },
        });
    });
  });

  describe("UPDATE Product", () => {
    test("should reject update with excessively long Description", async () => {
      if (!productId) {
        console.warn('Skipping test: Product ID is not defined');
        return;
      }

      const invalidUpdateData = {
        Description: "A".repeat(1025), 
      };

      await expect(api.patch(`/inventory/Product(ID=${productId})`, invalidUpdateData))
        .rejects.toMatchObject({
          response: { status: 400 },
        });
    });

    test("should update product with valid data", async () => {
      if (!productId) {
        console.warn('Skipping test: Product ID is not defined');
        return;
      }

      const updateData = {
        Name: "Updated Test Product",
        UnitPrice: 39.99,
        Description: "Updated description",
      };

      const response = await api.patch(`/inventory/Product(ID=${productId})`, updateData);
// console.log("this is the response data",response)
      expect(response.status).toBe(200);
      expect(response.data.Name).toBe(updateData.Name);
      expect(response.data.UnitPrice).toBe(updateData.UnitPrice);
      expect(response.data.Description).toBe(updateData.Description);
    })
  });

  describe("DELETE Product", () => {
    test("should reject delete with invalid product ID format", async () => {
      const invalidId = "invalid-id-format";

      await expect(api.delete(`/inventory/Product(ID=${invalidId})`))
        .rejects.toMatchObject({
          response: { status: 404 },
        });
    });

    test("should delete existing product as Admin", async () => {
      if (!productId) {
        console.warn('Skipping test: Product ID is not defined');
        return;
      }

      const response = await api.delete(`/inventory/Product(ID=${productId})`);
      expect([200, 204]).toContain(response.status);

      productId = null; 
      console.log('✅ Product deleted successfully');
    });
  });
});