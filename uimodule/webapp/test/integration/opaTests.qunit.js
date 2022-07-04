/* global QUnit */

QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
    "use strict";

    sap.ui.require(["SCO/BTP/ConsultaMaterial/test/integration/AllJourneys"], function () {
        QUnit.start();
    });
});
