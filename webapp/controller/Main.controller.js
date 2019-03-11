/*eslint-disable no-console, no-alert */
sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageToast",
  "sap/m/Dialog",
  "sap/m/Button",
  "sap/m/Text",
  "sap/m/Link",
  "sap/m/MessageBox",
  "be/avelon/ecvsidepanel/util/formatter"
], function(Controller, MessageToast, Dialog, Button, Text, Link, MessageBox, Formatter) {
  "use strict";

  return Controller.extend("be.avelon.ecvsidepanel.controller.Main", {
    _oBus : null,
    formatter : Formatter,
    _modelUpdate : function(oEvent) {
      this._onModelUpdate(oEvent);
    },
    onDelete : function (oEvent)
    {
      var item = oEvent.getSource().getBindingContext();
      var oModel = this.getView().getModel();
      var itemInstId = item.getProperty("ItemInstID");
      var filename = item.oModel.getProperty(item.sPath + "/NodeValue");

      var regex = /([EXT])\w+/g;
      var itemFolderId = itemInstId.slice(0,17);
      var itemObjectId = itemInstId.slice(17);

      MessageBox.confirm("Are you sure if you want to delete "+filename+"?", {
          Title: "Delete file",
          onClose: function (sButton) {
            if (sButton === MessageBox.Action.OK) {
                oModel.read("/DELETE_ATTACHMENT", {
                      method: "GET",
                          urlParameters: {
                                 CATID:  "'" + item.getProperty("ItemCatid") + "'"  ,
                                 BORINSTID:   "'" + item.getProperty("BORInstid") +"'" ,
                                 INSTID: "'"+ item.getProperty("ItemInstID") +"'",
                                 BORTYPEID: "'"+ item.getProperty("BORTypeid") +"'",
                                 ITEMFOLDERID: "'"+ itemFolderId +"'",
                                 ITEMOBJECTID: "'"+ itemObjectId +"'"



                                            },
                            success: function(oData) {
                            oModel.refresh(true);
                            MessageToast.show(filename + " Successfully deleted", {
                            duration: 2000
                            });
                            }.bind(this),
                            error: function(oError) {
                            MessageToast.show("Something went wrong. Please try again.", {
                            duration: 2000
                            });
                            }.bind(this)
                            });
                            }
                            }.bind(this)
                       });

    },

    onInit : function(oEvent) {
    	debugger;
      if (this.getOwnerComponent()) {
      	this.byId("navGroups").setBusy(false);
               this._oBus = this.getOwnerComponent().getEventBus();
               this._oBus.subscribe("ECV", "search", this.onSearch, this);
               debugger;
      }
    },

    // onAfterRendering : function(oEvent) {
    // 	debugger;
    //   this.getView().getModel().attachRequestCompvared(function(oRequest) {
    //     this.byId("navGroups").setBusy(false);
    //     var url = oRequest.getParameter("url");
    //     var response = oRequest.getParameter("response");
    //     debugger;
    //   }.bind(this));
    //   debugger;
    // },

    onSearch : function(scope, method, data) {
    	debugger;
      let oBreadCrumbs = this.byId("breadCrumbs");
      let addButton = this.byId("addButton");
      if (data.catid === "" || data.typeid === "" || data.instid === "") {
        // Nothing passed, clear screen
        oBreadCrumbs.removeAllLinks();
        this.getView().byId("navGroups").destroyItems();
        addButton.setProperty("enabled", false);
        this.getView().byId("ecvPage").setTitle("");
      } else {
        let oGroups = this.byId("navGroups");
        oGroups.setBusy(false);
        addButton.setProperty("enabled", true);
        // set binding for view
        let sPath = "/BOR(Catid='" + data.catid + "',Typeid='" + data.typeid + "',Instid='" + data.instid + "')?$expand=Groups";
        this.getSharepointDocuments(data);
        this.getView().bindElement(sPath);
        this.getView().rerender();
		debugger;
        /* FIX - 1 */
        /*
         * After clicking a customer, navigating back to search results &
         * clicking the same customer again, the navGroups werent
         * displayed
         */
        this.byId('navGroups').getModel().refresh(true);
        this.byId("navGroups").rerender();
        /* END FIX - 1 */

        let that = this;
        let oBreadCrumbs = this.byId("breadCrumbs");
        let crumbLength = oBreadCrumbs.getLinks().length;
		debugger;
        /*
         * We only want to show the first breadcrumb, the other
         * breadcrumbs will be shown during method onShowSub
         */
       if (crumbLength < 1) {

          if (data.catid !== null && data.typeid !== null && data.instid !== null) {
            let oModel = this.getOwnerComponent().getModel();

            oModel.read("/BOR(Instid='" + data.instid + "',Typeid='" + data.typeid + "',Catid='" + data.catid + "')", {
              success : function(oData, response) {
                let crumbText = oData.NodeValue;
                let link = new Link({ text : crumbText });
                link.attachEvent("press", function(){
                  that.onClickBreadCrumb(data.catid, data.typeid, data.instid, link);
				console.log(oData);

                });
                oBreadCrumbs.addLink(link);

              },
              error : function(response) {
                // alert("error");
              }
            });

          }
        }
      }

      var oPanelHeader = this.byId('toolbarSubgroup');
      oPanelHeader.attachBrowserEvent("click", function() {
          this.getParent().setExpanded(!this.getParent().getExpanded());
      });
    },
    onShowSub : function(oEvent) {
      let oCtx = oEvent.getSource().getBindingContext();
      let catid = oCtx.getProperty("ItemCatid");
      let typeid = oCtx.getProperty("ItemTypeid");
      let instid = oCtx.getProperty("ItemInstID");
      this._oBus.publish("ECV", "search", {
        catid : catid,
        typeid : typeid,
        instid : instid
      });
      // -----------------BEGIN INSERT
      // RG06022017------------------------
      let that = this;
      let crumbCatId = oCtx.getProperty("ItemCatid");
      let crumbTypeId = oCtx.getProperty("ItemTypeid");
      let crumbInstId = oCtx.getProperty("ItemInstID");
      let oBreadCrumbs = this.byId("breadCrumbs");
      let crumbText = oCtx.oModel.getProperty(oCtx.sPath + "/NodeValue");
      let link = new Link({ text : crumbText });
      link.attachEvent("press", function(){
        that.onClickBreadCrumb(catid, typeid, instid, link);
      }.bind(this));
      oBreadCrumbs.addLink(link);
      this.getView().rerender();
    },
    onClickBreadCrumb : function(crumbCatId, crumbTypeId, crumbInstId, link) {
      // Remove links at the right side
      var oModel = this.getView().getModel();
      let oBreadCrumbs = this.byId("breadCrumbs");
      let crumbIndex = oBreadCrumbs.indexOfLink(link);
      let allCrumbs = oBreadCrumbs.getLinks();
      for (var i = 0; i < allCrumbs.length; i++) {
        if (crumbIndex < i) {
          oBreadCrumbs.removeLink(crumbIndex + 1);
        }
      }
      // Navigation
      this._oBus.publish("ECV", "search", {
        catid : crumbCatId,
        typeid : crumbTypeId,
        instid : crumbInstId
      });
      oModel.refresh(true);
      // -----------------END INSERT
      // RG06022017------------------------
    },
    // -----------------BEGIN INSERT
    // RG21022017----------------------
    // Open Add Dialog
    openAddPopOver : function(oEvent) {
      if (!this.oAttachmentDialog) {
        this.oAttachmentDialog = sap.ui.xmlfragment("be.avelon.ecvsidepanel.fragment.AttachmentPopover", this);
        this.getView().addDependent(this.oAttachmentDialog);
      }
      jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this.oAttachmentDialog);
      this.oAttachmentDialog.open();
      sap.ui.getCore().byId("rdbCreateAttachment").setProperty("selected", true);
      sap.ui.getCore().byId("componentsExtDoc").setVisible(false);
      sap.ui.getCore().byId("componentsPrivateNote").setVisible(false);
      sap.ui.getCore().byId("componentsNote").setVisible(false);
      sap.ui.getCore().byId("btnCreateExtDoc").setVisible(false);
      sap.ui.getCore().byId("btnCreateNote").setVisible(false);
      sap.ui.getCore().byId("btnCreatePrivateNote").setVisible(false);
      sap.ui.getCore().byId("btnUploadAttachment").setVisible(true);
      sap.ui.getCore().byId("componentsFileUploader").setVisible(true);

      var oModel = this.getView().getModel();

      var test = oModel.getProperty("/Groups(Instid='51056002712015',Typeid='BUS2081',Catid='BO',GroupId='PERSNOTE')");
    },
    handleAttachmentCloseButton : function(oEvent) {
      this.oAttachmentDialog.close();
    },
    handleUploadFileButton : function(oEvent) {
      var oCtx = oEvent.getSource().getBindingContext();
      var catid = oCtx.getProperty("Catid");
      var typeid = oCtx.getProperty("Typeid");
      var instid = oCtx.getProperty("Instid");
      var self = this;
      var fileUploader = sap.ui.getCore().byId("fileUploader");
      var file = jQuery.sap.domById(fileUploader.getId() + "-fu").files[0];
      var fileContent;
      // var file =
      // oEvent.getParameter("files") &&
      // oEvent.getParameter("files")[0];
      // var fileName =
      // oEvent.getParameter("newValue");
      // If no file selected
      if (typeof file !== "undefined" && file !== null) {
        var fileName = file.name;
        if (file && window.FileReader) {
          var reader = new FileReader();
          reader.onload = readSuccess;

          function readSuccess(evt) {
            var result = evt.target.result;
            fileContent = result;
            self.sendAttachmentDataToEntitySet(fileName, fileContent, catid, typeid, instid);
          }
          ;
        }
        // reader.readAsText(file);
        // As base64
        reader.readAsDataURL(file);
      } else {
        MessageToast.show("No file selected");
      }
    },
    sendAttachmentDataToEntitySet : function(fileName, fileContent, catid, typeid, instid) {
      var oModel = this.getView().getModel();
      var that = this;
      // Create Attachment (Call
      // entitySet)
      var oEntry = {};
      // The base64 decoder only needs the
      // part after base64
      fileContent = fileContent.substr(fileContent.indexOf('base64,') + 7);
      oEntry.CatId = catid;
      oEntry.TypeId = typeid;
      oEntry.InstId = instid;
      oEntry.FileContent = fileContent;
      oEntry.FileName = fileName;
      oModel.create('/AttachmentSet', oEntry, {
        success : function(oData, oResponse) {
          MessageToast.show("Attachment Created");
          that._oBus.publish("ECV", "search", {
            catid : catid,
            typeid : typeid,
            instid : instid
          });
          oModel.refresh(true);
        },
        error : function(oError) {
          MessageToast.show("Attachment Creation failed");
        }
      });
      this.oAttachmentDialog.close();
    },
    // Dialog Radio button selection
    onSelectedAttachmentRadioButton : function(oEvent) {
      var selectedIndex = oEvent.getParameter("selectedIndex");
      switch (selectedIndex) {
      case 0:
        sap.ui.getCore().byId("componentsExtDoc").setVisible(false);
        sap.ui.getCore().byId("componentsPrivateNote").setVisible(false);
        sap.ui.getCore().byId("componentsNote").setVisible(false);
        sap.ui.getCore().byId("componentsFileUploader").setVisible(true);
        sap.ui.getCore().byId("btnCreateExtDoc").setVisible(false);
        sap.ui.getCore().byId("btnCreateNote").setVisible(false);
        sap.ui.getCore().byId("btnCreatePrivateNote").setVisible(false);
        sap.ui.getCore().byId("btnUploadAttachment").setVisible(true);
        break;
      case 1:
        sap.ui.getCore().byId("componentsPrivateNote").setVisible(false);
        sap.ui.getCore().byId("componentsNote").setVisible(false);
        sap.ui.getCore().byId("componentsFileUploader").setVisible(false);
        sap.ui.getCore().byId("componentsExtDoc").setVisible(true);
        sap.ui.getCore().byId("btnCreateExtDoc").setVisible(true);
        sap.ui.getCore().byId("btnCreateNote").setVisible(false);
        sap.ui.getCore().byId("btnCreatePrivateNote").setVisible(false);
        sap.ui.getCore().byId("btnUploadAttachment").setVisible(false);
        break;
      case 2:
        sap.ui.getCore().byId("componentsExtDoc").setVisible(false);
        sap.ui.getCore().byId("componentsPrivateNote").setVisible(false);
        sap.ui.getCore().byId("componentsFileUploader").setVisible(false);
        sap.ui.getCore().byId("componentsNote").setVisible(true);
        sap.ui.getCore().byId("btnCreateExtDoc").setVisible(false);
        sap.ui.getCore().byId("btnCreateNote").setVisible(true);
        sap.ui.getCore().byId("btnCreatePrivateNote").setVisible(false);
        sap.ui.getCore().byId("btnUploadAttachment").setVisible(false);
        break;
      case 3:
        sap.ui.getCore().byId("componentsExtDoc").setVisible(false);
        sap.ui.getCore().byId("componentsNote").setVisible(false);
        sap.ui.getCore().byId("componentsFileUploader").setVisible(false);
        sap.ui.getCore().byId("componentsPrivateNote").setVisible(true);
        sap.ui.getCore().byId("btnCreateExtDoc").setVisible(false);
        sap.ui.getCore().byId("btnCreateNote").setVisible(false);
        sap.ui.getCore().byId("btnCreatePrivateNote").setVisible(true);
        sap.ui.getCore().byId("btnUploadAttachment").setVisible(false);
        break;
      default:
      }
    },
    handleCreateNoteButton : function(oEvent) {
      var oModel = this.getView().getModel();
      var that = this;
      var oCtx = oEvent.getSource().getBindingContext();
      var catid = oCtx.getProperty("Catid");
      var typeid = oCtx.getProperty("Typeid");
      var instid = oCtx.getProperty("Instid");
      var noteTitle = sap.ui.getCore().byId("txtNoteTitle").getValue();
      var noteText = sap.ui.getCore().byId("txtNote").getValue();
      // Input check
      if (noteTitle === "" || noteText === "") {
        sap.ui.getCore().byId("txtNoteTitle").setValueState(sap.ui.core.ValueState.Error);
        sap.ui.getCore().byId("txtNote").setValueState(sap.ui.core.ValueState.Error);
      } else {
        // Create note (Call entitySet)
        var oEntry = {};
        oEntry.NoteTitle = noteTitle;
        oEntry.NoteText = noteText;
        oEntry.CatId = catid;
        oEntry.TypeId = typeid;
        oEntry.InstId = instid;
        oEntry.Operation = "create";
        oModel.create('/NoteSet', oEntry, {
          success : function(oData, oResponse) {
            MessageToast.show("Note Created");
            that._oBus.publish("ECV", "search", {
              catid : catid,
              typeid : typeid,
              instid : instid
            });
            oModel.refresh(true);
          },
          error : function(oError) {
            MessageToast.show("Note Creation failed");
          }
        });
        this.handleAttachmentCloseButton(oEvent);
        sap.ui.getCore().byId("txtNoteTitle").setValue('');
        sap.ui.getCore().byId("txtNote").setValue('');
        sap.ui.getCore().byId("txtNoteTitle").setValueState(sap.ui.core.ValueState.None);
        sap.ui.getCore().byId("txtNote").setValueState(sap.ui.core.ValueState.None);
      }
    },
    handleCreatePrivateNoteButton : function(oEvent) {
      var oModel = this.getView().getModel();
      var that = this;
      var oCtx = oEvent.getSource().getBindingContext();
      var catid = oCtx.getProperty("Catid");
      var typeid = oCtx.getProperty("Typeid");
      var instid = oCtx.getProperty("Instid");
      var noteTitle = sap.ui.getCore().byId("txtPrivateNoteTitle").getValue();
      var noteText = sap.ui.getCore().byId("txtPrivateNote").getValue();
      // Input check
      if (noteTitle === "" || noteText === "") {
        sap.ui.getCore().byId("txtPrivateNoteTitle").setValueState(sap.ui.core.ValueState.Error);
        sap.ui.getCore().byId("txtPrivateNote").setValueState(sap.ui.core.ValueState.Error);
      } else {
        // Create note (Call entitySet)
        var oEntry = {};
        oEntry.NoteTitle = noteTitle;
        oEntry.NoteText = noteText;
        oEntry.CatId = catid;
        oEntry.TypeId = typeid;
        oEntry.InstId = instid;
        oEntry.Operation = "createPersonal";
        oModel.create('/NoteSet', oEntry, {
          success : function(oData, oResponse) {
            MessageToast.show("Note Created");
            that._oBus.publish("ECV", "search", {
              catid : catid,
              typeid : typeid,
              instid : instid
            });
            oModel.refresh(true);
          },
          error : function(oError) {
            MessageToast.show("Note Creation failed: there is only one personal note allowed");
          }
        });
        this.handleAttachmentCloseButton(oEvent);
        sap.ui.getCore().byId("txtPrivateNoteTitle").setValue('');
        sap.ui.getCore().byId("txtPrivateNote").setValue('');
        sap.ui.getCore().byId("txtPrivateNoteTitle").setValueState(sap.ui.core.ValueState.None);
        sap.ui.getCore().byId("txtPrivateNote").setValueState(sap.ui.core.ValueState.None);
      }
    },
    handleCreateExtDocButton : function(oEvent) {
      var oModel = this.getView().getModel();
      var oCtx = oEvent.getSource().getBindingContext();
      var catid = oCtx.getProperty("Catid");
      var typeid = oCtx.getProperty("Typeid");
      var instid = oCtx.getProperty("Instid");
      var extDocTitle = sap.ui.getCore().byId("txtExtDocTitle").getValue();
      var extDocAdress = sap.ui.getCore().byId("txtExtDocAddress").getValue();
      // Input check
      if (extDocTitle === "" || extDocAdress === "") {
        sap.ui.getCore().byId("txtExtDocTitle").setValueState(sap.ui.core.ValueState.Error);
        sap.ui.getCore().byId("txtExtDocAddress").setValueState(sap.ui.core.ValueState.Error);
      } else {
        // Create note (Call entitySet)
        var oEntry = {};
        oEntry.Title = extDocTitle;
        oEntry.Url = extDocAdress;
        oEntry.CatId = catid;
        oEntry.TypeId = typeid;
        oEntry.InstId = instid;
        oEntry.Operation = "create";
        oModel.create('/ExtDocURLSet', oEntry, {
          success : function(oData, oResponse) {
            MessageToast.show("URL Created");
             oModel.refresh(true);
          },
          error : function(oError) {
            MessageToast.show("URL Creation failed");
            oModel.refresh(true);
          }
        });
        this.handleAttachmentCloseButton(oEvent);
        this._oBus.publish("ECV", "search", {
          catid : catid,
          typeid : typeid,
          instid : instid
        });
        sap.ui.getCore().byId("txtExtDocTitle").setValue('');
        sap.ui.getCore().byId("txtExtDocAddress").setValue('');
        sap.ui.getCore().byId("txtExtDocTitle").setValueState(sap.ui.core.ValueState.None);
        sap.ui.getCore().byId("txtExtDocAddress").setValueState(sap.ui.core.ValueState.None);
        oModel.refresh(true);
      }
    },
    // Needed to download SOFM attachments
    b64toBlob : function(b64Data, contentType, sliceSize) {
      contentType = contentType || '';
      sliceSize = sliceSize || 512;
      var byteCharacters = atob(b64Data);
      var byteArrays = [];
      for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        var slice = byteCharacters.slice(offset, offset + sliceSize);
        var byteNumbers = new Array(slice.length);
        for (var i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        var byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }
      var blob = new Blob(byteArrays, {
        type : contentType
      });
      return blob;
    },
    // -----------------END INSERT
    // RG21022017----------------------
    onNavToItem : function(oEvent) {
      var item = oEvent.getSource().getBindingContext();
      var uri = item.oModel.getProperty(item.sPath + "/NaviUrl");
      var filename = item.oModel.getProperty(item.sPath + "/NodeValue");
      var content = item.oModel.getProperty(item.sPath + "/Content");
      var contentString = item.oModel.getProperty(item.sPath + "/Contents"); // +RG22022017
      var group = item.getProperty("Group"); // +RG22022017
      var itemInstId = item.getProperty("ItemInstID"); // +RG22022017
      var typeId = item.getProperty("ItemTypeid");

      // Variables needed to download SOFM
      // attachments
      var mimeChar = uri.substr(0, uri.indexOf("mimetype:") + 9); // +RG22032017
      var contentType = uri.substring(uri.indexOf("mimetype:") + 9, uri.indexOf(";content:")); // +RG22032017
      var blobUri = uri.substr(uri.indexOf(";content:") + 9); // +RG22032017

      if (!uri) {
        MessageToast.show("No navigation info for this object", {}); // false

        return;
      }else{
      try{
        //get transaction for gui
        var guiTransaction = this.getParameterByName("~transaction", uri).split('DYNP_OKCODE=SELE')[0];

      } catch(e){}

      }

      // -------------BEGIN INSERT
      // RG22022017--------------
      // Check if item type is a note and
      // display in popover
      if (group === "NOTES") {
        if (!this.oDialogNote) {
          this.oDialogNote = sap.ui.xmlfragment("be.avelon.ecvsidepanel.fragment.NotePopover", this);
          this.getView().addDependent(this.oDialogNote);
        }
        jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this.oDialogNote);
        this.oDialogNote.open();
        sap.ui.getCore().byId("txtNoteTitleDisplay").setValue(filename);
        sap.ui.getCore().byId("txtNoteDisplay").setValue(contentString);
        sap.ui.getCore().byId("hiddenInstId").setValue(itemInstId);
      } else {
        // Show messagebox without edit
        // options for the personal note
        if (group === "PERSNOTE") {
          var persNoteBox = !!this.getView().$().closest(".sapUiSizeCompact").length;
          MessageBox.show(contentString, {
            icon : MessageBox.Icon.INFORMATION,
            title : filename,
            styleClass : persNoteBox ? "sapUiSizeCompact" : ""
          });
        } else {
          // -------------END INSERT
          // RG22022017--------------
          // dynamically create a
          // dummy link and simulate a
          // click on
          // it
          var link = document.createElement('a');
          if (typeof link.download === 'string') { // check
            // for
            // download tag
            // support

            // -------------BEGIN
            // INSERT
            // RG22032017--------------
            // Check if attachment
            // is SOFM
            if (mimeChar === "mimetype:") {

              var blob = this.b64toBlob(blobUri, contentType);
              var blobUrl = URL.createObjectURL(blob);
              // window.navigator.msSaveOrOpenBlob(blob);
              // window.location =
              // blobUrl;
              link.href = blobUrl;
              link.download = filename;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);

            } else {
              // -------------END
              // INSERT
              // RG22032017--------------
              // open in new
              // page/tab/window
              link.href = uri;
              link.target = "_blank";
              if (content) {
                // setting the
                // download
                // attribute
                // suggests
                // filename to
                // the browser
                // for download
                // (in case
                // of data url)
                link.download = filename;
              }
              if(group === "ARCHIVELNK")
              {
              // Firefox requires
              // the link to be in
              // the body
              document.body.appendChild(link);
              // simulate click
              link.click();
              // remove the link
              // when done
              document.body.removeChild(link);
              }else{
                  link.click();
              }
            }

          } else {
            // -------------BEGIN
            // INSERT
            // RG22032017--------------
            // Check if attachment
            // is SOFM

            if (mimeChar === "mimetype:") {

              var blob = this.b64toBlob(blobUri, contentType);
              var blobUrl = URL.createObjectURL(blob);
              window.navigator.msSaveOrOpenBlob(blob);
              window.location = blobUrl;
            } else {
              // -------------END
              // INSERT
              // RG22032017--------------
              // IE doesnt
              // support the
              // download tag yet
              if(group === "ARCHIVELNK" || group === "LINKS")
              {
              window.open(uri);
              }
              else {
              this.getView().getModel().read("/GeneralInfoSet",{
              success: function(oData){
              if(oData.results[0].GuiActive == "X" && uri !== "")
              {
              var cmdstr = '"%ProgramFiles(x86)%\\SAP\\FrontEnd\\SAPgui\\sapshcut.exe" -user="'+oData.results[0].Uname+'"'+
              ' -command="'+guiTransaction+'" -type="Transaction" -gui="/H/'+window.location.host.split(":")[0]+'"'+
              ' -language="'+oData.results[0].Langu+'"  -client="'+oData.results[0].Mandt+'" -sid="'+oData.results[0].SystId+'"';
               var shell = new ActiveXObject("wscript.shell");
               shell.Exec(cmdstr);
               }else
               {
               window.open(uri);
               }

                }
             });
             }
            }
          }
        }
      }

    },
    handleNoteCloseButton : function(oEvent) {
      this.oDialogNote.close();
      sap.ui.getCore().byId("txtNoteTitleDisplay").setEnabled(false);
      sap.ui.getCore().byId("txtNoteDisplay").setEnabled(false);
      sap.ui.getCore().byId("btnEditNote").setVisible(true);
      sap.ui.getCore().byId("btnSaveEditedNote").setVisible(false);
    },
    handleEditNoteButton : function(oEvent) {
      sap.ui.getCore().byId("txtNoteTitleDisplay").setEnabled(true);
      sap.ui.getCore().byId("txtNoteDisplay").setEnabled(true);
      sap.ui.getCore().byId("btnEditNote").setVisible(false);
      sap.ui.getCore().byId("btnSaveEditedNote").setVisible(true);
    },
    handleSaveEditedNoteButton : function(oEvent) {
      var that = this;
      var oModel = this.getView().getModel();
      var oCtx = oEvent.getSource().getBindingContext();
      var catid = oCtx.getProperty("Catid");
      var typeid = oCtx.getProperty("Typeid");
      // Get instid from hidden field
      var itemInstid = sap.ui.getCore().byId("hiddenInstId").getValue();
      // var instId =
      // oCtx.getProperty("Instid");
      var noteTitle = sap.ui.getCore().byId("txtNoteTitleDisplay").getValue();
      var noteText = sap.ui.getCore().byId("txtNoteDisplay").getValue();
      // Input check
      if (noteTitle === "" || noteText === "") {
        sap.ui.getCore().byId("txtNoteTitleDisplay").setValueState(sap.ui.core.ValueState.Error);
        sap.ui.getCore().byId("txtNoteDisplay").setValueState(sap.ui.core.ValueState.Error);
      } else {
        var confirmDialog = new Dialog({
          title : 'Confirm',
          type : 'Message',
          content : new Text({
            text : 'Are you sure you want to edit this note?'
          }),
          beginButton : new Button({
            text : 'Yes',
            press : function() {
              var oEntry = {};
              oEntry.NoteTitle = noteTitle;
              oEntry.NoteText = noteText;
              oEntry.CatId = catid;
              oEntry.TypeId = typeid;
              oEntry.InstId = itemInstid;
              oEntry.ItemInstId = itemInstid;
              oEntry.Operation = "edit";
              oModel.create('/NoteSet', oEntry, {
                success : function(oData, oResponse) {
                  MessageToast.show("Note Saved");
                  oModel.refresh(true);
                },
                error : function(oError) {
                  MessageToast.show("Note Not Saved");
                }
              });
              that.oDialogNote.close();
              confirmDialog.close();
            }
          }),
          endButton : new Button({
            text : 'No',
            press : function() {
              confirmDialog.close();
            }
          }),
          afterClose : function() {
            confirmDialog.destroy();
            sap.ui.getCore().byId("txtNoteTitleDisplay").setValueState(sap.ui.core.ValueState.None);
            sap.ui.getCore().byId("txtNoteDisplay").setValueState(sap.ui.core.ValueState.None);
          }
        });
        confirmDialog.open();
      }
    },

    getSharepointDocuments : function (bindedObj){



    $.getJSON("https://avelononline.sharepoint.com/sites/EasyContext/_api/Web" +
      "/GetFolderByServerRelativeUrl('/sites/EasyContext/Gedeelde%20documenten/General')?$expand=Files/ListItemAllFields", function (data) {
        var files = [];
        var file = {};
         for( var i = 0; i < data.Files.length ; i++)
          {
           debugger;
          if( bindedObj.typeid === data.Files[i].ListItemAllFields.Business_x0020_Object && bindedObj.instid.replace(/^0+/, '') === data.Files[i].ListItemAllFields.Reference_x0020_ID)
          {
          file.link = data.Files[i].LinkingUri;
          file.name = data.Files[i].Name;
          file.typeId = data.Files[i].ListItemAllFields.Business_x0020_Object;
          file.objectId = data.Files[i].ListItemAllFields.Reference_x0020_ID;

          files.push(file);
          console.log(file);
          }
         }
        this.getView().getModel("Sharepointmodel").setData(files);
      }.bind(this));

    },
    handleDeleteNoteButton : function(oEvent) {
      var that = this;
      var oModel = this.getView().getModel();
      var oCtx = oEvent.getSource().getBindingContext();
      var catid = oCtx.getProperty("Catid");
      var typeid = oCtx.getProperty("Typeid");
      var instid = oCtx.getProperty("Instid");
      // Get instid from hidden field
      var itemInstid = sap.ui.getCore().byId("hiddenInstId").getValue();
      var noteTitle = sap.ui.getCore().byId("txtNoteTitleDisplay").getValue();
      var noteText = sap.ui.getCore().byId("txtNoteDisplay").getValue();
      var confirmDialog = new Dialog({
        title : 'Confirm',
        type : 'Message',
        content : new Text({
          text : 'Are you sure you want to delete this note?'
        }),
        beginButton : new Button({
          text : 'Yes',
          press : function() {
            var oEntry = {};
            oEntry.NoteTitle = noteTitle;
            oEntry.NoteText = noteText;
            oEntry.CatId = catid;
            oEntry.TypeId = typeid;
            oEntry.InstId = itemInstid;
            oEntry.Operation = "delete";
            oModel.create('/NoteSet', oEntry, {
              success : function(oData, oResponse) {
                MessageToast.show("Note Deleted");
                that._oBus.publish("ECV", "search", {
                  catid : catid,
                  typeid : typeid,
                  instid : instid
                });
                oModel.refresh(true);
              },
              error : function(oError) {
                MessageToast.show("Note Not Deleted");
              }
            });
            that.oDialogNote.close();
            confirmDialog.close();
          }
        }),
        endButton : new Button({
          text : 'No',
          press : function() {
            confirmDialog.close();
          }
        }),
        afterClose : function() {
          confirmDialog.destroy();
        }
      });
      confirmDialog.open();
    },
    getParameterByName: function(name, url) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
},
  /*
   * onCreateItem : function(oEvent) { },
   */
  /*
   * this is appalling, the binding Items.length should just work out of the
   * box!
   */
  /*
   * updateBadge : function(url, count) { // loop on all badges var oBadges =
   * $(".badge"); var correctedUrl = "/" + url.substring(0,
   * url.indexOf("/Items")); for (var i = 0; i < oBadges.length; i++) { var
   * oDom = oBadges[i]; var oBadge = sap.ui.getCore().byId(oDom.id); if
   * (oBadge) { // go through all badges // get the binding url for this badge
   * var oCtx = oBadge.getNumber().getBindingContext(); if (oCtx.sPath ===
   * correctedUrl) { // match oBadge.setNumber(new Text({ text : count
   * })); } } } }
   */
  });
});