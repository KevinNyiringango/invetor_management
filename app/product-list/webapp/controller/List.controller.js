sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageBox",
  "sap/m/MessageToast"
], function(Controller, MessageBox, MessageToast) {
  "use strict";

  return Controller.extend("productlist.controller.List", {
    onInit: function() {
      console.log("Controller initialized");
      
      // Get the model
      var oModel = this.getView().getModel();
      
      // Check if model exists
      if (!oModel) {
        console.error("No model found");
        MessageBox.error("No data model available");
        return;
      }

      console.log("Model found:", oModel.getMetadata().getName());
    },

    onAfterRendering: function() {
      console.log("View rendered");
      var oTable = this.byId("productTable");
      
      if (!oTable) {
        console.error("Table not found");
        return;
      }

      var oBinding = oTable.getBinding("items");
      if (oBinding) {
        console.log("Table binding exists:", oBinding.getPath());
        
        // Add event listeners
        oBinding.attachDataReceived(function(oEvent) {
          console.log("Data received event triggered");
          var aContexts = oBinding.getCurrentContexts();
          console.log("Current contexts:", aContexts.length);
          
          // Update title with count
          var oTitle = this.byId("productTable").getHeaderToolbar().getContent()[0];
          oTitle.setText("Products (" + aContexts.length + ")");
          
          MessageToast.show("Loaded " + aContexts.length + " products");
        }.bind(this));

        oBinding.attachChange(function() {
          console.log("Binding changed");
          var aItems = oTable.getItems();
          console.log("Table items count:", aItems.length);
          
          // Log first few items for debugging
          aItems.slice(0, 3).forEach(function(oItem, index) {
            var oContext = oItem.getBindingContext();
            if (oContext) {
              console.log("Item " + index + ":", oContext.getObject());
            }
          });
        });

        // Force refresh
        console.log("Forcing binding refresh");
        oBinding.refresh();
      } else {
        console.error("No table binding found");
      }
    },

    onRefresh: function() {
      console.log("Refresh button pressed");
      var oTable = this.byId("productTable");
      var oBinding = oTable.getBinding("items");
      
      if (oBinding) {
        oBinding.refresh();
        MessageToast.show("Refreshing products...");
      }
    },

    onItemPress: function(oEvent) {
      var oContext = oEvent.getSource().getBindingContext();
      if (oContext) {
        var oData = oContext.getObject();
        MessageBox.information(
          "Product Details:\n\n" +
          "ID: " + oData.ID + "\n" +
          "Name: " + oData.Name + "\n" +
          "Description: " + (oData.Description || "N/A") + "\n" +
          "Category: " + (oData.Category || "N/A") + "\n" +
          "Price: " + (oData.UnitPrice || "N/A")
        );
      }
    }
  });
});