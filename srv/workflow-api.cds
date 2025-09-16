service WorkflowAPI {
    @readonly
    function getToken() returns {
        token: String;
    };

    action createWorkflowInstance(
        definitionId: String,
        context: {
            company_id: String;
            product_id: String;
            quantity: Integer;
        }
    ) returns {
        instanceId: String;
        status: String;
    };
}
