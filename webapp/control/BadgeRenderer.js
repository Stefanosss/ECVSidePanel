sap.ui.define([
  "jquery.sap.global",
  "sap/ui/core/Icon"
],

function(jQuery, Icon) {
  "use strict";

  /**
   * Badge renderer
   * @namespace
   */
 var BadgeRenderer = {};

  BadgeRenderer.render = function(oRm, oControl) {
    oRm.write("<div");
    oRm.writeControlData(oControl);
    oRm.addClass("sapMFlexBox");
    oRm.addClass("sapMFlexBoxAlignContentStretch");
    oRm.addClass("sapMFlexBoxAlignItemsStretch");
    oRm.addClass("sapMFlexBoxJustifyStart");
    oRm.addClass("sapMFlexBoxWrapNoWrap");
    oRm.addClass("sapMHBox");
    oRm.addClass("badge");
    oRm.writeClasses();
    oRm.write(">");

    this.renderIcon(oRm, oControl);
    this.renderNumber(oRm, oControl);
    oRm.write("</div>");
  };

  BadgeRenderer.renderIcon = function(oRm,oControl){
    var icon = oControl.getIcon();

    if (icon ) {
      icon.setSize("1.2rem");
      icon.setColor("#FFFFFF");
      oRm.renderControl(icon);
    }
  };

  BadgeRenderer.renderNumber = function(oRm,oControl){
    var number = oControl.getNumber();

    if(number.getText() != "" && number.getText() != " " && number.getText() != "0" ){ //don't display badge if number is undefined or 0
      number.toggleStyleClass( "hdbflowgraph-numeric-icon-text", true );
      oRm.renderControl(number);
    }
  };

  return BadgeRenderer;
}, /* bExport= */ true);
