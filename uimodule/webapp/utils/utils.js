sap.ui.define([
    "sap/m/MessageBox"
], function (MessageBox) {
    "use strict";

    return {
        _pendingRequests: 0,

        httpCall: function (params) {
            var that = this;
            that._pendingRequests++;
            that.view.setBusy(true);

            var dataResult = {};

            params.query = params.query ? params.query : {};
            params.query.format = 'json';

            var url = "/SalfaCloud/" + params.service;
            if (!window.location.href.includes('https')) {
                url = "https://flpnwc-d69a1fd3a.dispatcher.us2.hana.ondemand.com/sap/fiori/app00480consultamateriales" + url;
            }

            $.ajax({
                url: url,
                contentType: 'application/json',
                headers: params.headers ? params.headers : {},
                type: params.type ? params.type : "GET",
                dataType: params.dataType ? params.dataType : "JSON",
                async: params.async ? params.async : true,
                data: params.type && params.type.toLowerCase() === 'post' ? JSON.stringify(params.query) : params.query,
                error: params.error ? params.error : function (e) {
                    try {
                        MessageBox.error("Se ha producido un error al comunicarse con los servicios de Backend. \n\n Código HTTP " + e.responseJSON.ERROR_CODE + " - " + e.responseJSON.ERROR_MESSAGE);
                    }
                    catch (err) {
                        MessageBox.error("No ha podido comunicarse con los servicios de SCP");
                    }
                },
                success: params.success,
            }).always(function () {
                that._pendingRequests--;
                if (that._pendingRequests === 0) {
                    that.view.setBusy(false);
                }
            });

            return dataResult;
        },

        /**
         * Hace un group by de objetos
         * @param list array de objetos
         * @param keyGetter clave por la que agrupar
         * @returns un objeto con keyGetter como claves y arrays de objetos de list como valor
         */
        groupBy(list, keyGetter) {
            const map = {};
            list.forEach((item) => {
                const key = keyGetter(item);
                const collection = map[key];
                if (!collection) {
                    map[key] = [item];
                } else {
                    collection.push(item);
                }
            });
            return map;
        },

        /**
         * Crea un dialogo que muestra una tabla con datos
         * @param model el modelo con los datos a mostrar
         * @param title el titulo de la tabla
         * @param columns array con objetos de la forma {header: <titulo columna>, bind: <atributo del modelo>}
         */
        openTableDialog: function (model, title, columns) {
            var that = this;
            if (that.tableDialog) {
                that.tableDialog.destroy()
            }
            this.tableDialog = new sap.m.Dialog({
                title: title,
                content: new sap.ui.table.Table({
                    rows: '{/' + model + '}',
                    selectionMode: "None",
                    columns: columns.map((c) =>
                        new sap.ui.table.Column({
                            label: new sap.m.Label({
                                text: c.header
                            }),
                            template: new sap.m.Text({
                                text: '{' + c.bind + '}'
                            }),
                            sortProperty: c.bind,
                            filterProperty: c.bind
                        })
                    ),
                }).setModel(that.view.getModel()),
                beginButton: new sap.m.Button({
                    text: 'Close',
                    press: function () {
                        that.tableDialog.close();
                    }.bind(that)
                })
            });
            that.tableDialog.open();
        },

        getUserData: function (success) {
            var user = this.getUser();

            // carga de localstorage y se fija que sea del mismo usuario para cuando se loguea otro. si esta bien, retorna eso
            var rawUserData = localStorage['userData'];
            if (rawUserData) {
                var userData = JSON.parse(rawUserData);
                if (userData['E_USUARIO'] && userData['E_USUARIO']['ID_USUARIO'] === user) {
                    success(userData);
                    return;
                }
            }

            // si no esta en local storage o lo que hay es de otro usuario, busca lo nuevo
            this.httpCall({
                service: 'ZPWD_004_DATUSER',
                query: {'I_IDUSER': this.getUser()},
                success: resp => {
                    localStorage['userData'] = JSON.stringify(resp);
                    success(resp);
                }
            });
        },

        getUser: function () {
            if (!this.user) {
                var that = this,
                    url = "/services/userapi/currentUser";
                if (!window.location.href.includes('https')) {
                    url = "https://flpnwc-d69a1fd3a.dispatcher.us2.hana.ondemand.com/sap/fiori/app00050listadopicking" + url;
                }
                $.ajax({
                    contentType: 'application/json',
                    headers: {},
                    type: "GET",
                    async: false,
                    url: url,
                    error: function (e) {
                        MessageBox.error("No ha podido obtener los datos de usuario");
                    },
                    success: function (result, status, xhr) {
                        that.user = result.name.toUpperCase();
                    }
                });
            }

            return this.user;
        }
    };
});