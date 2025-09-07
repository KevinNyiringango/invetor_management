sap.ui.define([
  "sap/ui/core/ComponentContainer"
], function(ComponentContainer) {
  "use strict";

  new ComponentContainer({
    name: "productlist",
    settings: {
      id: "productlist"
    },
    async: true
  }).placeAt("content");
});