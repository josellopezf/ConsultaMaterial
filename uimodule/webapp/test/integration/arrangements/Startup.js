sap.ui.define(
    ["sap/ui/test/Opa5"],
    /**
     * @param {typeof sap.ui.test.Opa5} Opa5
     */
    function (Opa5) {
        "use strict";

        return Opa5.extend("SCO.BTP.ConsultaMaterial.test.integration.arrangements.Startup", {
            iStartMyApp: function () {
                this.iStartMyUIComponent({
                    componentConfig: {
                        name: "SCO.BTP.ConsultaMaterial",
                        async: true,
                        manifest: true
                    }
                });
            }
        });
    }
);
