sap.ui.define([
  "sap/ui/core/Control",
  "sap/ui/core/Icon",
  "sap/m/Text"
],

function(Control, Icon, Text){
  "use strict";

 var Badge = Control.extend("be.avelon.ecvsidepanel.control.Badge", {
    library : "be.avelon.ecvsidepanel.control",
    metadata: {
      properties: {
      },
      aggregations: {
        number: {type: "sap.m.Text", multiple:false, bindable:true},
        icon: {type: "sap.ui.core.Icon", multiple:false, bindable:true}
      },
      defaultAggregation:"number"
    },
    renderer:"be.avelon.ecvsidepanel.control.BadgeRenderer"
  });

  Badge.prototype.init = function () {
    this.setAggregation( "icon", new Icon({src:"sap-icon://folder"}) );
    this.setAggregation( "number", new Text({text:""}) );
    return this;
  };

  Badge.prototype.setIcon = function (oIcon ) {
//    oIcon.setProperty("src", iSrc );
    this.setAggregation("icon", oIcon);
    return this;
  };

  Badge.prototype.getIcon = function () {
    return this.getAggregation("icon");
  };

  Badge.prototype.setNumber = function( oNumber ){
    this.setAggregation("number", oNumber );
    return this;
  };

//This is totally useless as the damn framework never calls it (at least not in this context)
/*  Badge.prototype.bindNumber = function( a,b,c ){
    return this;
  };*/

  Badge.prototype.getNumber = function () {
    return this.getAggregation("number");
  };

  Badge.prototype.onAfterRendering = function( ){
    return this;
  };

  return Badge;
});