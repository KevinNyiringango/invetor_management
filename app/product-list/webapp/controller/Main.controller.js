sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function(Controller, MessageBox, MessageToast) {
    "use strict";

    return Controller.extend("productlist.controller.Main", {
        
        onInit: function() {
            console.log("Main controller initialized");
            
            // Update table title when view is initialized
            var oModel = this.getView().getModel();
            if (oModel) {
                oModel.attachPropertyChange(this.updateTableTitle.bind(this));
                this.updateTableTitle();
            }
        },

        onAfterRendering: function() {
            console.log("View rendered");
            this.updateTableTitle();
        },

        updateTableTitle: function() {
            var oModel = this.getView().getModel();
            var oTitle = this.byId("tableTitle");
            
            if (oModel && oTitle) {
                var aProducts = oModel.getProperty("/Product");
                if (aProducts && aProducts.length > 0) {
                    oTitle.setText("Products (" + aProducts.length + ")");
                    console.log("Table title updated with", aProducts.length, "products");
                } else {
                    oTitle.setText("Products (0)");
                }
            }
        },

        onRefresh: function() {
            console.log("Refresh button pressed");
            MessageToast.show("Refreshing products...");
            
            var oModel = this.getView().getModel();
            
            // Reload data from CAP service
            fetch("/odata/v4/inventory/Product")
                .then(function(response) {
                    if (!response.ok) {
                        throw new Error("HTTP " + response.status + " - " + response.statusText);
                    }
                    return response.json();
                })
                .then(function(data) {
                    console.log("Data refreshed successfully:", data);
                    oModel.setData({
                        Product: data.value || []
                    });
                    MessageToast.show("Products refreshed successfully!");
                })
                .catch(function(error) {
                    console.error("Error refreshing data:", error);
                    MessageToast.show("Error refreshing products: " + error.message);
                });
        },

        onItemPress: function(oEvent) {
            var oContext = oEvent.getSource().getBindingContext();
            if (oContext) {
                var oProduct = oContext.getObject();
                
                var sMessage = "Product Details:\n\n" +
                    "ID: " + oProduct.ID + "\n" +
                    "Name: " + oProduct.Name + "\n" +
                    "Description: " + (oProduct.Description || "N/A") + "\n" +
                    "Category: " + (oProduct.Category || "N/A") + "\n" +
                    "Unit Price: " + oProduct.UnitPrice + " RWF\n" +
                    "Quantity: " + oProduct.Quantity + "\n" +
                    "Minimum Stock: " + oProduct.MinimumStockLevel + "\n" +
                    "Last Updated: " + oProduct.LastUpdated + "\n" +
                    "Active Entity: " + (oProduct.IsActiveEntity ? "Yes" : "No");

                MessageBox.information(sMessage, {
                    title: "Product Information"
                });
            }
        }
    });
});