service WorkflowService @(path:'/workflow') {
    type WorkflowResponse {
        status: String;
        message: String;
        id: String;
    }

    action createSalesOrder(
        company_id: String,
        product_id: String,
        quantity: Integer
    ) returns WorkflowResponse;
}
