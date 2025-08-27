# Inventory Management

Welcome to the Inventory Management project.

It contains these folders and files, following our recommended project layout:

File or Folder | Purpose
---------|----------
`app/` | all ui apps are here
`db/` | your domain models 
`srv/` | your service models 
`package.json` | project metadata and configuration
`README.md` | this getting started guide
``


## Next Steps

- Open a new terminal and run `cds watch`
- (in VS Code simply choose _**Terminal** > Run Task > cds watch_)
- Start adding content, for example, a [db/schema.cds](db/schema.cds).


## Learn More

Learn more at https://cap.cloud.sap/docs/get-started/.


## Project Structure

- **app/**: Contains the UI5 applications for managing inventory, orders, and companies.
  - **inventory_management/**: UI5 application for managing inventory.
  - **order/**: UI5 application for managing orders.
  - **company/**: UI5 application for managing companies.
- **db/**: Contains the domain models and data definitions.
  - **schema.cds**: CDS file defining the database schema.
- **srv/**: Contains the service models and handlers.
  - **handlers/**: Contains the service handlers for custom logic.
    - **Product.handler.js**: Handler for product-related operations.
    - **Order.handler.js**: Handler for order-related operations.
    - **Company.handler.js**: Handler for company-related operations.
  - **inventory-service.cds**: CDS file defining the service for inventory management.
- **package.json**: Project metadata and configuration.
- **README.md**: This getting started guide.


## Authentication and Authorization

This project uses SAP XSUAA for authentication and authorization. The `xs-security.json` file defines the roles and scopes for the application.

### Mocked Authentication

For local development, mocked authentication is used. The `package.json` file includes the following configuration:

```json
"cds": {
  "requires": {
    "auth": {
      "kind": "mocked",
      "users": {
        "alice": {
          "roles": [
            "Admin"
          ]
        },
        "bob": {
          "roles": [
            "User"
          ]
        }
      }
    }
  }
}