sap.ui.define([], function() {
  "use strict";
  return {
    count: function(oValue) {
      if (oValue) {
        return oValue.length;
      }
      return "0";

    },
    icon: function(oValue) {
      switch (oValue) {
        case "DOCUSHARE":
          return "sap-icon://document-text";
        case "":
          break;
      }
      return "sap-icon://folder";

    },
    noteitem: function(title, text) {
      var totalTextLength = title.length + text.length;
      if (totalTextLength < 50) {
        return title + " - " + text;
      } else {
        return title.substring(0,25) + " - " + text.substring(0, 25) + " ...";
      }
    }
  };
});