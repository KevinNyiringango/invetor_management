sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel"
], function(UIComponent, JSONModel) {
    "use strict";

    return UIComponent.extend("productlist.Component", {
        
        init: function() {
            // Call parent init
            UIComponent.prototype.init.apply(this, arguments);
            console.log("Component initialized");
            
            // Set up the data model
            this.setupDataModel();
            
            // Create and display the main view
            this.createMainView();
        },

        setupDataModel: function() {
            var that = this;
            
            // Create JSON model
            var oModel = new JSONModel();
            
            // Set the model to the component
            this.setModel(oModel);
            
            // Fetch data from CAP service
            this.loadProductData();
        },

        loadProductData: function() {
            var oModel = this.getModel();
            var that = this;
            
            // Show loading state
            console.log("Loading product data from CAP service...");
            
            // Fetch data from your CAP service
            fetch("/odata/v4/inventory/Product")
                .then(function(response) {
                    if (!response.ok) {
                        throw new Error("HTTP " + response.status + " - " + response.statusText);
                    }
                    return response.json();
                })
                .then(function(data) {
                    console.log("Data loaded successfully:", data);
                    
                    // Set the data to the model
                    oModel.setData({
                        Product: data.value || []
                    });
                    
                    console.log("Model updated with", data.value ? data.value.length : 0, "products");
                })
                .catch(function(error) {
                    console.error("Error loading data:", error);
                    
                    // Set empty data on error
                    oModel.setData({
                        Product: []
                    });
                    
                    // Show error message
                    sap.m.MessageToast.show("Error loading product data: " + error.message);
                });
        },

        createMainView: function() {
            // Create the main view
            sap.ui.require([
                "sap/ui/core/mvc/XMLView"
            ], function(XMLView) {
                XMLView.create({
                    id: "mainView",
                    viewName: "productlist.view.Main"
                }).then(function(oView) {
                    // Place the view in a container
                    oView.placeAt("content");
                });
            });
        }
    });
});