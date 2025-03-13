sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'inventory/inventorymanagement/test/integration/FirstJourney',
		'inventory/inventorymanagement/test/integration/pages/ProductList',
		'inventory/inventorymanagement/test/integration/pages/ProductObjectPage'
    ],
    function(JourneyRunner, opaJourney, ProductList, ProductObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('inventory/inventorymanagement') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheProductList: ProductList,
					onTheProductObjectPage: ProductObjectPage
                }
            },
            opaJourney.run
        );
    }
);