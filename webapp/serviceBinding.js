function initModel() {
	var sUrl = "/sap/opu/odata/avelon/BORV_UI5_SRV/";
	var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
	sap.ui.getCore().setModel(oModel);
}