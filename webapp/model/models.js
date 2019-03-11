sap.ui.define([
  "sap/ui/model/json/JSONModel",
  "sap/ui/Device",
  "sap/ui/model/odata/ODataModel",
  "sap/ui/model/resource/ResourceModel"
], function(JSONModel, Device, Odata, i18n) {
  "use strict";

  return {

    createDeviceModel: function() {
      var oModel = new JSONModel(Device);
      oModel.setDefaultBindingMode("OneWay");
      return oModel;
    },

    createMainModel:function(){
      //var oModel = new Odata("/sap/opu/odata/avelon/BORV_UI5_SRV/" );
      //START INSERT RG06022017
      //Faster loading of the model
      var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/avelon/BORV_UI5_SRV/" );
      //END INSERT RG06022017
      oModel.setDefaultBindingMode("TwoWay");
      return oModel;
    },

    createI18NModel:function(){
      var oModel = new i18n( {bundleName:"be.avelon.ecvborsearch.i18n.i18n",locale:"en"} );
      oModel.setDefaultBindingMode("OneWay");
      return oModel;

    }

  };

});