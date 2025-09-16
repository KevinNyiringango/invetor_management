const cds = require('@sap/cds');
const axios = require('axios');

module.exports = async (srv) => {
    srv.on('createSalesOrder', async (req) => {
        try {
            // Get token
            const tokenResponse = await axios({
                method: 'post',
                url: process.env.WORKFLOW_TOKEN_URL,
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                auth: {
                    username: process.env.WORKFLOW_CLIENT_ID,
                    password: process.env.WORKFLOW_CLIENT_SECRET
                },
                data: 'grant_type=client_credentials'
            });

            const token = tokenResponse.data.access_token;

            // Create workflow instance
            const response = await axios({
                method: 'post',
                url: process.env.WORKFLOW_API_URL,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                data: {
                    definitionId: 'us10.a190dfa2trial.saleseordermanagementapiversion.salesOrderHandlingProcess',
                    context: {
                        company_id: req.data.company_id,
                        product_id: req.data.product_id,
                        quantity: req.data.quantity
                    }
                }
            });

            return {
                status: 'success',
                message: 'Workflow instance created successfully',
                id: response.data.id
            };

        } catch (error) {
            req.error(500, {
                message: `Workflow creation failed: ${error.message}`,
                detail: error.response?.data || error
            });
        }
    });
};
