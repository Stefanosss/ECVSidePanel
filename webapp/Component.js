sap.ui.define([
  "sap/ui/core/UIComponent",
  "sap/ui/Device",
  "be/avelon/ecvsidepanel/model/models",
  "sap/ui/base/ManagedObject"
], function(UIComponent, Device, models, ManagedObject) {
  "use strict";
  return UIComponent.extend("be.avelon.ecvsidepanel.Component", {
    _oBus: null,
    metadata: {
      manifest: "json"
    },

    init: function() {
      /*sap.ui.localResources("be.avelon.ecvsidepanel","");
       call the base component's init function*/
      UIComponent.prototype.init.apply(this, arguments);
      /*ALL of this, is a correction due to version differences
      the avelon BORV components have been developed in WEBIDE, under UI5 version 1.30
      however, to cater for backward compatibilty, we redefine the models here
      earlier UI5 versions do not support manifest models definitions.*/
      if (!this.getModel()) {
        this.setModel(models.createMainModel());
      }
      if (!this.getModel("i18n")) {
        this.setModel(models.createI18NModel(), "i18n");

      }
      //---------------------------------------------------
      // set the device model
      this.setModel(models.createDeviceModel(), "device");
      var oModel = this.getModel();
      if (oModel) {
        oModel.attachMetadataLoaded(function(oEvent) {
          this.listenToParameters(oEvent);
        }.bind(this)); //don't load search until after metadata
      }
      this._oBus = sap.ui.getCore().getEventBus();
      this._oBus.subscribe("ECV", "search", this.onSearch, this); //listen to outside events



    },
    onSearch: function(scope, method, data) {
      //trigger view binding (although I could do that directly too)
      this.getEventBus().publish("ECV",
        "search", {
          catid: data.catid,
          typeid: data.typeid,
          instid: data.instid
        });
    },
    /*  I need a method here to check URL parameters
      but it also has to listen to the NWBC tags
      and it must also listen to the proprietary ECV tags (which appear to be URL parameters)*/
    listenToParameters: function(oEvent) {
      /*  Check that the Data Context API is available, and if it is register it to listen for "changedWithXML" event, which is triggered
         Initially when the Side Panel is loaded and everytime the Data Context is changed*/
      if (window.external.DataContext !== undefined) {
        window.external.epcm.subscribeEventReliable("com.sap.lsapi.dataContext", "changedWithXML", this, "OnChangedWithXML");
      }
      var catid = oEvent.getParameter("catid");
      var typeid = oEvent.getParameter("typeid");
      var instid = oEvent.getParameter("instid");
      //if things came via the URL parameters: go
      if (catid && typeid && instid) {
        this.onSearch("ECV", "search", {
          catid: catid,
          typeid: typeid,
          instid: instid
        });
        return;
      }
      catid = this.queryString().catid;
      typeid = this.queryString().typeid;
      instid = this.queryString().instid;
      //if things came via the URL parameters: go
      if (catid && typeid && instid) {
        this.onSearch("ECV", "search", {
          catid: catid,
          typeid: typeid,
          instid: instid
        });
        return;
      }
    },
    //event handler for event forwarding - done by NWBC
    OnChangedWithXML: function(evtObject) {
      //Get the Object Type and Object Key from the DataContext API
      var typeid = window.external.DataContext.read("/BSSP/:BORTYPE", "CANVAS_appData", null);
      var instid = window.external.DataContext.read("ZOBJKEY", "CANVAS_appData", null);
      var catid = window.external.DataContext.read("CATID", "CANVAS_appData", null);
      if (catid && typeid && instid) {
        this.onSearch("ECV", "search", {
          catid: catid,
          typeid: typeid,
          instid: instid
        });
      }
    },
    /* This function is anonymous, is executed immediately and
     the return value is assigned to QueryString!*/
    queryString: function() {
      var queryString = {};
      var query = window.location.search.substring(1);
      var vars = query.split("&");
      for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        // If first entry with this name
        if (typeof queryString[pair[0]] === "undefined") {
          queryString[pair[0]] = decodeURIComponent(pair[1]);
          // If second entry with this name
        } else if (typeof queryString[pair[0]] === "string") {
          var arr = [queryString[pair[0]], decodeURIComponent(pair[1])];
          queryString[pair[0]] = arr;
          // If third or later entry with this name
        } else {
          queryString[pair[0]].push(decodeURIComponent(pair[1]));
        }
      }
      return queryString;
    }
  });
});