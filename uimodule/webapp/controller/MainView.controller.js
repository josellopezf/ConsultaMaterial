sap.ui.define([
    "./BaseController",
    "SCO/BTP/ConsultaMaterial/model/models",
    "SCO/BTP/ConsultaMaterial/utils/utils",
	"SCO/BTP/ConsultaMaterial/utils/validator",
	"sap/m/MessageBox",
	"sap/m/MessagePopover"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     * @param {typeof SCO.BTP.ConsultaMaterial.model.models} models
     * @param {typeof SCO.BTP.ConsultaMaterial.utils.utils} utils
     * @param {typeof SCO.BTP.ConsultaMaterial.utils.validator} validator
     * @param {typeof sap.m.MessageBox} MessageBox
     * @param {typeof sap.m.MessagePopover} MessagePopover
     */
    function (Controller, models, utils, Validator, MessageBox, MessagePopover) {
        "use strict";

        return Controller.extend("SCO.BTP.ConsultaMaterial.controller.MainView", {
            onInit: function () {
                var oView = this.getView(),
				oModel = models.createLocalModel(),
				oFilters = {
					I_LISTA_MATNR : []
				};
			    
                utils.view = oView;
			    oView.setModel(oModel);
			    oView.bindElement("/Material");

			    oModel.setProperty("/Filters", oFilters);
			    this._oMessagePopover = new MessagePopover({
            	    items: {
			            path:"message>/",
			            template: new sap.m.MessageItem({ 
			        	    description: "{message>description}", 
			        	    type: "{message>type}", 
			        	    title: "{message>message}"
			            })
			        }
			    });
			    this.getView().addDependent(this._oMessagePopover);
            },

            handleValueHelpRequest : function (oEvent) {
                if (!this._oMaterialesDialog) {
                    this._oMaterialesDialog = sap.ui.xmlfragment("SCO.BTP.ConsultaMaterial.view.MaterialesDialog", this);
                    this.getView().addDependent(this._oMaterialesDialog);
                }
                this._oMaterialesDialog.open();
            },
    
            handleSearchChange : function (oEvent) {
                var sValue = oEvent.getParameter("value"),
                    oModel = this.getView().getModel();
                oModel.setProperty("/Query",sValue);
                oModel.setProperty("/Filters", {
                    I_LISTA_MATNR : [sValue]
                });
            },
    
            handleTomarPress : function (oEvent) {
                var oModel = this.getView().getModel(),
                    sQuery = oModel.getProperty("/Query"),
                    aMaterials = sQuery.split("\n"),
                    aI_LISTA_MATNR = [];
                if (!sQuery) {
                    return;
                }
                for (var i in aMaterials) {
                    if (aMaterials[i] !== "") {
                        aI_LISTA_MATNR.push({
                            MATNR : aMaterials[i]
                        });
                    }
                }
                oModel.setProperty("/Filters", {
                    I_LISTA_MATNR : aI_LISTA_MATNR
                });
                oModel.setProperty("/SearchText", aI_LISTA_MATNR.length === 1 ? aI_LISTA_MATNR[0].MATNR : aI_LISTA_MATNR[0].MATNR  + "... (" + aI_LISTA_MATNR.length + ")");
                this._oMaterialesDialog.close();
            },
    
            handleCancelarPress : function (oEvent) {
                this._oMaterialesDialog.close();
            },
    
            handleMessagePopoverPress : function (oEvent) {
                this._oMessagePopover.openBy(oEvent.getSource());
            },
    
            handleSearch : function (oEvent) {
                //Obtengo el valor del equipo para buscar
                var oModel = this.getView().getModel(),
                    oFilters = oModel.getProperty("/Filters");
    
                if (oFilters.I_LISTA_MATNR.length === 0) {
                    return;
                }
/*Jose Lopez                
                utils.httpCall({
                    service : "Z376R_BUSQ_MASIVA_MATERIALES",
                    query : oFilters,
                    type : "post",
                    success : function (result, status, xhr) {
                        oModel.setProperty("/Materials", result.T_DATOS_MATERIAL);
                    }
                });
Jose Lopez*/                
                var oScoModel = new sap.ui.model.json.JSONModel();
                oScoModel.loadData("/model/data.json");
                oScoModel.attachRequestCompleted(function(oEvent) {
                    const datosMaterial = oScoModel.getProperty("/Z376R_BUSQ_MASIVA_MATERIALES/response/T_DATOS_MATERIAL");
                    oModel.setProperty("/Materials", datosMaterial);
                })

            }
        });
    });
