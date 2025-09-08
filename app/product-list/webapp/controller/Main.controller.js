sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, MessageToast, MessageBox, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("productlist.controller.Main", {

        onInit: function () {
            // Initialize the smart table
            this._initializeSmartTable();
        },

        _initializeSmartTable: function () {
            var oSmartTable = this.byId("smartTable");
            
            if (oSmartTable) {
                // Set table properties
                oSmartTable.setUseExportToExcel(true);
                oSmartTable.setUseTablePersonalisation(true);
                oSmartTable.setUseVariantManagement(true);
                
                // Enable auto binding
                oSmartTable.attachInitialise(function() {
                    oSmartTable.rebindTable();
                });
            }
        },

        onRefresh: function () {
            var oSmartTable = this.byId("smartTable");
            if (oSmartTable) {
                oSmartTable.rebindTable();
                MessageToast.show("Table refreshed successfully!");
            }
        },

        onItemPress: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext();
            var oSelectedItem = oContext.getObject();
            
            MessageToast.show("Selected: " + oSelectedItem.Name);
            
            // Navigate to detail view or open dialog
            this._openProductDetail(oSelectedItem);
        },

        onAddProduct: function () {
            MessageToast.show("Add Product functionality - implement as needed");
            // Implement add product dialog/navigation
        },

        onEditProduct: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext();
            var oProduct = oContext.getObject();
            
            MessageToast.show("Edit: " + oProduct.Name);
            // Implement edit functionality
        },

        onDeleteProduct: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext();
            var oProduct = oContext.getObject();
            
            MessageBox.confirm(
                "Are you sure you want to delete '" + oProduct.Name + "'?",
                {
                    onClose: function (oAction) {
                        if (oAction === MessageBox.Action.OK) {
                            this._deleteProduct(oProduct);
                        }
                    }.bind(this)
                }
            );
        },

        _deleteProduct: function (oProduct) {
            // Implement delete logic here
            MessageToast.show("Product deleted: " + oProduct.Name);
        },

        _openProductDetail: function (oProduct) {
            // Implement product detail view
            MessageToast.show("Opening details for: " + oProduct.Name);
        },

        // Formatter functions for enhanced display
        formatStockState: function (iQuantity, iMinStock) {
            if (!iQuantity || !iMinStock) return "None";
            
            var fQuantity = parseInt(iQuantity);
            var fMinStock = parseInt(iMinStock);
            
            if (fQuantity <= 0) {
                return "Error"; // Out of stock - red
            } else if (fQuantity <= fMinStock) {
                return "Warning"; // Low stock - orange
            } else if (fQuantity <= fMinStock * 2) {
                return "Information"; // Medium stock - blue
            } else {
                return "Success"; // Good stock - green
            }
        },

        calculateStockPercentage: function (iQuantity, iMinStock) {
            if (!iQuantity || !iMinStock) return 0;
            
            var fQuantity = parseInt(iQuantity);
            var fMinStock = parseInt(iMinStock);
            
            // Calculate percentage based on minimum stock level
            var fPercentage = (fQuantity / (fMinStock * 3)) * 100; // Assuming 3x min stock is 100%
            return Math.min(fPercentage, 100);
        },

        formatTimeAgo: function (sDate) {
            if (!sDate) return "";
            
            var oDate = new Date(sDate);
            var oNow = new Date();
            var iDaysDiff = Math.floor((oNow - oDate) / (1000 * 60 * 60 * 24));
            
            if (iDaysDiff === 0) {
                return "Today";
            } else if (iDaysDiff === 1) {
                return "Yesterday";
            } else if (iDaysDiff < 7) {
                return iDaysDiff + " days ago";
            } else if (iDaysDiff < 30) {
                var iWeeks = Math.floor(iDaysDiff / 7);
                return iWeeks + (iWeeks === 1 ? " week ago" : " weeks ago");
            } else {
                var iMonths = Math.floor(iDaysDiff / 30);
                return iMonths + (iMonths === 1 ? " month ago" : " months ago");
            }
        }
    });
});