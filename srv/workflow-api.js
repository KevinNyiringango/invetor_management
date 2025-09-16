const cds = require('@sap/cds');
const axios = require('axios');

module.exports = async (srv) => {
    srv.on('getToken', async () => {
        try {
            const response = await axios({
                method: 'post',
                url: 'https://a190dfa2trial.authentication.us10.hana.ondemand.com/oauth/token',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                auth: {
                    username: process.env.WORKFLOW_CLIENT_ID,
                    password: process.env.WORKFLOW_CLIENT_SECRET
                },
                data: 'grant_type=client_credentials'
            });

            return { token: response.data.access_token };
        } catch (error) {
            req.error(500, error.message);
        }
    });

    srv.on('createWorkflowInstance', async (req) => {
        const { definitionId, context } = req.data;
        try {
            // First get token
            const tokenResponse = await srv.run(SELECT.one.from('WorkflowAPI.getToken'));
            
            // Create workflow instance
            const response = await axios({
                method: 'post',
                url: 'https://spa-api-gateway-bpi-us-prod.cfapps.us10.hana.ondemand.com/workflow/rest/v1/workflow-instances',
                headers: {
                    'Authorization': `Bearer ${tokenResponse.token}`,
                    'Content-Type': 'application/json'
                },
                data: { definitionId, context }
            });

            return {
                instanceId: response.data.id,
                status: 'created'
            };
        } catch (error) {
            req.error(500, error.message);
        }
    });
};
