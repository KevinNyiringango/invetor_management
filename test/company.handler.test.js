const axios = require('axios');

// Configure test instance with Admin user
const api = axios.create({
  baseURL: 'http://localhost:4004/odata/v4/inventory',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Basic ' + Buffer.from('alice:admin').toString('base64'),
  },
});

describe("Company CRUD Handler Tests", () => {
  let companyId;

  beforeAll(async () => {
    try {
      await api.get('/$metadata');
      console.log('✅ Server connection verified');
    } catch (error) {
      throw new Error('Server not accessible. Make sure it\'s running on localhost:4004');
    }
  });

  afterAll(async () => {
    if (companyId) {
      try {
        await api.delete(`/Company(ID=${companyId})`);
        console.log('✅ Cleanup: Test company deleted');
      } catch (error) {
        console.log('⚠️ Cleanup failed (company may not exist)');
      }
    }
  });

  describe("CREATE Company", () => {
    test("should create a new company with valid data as Admin", async () => {
      const companyData = {
        Name: "Test Company",
        Address: "123 Test Street"
      };

      const response = await api.post("/Company", companyData);
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty("ID");
      expect(response.data.Name).toBe(companyData.Name);
      expect(response.data.Address).toBe(companyData.Address);

      companyId = response.data.ID;
      console.log(`✅ Company created with ID: ${companyId}`);
    })
  });

  describe("UPDATE Company", () => {
    test("should update company with valid data as Admin", async () => {
      const updateData = {
        Name: "Updated Company Name",
        Address: "Updated Address"
      };

      const response = await api.patch(`/Company(ID=${companyId})`, updateData);
      console.log("company id ",companyId)
      expect(response.status).toBe(200);
      expect(response.data.Name).toBe(updateData.Name);
      expect(response.data.Address).toBe(updateData.Address);
    });
  });

  describe("DELETE Company", () => {
    test("should delete existing company as Admin", async () => {
      const response = await api.delete(`/Company(ID=${companyId})`);
      expect([200, 204]).toContain(response.status);
      companyId = null;
      console.log('✅ Company deleted successfully');
    });
  });
});