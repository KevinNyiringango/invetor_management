sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'company/company/test/integration/FirstJourney',
		'company/company/test/integration/pages/CompanyList',
		'company/company/test/integration/pages/CompanyObjectPage'
    ],
    function(JourneyRunner, opaJourney, CompanyList, CompanyObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('company/company') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheCompanyList: CompanyList,
					onTheCompanyObjectPage: CompanyObjectPage
                }
            },
            opaJourney.run
        );
    }
);