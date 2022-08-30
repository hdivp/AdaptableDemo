
var BindGridCustomFormatting = function () {
    var columnsForCustomFormatting = ["RAD_Test_Column","break_type", "Suggestion", "UniqueID", "break_reason_id", "Linkage Details", "monthend_only", "Linked Details", "Email", "AF", "AP", "Status"];

    // if (SecMasterIntegrationDictionary != null && SecMasterIntegrationDictionary != undefined) {
    //     columnsForCustomFormatting = columnsForCustomFormatting.concat(Object.keys(SecMasterIntegrationDictionary));
    // }


    var objCustomFormatting = {};
    columnsForCustomFormatting.forEach(function (item) {
        objCustomFormatting[item] = ApplyGridCustomFormatting;
    });
    return objCustomFormatting;
 
};

 function ApplyGridCustomFormatting(val, RowData, ColumnName, isGroupHeader, dataType) {

    try {
        if (ColumnName == null || ColumnName == undefined) return;
        if (val == null || val == undefined) val = '';
        var TextColor = '';
        var CellHTML = '';
        if (ColumnName.indexOf("-Difference") > -1) {
            if (val != null && val.ToString().Length > 0 && Convert.ToDouble(val.ToString().ToLower()) != 0.0) {
                TextColor = "#9E0508";
            }

        }

        if (ColumnName == "Linked Details") {
            CellHTML = ApplyCustomFormattingForLinkage(val, RowData, ColumnName);
        } else if (ColumnName == "Suggestion_Fail_Trade") {
            CellHTML = ApplyCustomFormattingForServiceSuggestionFailed(val, RowData, ColumnName, isGroupHeader, dataType);
        } 
        else if (ColumnName == "Suggestion" || ColumnName == "Suggestion_Fail_Trade" || ColumnName == "Suggestion_Transfer") {
            CellHTML = ApplyCustomFormattingForServiceSuggestion(val, RowData, ColumnName, isGroupHeader, dataType);
        } else if (ColumnName == "RAD_Test_Column") {
            CellHTML = ApplyCustomFormattingRadTestColumn(val, RowData, ColumnName);
        } else if (ColumnName == "monthend_only") {
            CellHTML = ApplyCustomFormattingForMonthEndLite(val, RowData, ColumnName);
        } else if (ColumnName == "break_type") {
            CellHTML = ApplyCustomFormattingForBreakType(val, RowData, ColumnName);
        } else if (ColumnName == "Status") {
            CellHTML = ApplyCustomFormattingForBreakStatus(val, RowData, ColumnName);
        } 
        else if (ColumnName == "Delete Attachment") {
            CellHTML = ApplyCustomFormattingForDeleteAttachments(val, RowData, ColumnName);
        }
        else if (ColumnName == "Email") {
            CellHTML = ApplyCustomFormattingForEmail(val, RowData, ColumnName);
        } else if (ColumnName == "Download") {
            CellHTML = ApplyCustomFormattingForAttachmentDownload(val, RowData, ColumnName);
        }
        else if (ColumnName == "AF") {
            CellHTML = ApplyCustomFormattingForAF(val, RowData, ColumnName);
        } else if (ColumnName == "Details") {
            CellHTML = ApplyCustomFormattingForDetails(val, RowData, ColumnName);
        } else if (ColumnName == "AP") {
            CellHTML = ApplyCustomFormattingForAP(val, RowData, ColumnName);
        } else if (ColumnName == "A") {
            CellHTML = ApplyCustomFormattingForA(val, RowData, ColumnName);
        }
        // else if (SecMasterIntegrationDictionary.hasOwnProperty(ColumnName)) {
        //     CellHTML = ApplyCustomFormattingForSecMaster(val, RowData, ColumnName);
        // }
        else CellHTML = val;


        //var RowAttributeValue = GetRowAttributes(val, RowData, ColumnName);
        //return [CellHTML, { 'FilterContextMenu': RowAttributeValue }];
        return CellHTML;
    } catch (err) {
        console.log("error in custom formatting." + err);
    }
};

var ApplyCustomFormattingForSecMaster = function (val, RowData, ColumnName) {
    if (val != null && val != undefined) {
        var ColumnFormat = '';

        // if (SecMasterIntegrationDictionary.hasOwnProperty(ColumnName)) {
        //     var searchValue = SecMasterIntegrationDictionary[ColumnName];


        //     ColumnFormat = "<a class=\"clsSecurityIdentifier\" title=\" " + val + " \" style='height : 100% ;' onclick=\"OpenSecMasterURL('" + searchValue + "','" + val + "'  ); \" > " + val + "   </a>";

        //     return ColumnFormat;
        // }
        // else {
        //     return val;
        // }

    }
}

var ApplyCustomFormattingForDetails = function (val, RowData, ColumnName) {
    if (val != null && val != undefined && ColumnName==="Details" && RowData['ACTION_BY']!=='SYSTEM') {
        var ColumnFormat = '';
        ColumnFormat = "<div class='/*icon-double-angle-right icon-1x*/ auditTrailDataCls auditTrailArrowColumn' activity_id='" + RowData.activity_id + "' batch_id='" + RowData.batch_id + "' involved_recons='" + RowData.involved_recons + "' involved_assets='" + RowData.involved_assets + "' destination_assets='" + RowData.destination_asset + "' action_type='" + RowData.type + "' audit_trail_row_id='" + RowData.id + "' title='Click to show details'><i style='font-size: 17px;' class='icon-double-angle-right icon-1x'>";
        return ColumnFormat;
    } else {
        if (val.toString() == "-1" || val.toString() == "0") return "Blanks";
        return val.toString();
    }
}

var ApplyCustomFormattingForAF = function (val, RowData, ColumnName) {
    if (val != null && val != undefined) {
        var ColumnFormat = '';
        var UniqueID = RowData.UniqueID;
        if (parseInt(val) > 0)
            ColumnFormat = "<div class=\"AFInline AFInlineClick\"style='height : 100% ;' UniqueID= '" + UniqueID + "' \" > <div class=\"AFCount hasAFRecord AFInline\" title=\"Click To Open AF Records\"   >" + val + "</div>  </div>";
        return ColumnFormat;
    } else {
        if (val.toString() == "-1" || val.toString() == "0") return "Blanks";
        return val.toString();
    }
}

var ApplyCustomFormattingForAP = function (val, RowData, ColumnName) {
    if (val != null && val != undefined) {
        var ColumnFormat = '';
        var UniqueID = RowData.UniqueID;
        if (parseInt(val) > 0)
            ColumnFormat = "<div class=\"APInline APInlineClick\"style='height : 100% ;' UniqueID= '" + UniqueID + "' \" > <div class=\"APCount hasAPRecord APInline\" title=\"Click To Open AP Records\"   >" + val + "</div>  </div>";
        return ColumnFormat;
    } else {
        if (val.toString() == "-1" || val.toString() == "0") return "Blanks";
        return val.toString();
    }
}

var ApplyCustomFormattingForA = function (val, RowData, ColumnName) {
    if (val != null && val != undefined) {
        var ColumnFormat = '';
        var UniqueID = RowData.UniqueID;
        if (parseInt(val) > 0)
            ColumnFormat = "<div class=\"AInline AInlineClick\"style='height : 100% ;' UniqueID= '" + UniqueID + "' \" > <div class=\"ACount hasARecord AInline\" title=\"Click To Open A Records\"   >" + val + "</div>  </div>";
        return ColumnFormat;
    } else {
        if (val.toString() == "-1" || val.toString() == "0") return "Blanks";
        return val.toString();
    }
}

var ApplyCustomFormattingForMonthEndLite = function (val, RowData, ColumnName) {
    if (val != null && val != undefined && val.toString().length > 0) {
        var ColumnFormat = '';
        if (parseInt(val) > 0) {
            var namedReconId;
            var UniqueID;
            var assetId = -1;
            var assetFeedRowId = '';


            namedReconId = parseInt(RowData.NamedReconID);
            assetId = parseInt(RowData.AssetID);
            UniqueID = RowData.UniqueID;
            if (RowData.asset_feed_row_id_Fund != null && RowData.asset_feed_row_id_Fund != undefined)
                assetFeedRowId = RowData.asset_feed_row_id_Fund;
            if (assetFeedRowId == null || assetFeedRowId == undefined || assetFeedRowId == '') {

                if (RowData.asset_feed_row_id_PB == null || RowData.asset_feed_row_id_PB == undefined) assetFeedRowId = "";
                else {
                    if (RowData.asset_feed_row_id_PB[0] == ',')
                        assetFeedRowId = RowData.asset_feed_row_id_PB.substring(1, RowData.asset_feed_row_id_PB.length); //.TrimStart(new Char[] { ',', ' ' }).TrimEnd(new Char[] { ',', ' ' })) : "";
                    if (assetFeedRowId[assetFeedRowId.length - 1] == ',')
                        assetFeedRowId = assetFeedRowId.substring(0, assetFeedRowId.length - 1);
                }
            }
            ColumnFormat = "<div> <div class=\"reconSummaryInnerTab leftInnerTab leftInnerTabSelected\" title=\"Click To Open Daily Record\" style=\"background-color: #00bff0;\"  onclick = \"OpenDailyRecord(" + namedReconId + ",'" + assetFeedRowId + "','" + UniqueID + "','" + assetId + "') \">ME</div> <span> &nbsp; </span> </div>";
        }
        else
            ColumnFormat = "<div> <div title=\"Daily Month End Record\"></div> <span style='display : inline-block ;'> &nbsp; </span> </div>";


        return ColumnFormat;
    }
    else//will be call in case of filter from grid
    {
        if (val.toString() == "0") {
            return "Normal";
        }
        else {
            return "Status Changed";
        }
    }
}

var ApplyCustomFormattingForLinkage = function (val, RowData, ColumnName) {
    var ARID = RowData.arid;
    var NamedReconID = RowData.NamedReconID;
    var assetId = RowData.AssetID;
    var uniqueID = RowData.UniqueID;
    var suggestion = '';
    if (RowData.Suggestion_Fail_Trade != null) {
        suggestion = RowData.Suggestion_Fail_Trade
    }
    else if (RowData.Suggestion_Corporate_Action != null) {
        suggestion = RowData.Suggestion_Corporate_Action;
    }
    else if (RowData.Suggestion_Unapplied_Wire != null) {
        suggestion = RowData.Suggestion_Unapplied_Wire;
    }

    if (val != null) {
        var ColumnFormat = '';
        if (parseInt(val) > 0)
            ColumnFormat = "<div class=\"ClassLinkageInline\"style='height : 100% ;' onclick=\"OpenLinkagePopup('" + NamedReconID + "','" + assetId + "','" + ARID + "','" + uniqueID + "','" + suggestion + "'  ); \" > <div class=\"ClassLinkageCount hasLinkageRecord ClassLinkageInline ClassLinkageIcon\" title=\"Click To Open Linkage\"   > </div>  <div class=\"ClassLinkageInline ClassLinkageCount\"> " + val + " </div>  </div>";
        else if (parseInt(val) == -1) ColumnFormat = "<div> <div class=\"ClassLinkageCount hasLinkageRecord\" title=\"Click To Open Linkage\" onclick=\"OpenLinkagePopup('" + NamedReconID + "','" + assetId + "','" + ARID + "','" + uniqueID + "','" + suggestion + "' ); \"  ></div> <span> &nbsp; </span> </div>";
        else if (parseInt(val) == 0) ColumnFormat = "<div> <div class=\"ClassLinkageCount\" title=\"Click To Open Linkage\" onclick=\"OpenLinkagePopup('" + NamedReconID + "','" + assetId + "','" + ARID + "','" + uniqueID + "','" + suggestion + "' ); \"  ></div> <span> &nbsp; </span> </div>";
        return ColumnFormat;
    } else {
        if (val.toString() == "-1" || val.toString() == "0") return "Blanks";
        return val.toString();
    }
}

var ApplyCustomFormattingForServiceSuggestionFailed = function (val, RowData, ColumnName, isGroupHeader, dataType) {
    var ColumnFormat = "<span >" + val.toString() + "</span>";
    //debugger;

    if (val != null && val != undefined && val != '' && val.toString().indexOf("No Suggestion") == -1) {
        var ConfidencePercentage = (val == null || val == undefined) ? 0 : (val.split('|')[1]);
        ConfidencePercentage = parseFloat(ConfidencePercentage).toFixed(2);

        var actionName = val.toString().split('|')[0].split('-').filter(function (e) { if (e != '') return e; })[1].trim().toUpperCase();   // val.toString().split('|')[0].split(new char[] { '-' }, StringSplitOptions.RemoveEmptyEntries)[1].Trim().ToUpper();
        var arrSuggestionComment = val.toString().toLowerCase().split('comment-').filter(function (e) { if (e != '') return e; });
        var suggestionComment = 'Remark: ';


        var suggestionActionClass = 'cls_suggestion_actionname '
        if (actionName.indexOf('remark') || actionName.indexOf('comment')) suggestionActionClass += ' cls_suggestion_action_comment';

        if (actionName.indexOf('match') > -1 || actionName.indexOf('remark') || actionName.indexOf('comment'))
            suggestionComment = '';
        if (arrSuggestionComment != null && arrSuggestionComment != undefined && arrSuggestionComment.length > 1) suggestionComment += arrSuggestionComment[1];

        var trimmedSuggestionComment = suggestionComment;//.length > 10 ? suggestionComment.substr(0, 10) + '...' : suggestionComment;

        ColumnFormat = "<div id = \"" + val.toString() + "\" class=\"suggestion_container\"   ><div class =\"suggestion_sub_container\" ><div class = \"suggestion_match_percent\" style=\"width:  " + ConfidencePercentage + "%\" title='" + actionName + " Confidence : " + ConfidencePercentage + "% '> <div class=\"" + suggestionActionClass + "\"> <div class=\"cls_suggestion_action_name_text\">" + actionName + " </div> </div> </div></div><div class=\"cls_remark_suggestion\" title=\"" + suggestionComment + "\">" + trimmedSuggestionComment + " </div></div>";
    }
    console.log("GroupHeader" + isGroupHeader);
    console.log(ColumnFormat);
    return ColumnFormat;

}

var ApplyCustomFormattingForServiceSuggestion = function (val, RowData, ColumnName, isGroupHeader, dataType) {
    var ColumnFormat = "<span >" + val.toString() + "</span>";
    //debugger;

    if (val != null && val != undefined && val != '' && val.toString().indexOf("No Suggestion") == -1) {
        var ConfidencePercentage = (val == null || val == undefined) ? 0 : (val.split('|')[1]);
        ConfidencePercentage = parseFloat(ConfidencePercentage).toFixed(2);

        var actionName = val.toString().split('|')[0].split('-').filter(function (e) { if (e != '') return e; })[1].trim().toUpperCase();   // val.toString().split('|')[0].split(new char[] { '-' }, StringSplitOptions.RemoveEmptyEntries)[1].Trim().ToUpper();
        var arrSuggestionComment = val.toString().toLowerCase().split('comment-').filter(function (e) { if (e != '') return e; });
        var suggestionComment = 'Remark: ';


        var suggestionActionClass = 'cls_suggestion_actionname '
        if (actionName.indexOf('remark') || actionName.indexOf('comment')) suggestionActionClass += ' cls_suggestion_action_comment';

        if (actionName.indexOf('match') > -1 || actionName.indexOf('remark') || actionName.indexOf('comment'))
            suggestionComment = '';
        if (arrSuggestionComment != null && arrSuggestionComment != undefined && arrSuggestionComment.length > 1) suggestionComment += arrSuggestionComment[1];

        var trimmedSuggestionComment = suggestionComment;//.length > 10 ? suggestionComment.substr(0, 10) + '...' : suggestionComment;

        ColumnFormat = "<div id = \"" + val.toString() + "\" class=\"suggestion_container\"   ><div class =\"suggestion_sub_container\" ><div class = \"suggestion_match_percent\" style=\"width:  " + ConfidencePercentage + "%\" title='" + actionName + " Confidence : " + ConfidencePercentage + "% '> <div class=\"" + suggestionActionClass + "\"> <div class=\"cls_suggestion_action_name_text\">" + actionName + " </div> </div> </div></div><div class=\"cls_remark_suggestion\" title=\"" + suggestionComment + "\">" + trimmedSuggestionComment + " </div></div>";
    }
    console.log("GroupHeader" + isGroupHeader);
    console.log(ColumnFormat);
    return ColumnFormat;

}

var DownloadFileForAttachments = function () {
    ActionEnumContextMenu = 31;
    var strSelectedRows = '[';
    strSelectedRows += JSON.stringify(showRecordDetailsRowData);
    strSelectedRows += ']';

    var params = {
        "cacheKey": CacheKeyForCurrentGrid,
        "strSelectedRows": strSelectedRows
    };
    var URL = URL + "Resources/Services/RWorkAreaServices.svc";    // checkIfBlobAttached
    var obj = new WebHttpAPICall("GET", URL, "PerformValidationforDocument", params, DownloadAttachmentDocumentSuccessHandler, PerformValidationforDocumentFailureHandler);
    obj.CallServiceAPI();
}

DownloadAttachmentDocumentSuccessHandlerIcon = function (data) {
    var selectedGridId = GridIdForDetails == null ? GetSelectedGridId() : GridIdForDetails;
    if (data.d == true) {
        if (ActionEnumContextMenu == 31) {
            var strSelectedRows;
            strSelectedRows = JSON.stringify(DownloadAttachmentFromIconData);
            var selectedAssetId;
            var tempFilterContextMenuInfo = DownloadAttachmentFromIconData.filtercontextmenu;
            selectedAssetId = tempFilterContextMenuInfo.split('|')[5];
            var selectedReconIsMonthEnd = ((typeof (DailyOrMonthEndOnEdit) === "string" && DailyOrMonthEndOnEdit === '1') || (typeof (DailyOrMonthEndOnEdit) === "number" && DailyOrMonthEndOnEdit === 1)) ? true : false;

            var enURL = encodeURIComponent_Encrypted('Client=CashDashboard&cacheKey=' + CacheKeyForCurrentGrid + '&BlobType=View&IsMonthEnd=' + selectedReconIsMonthEnd + '&selectedAssetId=' + selectedAssetId + '&selectedReconID=' + selectedReconId + '&selectedGridId=' + selectedGridId + '&strSelectedRows=' + strSelectedRows);
            window.open('DownloadUsingStreamFile.aspx?' + enURL);
        }
        else
            PerformBMContextMenuAction();
    }
    else {
        $("#contextMenuActionFailureMessage").html("No Document Attached With Selected Record");
        $("#contextMenuActionFailureMessage").fadeIn('fast');
    }
}

var DownloadAttachmentDocumentSuccessHandler = function (data) {
    var selectedGridId = GetSelectedGridId();
    if (data.d == true) {
        if (ActionEnumContextMenu == 31) {
            var strSelectedRows;
            strSelectedRows = JSON.stringify(showRecordDetailsRowData);
            var selectedAssetId;
            var tempFilterContextMenuInfo = showRecordDetailsRowData.filtercontextmenu;
            selectedAssetId = tempFilterContextMenuInfo.split('|')[5];
            var selectedReconIsMonthEnd = ((typeof (DailyOrMonthEndOnEdit) === "string" && DailyOrMonthEndOnEdit === '1') || (typeof (DailyOrMonthEndOnEdit) === "number" && DailyOrMonthEndOnEdit === 1)) ? true : false;

            var enURL = encodeURIComponent_Encrypted('Client=CashDashboard&cacheKey=' + CacheKeyForCurrentGrid + '&BlobType=View&IsMonthEnd=' + selectedReconIsMonthEnd + '&selectedAssetId=' + selectedAssetId + '&selectedReconID=' + selectedReconId + '&selectedGridId=' + selectedGridId + '&strSelectedRows=' + strSelectedRows);
            window.open('DownloadUsingStreamFile.aspx?' + enURL);
        }
        else
            PerformBMContextMenuAction();
    }
    else {
        $("#contextMenuActionFailureMessage").html("No Document Attached With Selected Record");
        $("#contextMenuActionFailureMessage").fadeIn('fast');
    }
}


var ApplyCustomFormattingForAttachmentDownload = function (val, RowData, ColumnName) {
    if (val != null && val != undefined && val.length > 0) {
        return "<div id=\"DownloadIconForAttachments\" title=\"Click to delete this attachment\" class=\"fa fa-download fa-lg\"style=\"/*color: #a28867;*/ padding-left: 4px ;display: inline-block\" onclick=\"DownloadFileForAttachments();\"></div>";
    }
}

var ApplyCustomFormattingForEmail = function (val, RowData, ColumnName) {

    var transportName = '';
    var emailIdInSMTPTransportName = '';
    // TODO: config read from file
    //if (!string.IsNullOrWhiteSpace(WebConfigurationManager.AppSettings["SMTPTransportInUseToSendMail"])) {
    //    transportName = WebConfigurationManager.AppSettings["SMTPTransportInUseToSendMail"];
    //    //emailIdInSMTPTransportName = RCommonUtils.GetEmailIdFromSMTPTransport(WebConfigurationManager.AppSettings["SMTPTransportInUseToSendMail"]);
    //    emailIdInSMTPTransportName = RAppSettingsCache.GetAppSettingsFromCache("FromEmailIDForApp").ToString();
    //}
    if (val != null && val != undefined && val.length > 0) {

        var communication_ids = '';
        var UniqueID = '';
        var Email = '';
        var NamedReconID = '';


        communication_ids = RowData.communication_ids;
        UniqueID = RowData.UniqueID;
        Email = RowData.Email;
        NamedReconID = RowData.NamedReconID;



        var cssHasReadMail = "hasReadMail";
        var cssHasUnReadMail = "hasUnReadMail";
        var cssHasDraft = "hasDraft";


        if (val.toString().toLowerCase().indexOf("unread") > -1) {
            if (val.toString().indexOf("<div><INPUT ") == 0) {
                return val.ToString();
            }
            else {
                var UnreadCount = 1;
                if (val.toString().indexOf("-") > -1)
                    UnreadCount = parseInt(val.toString().split('-').filter(function (e) { if (e != '') return e; })[1]);
                return "<div><INPUT   value=\"\" class=\"" + cssHasUnReadMail + "\" title=\"Has unread email\" type=\"button\"  onclick=\"viewMail('" + communication_ids + "','" + UniqueID + "','" + Email + "','" + NamedReconID + "','" + transportName + "','" + emailIdInSMTPTransportName + "' );\"/><span >(" + UnreadCount + ") </span></div>";
            }
        }
        else if (val.toString().toLowerCase() == "draft") {
            return "<INPUT   value=\"\" class=\"" + cssHasDraft + "\" title=\"Has draft\" type=\"button\"  onclick=\"viewMail('" + communication_ids + "','" + UniqueID + "','" + Email + "','" + NamedReconID + "','" + transportName + "','" + emailIdInSMTPTransportName + "'  );\">";
        }
        else {
            return "<INPUT   value=\"\" class=\"" + cssHasReadMail + "\" title=\"Has read email\" type=\"button\"  onclick=\"viewMail('" + communication_ids + "','" + UniqueID + "','" + Email + "','" + NamedReconID + "','" + transportName + "','" + emailIdInSMTPTransportName + "' );\">";
        }


    }
}

function capitalize(input) {
    return input.toLowerCase().split(' ').map(s => s.charAt(0).toUpperCase() + s.substring(1)).join(' ');
}


var ApplyCustomFormattingForDeleteAttachments = function (val, RowData, ColumnName) {
    if (val != null && val != undefined && RowData !== undefined && RowData !== null) {
        return "<div id=\"DeleteAttachmentsButtonAdaptive\"style=\"padding-left: 4px\" title=\"Click to delete this attachment\" onclick=\"DeleteAttachmentsButtonAGgrid();\"></div>";
    }
}

var ApplyCustomFormattingForBreakStatus = function (val, RowData, ColumnName) {


    if (val != null && val != undefined && val.length > 0) {


        if (val.toString() == "Open") {
            return "<div style=\"border-left: 4px solid #6f99d2; /*color: #6f99d2;*/ padding-left:4px ;display: inline-block\">Open</div>";
        }
        else if (val.toString() == "Closed") {
            return "<div style=\"border-left: 4px solid #81bda9; /*color: #81bda9;*/padding-left: 4px ; display: inline-block\">Closed</div>";
        }
        else if (val.toString() == "Pending") {
            return "<div style=\"border-left: 4px solid #a28867; /*color: #a28867;*/ padding-left: 4px ;display: inline-block\">Pending</div>";
        }

        return "<div style=\"border-left: 4px solid #5e4d36; /*color: #5e4d36;*/ padding-left: 4px ;display: inline-block\">" + capitalize(val.toString()) + "</div>";
    }
}

var ApplyCustomFormattingRadTestColumn = function (val, RowData, ColumnName) {
    if (val != null && val != undefined && RowData !== undefined && RowData !== null && RowData.UniqueID!==null)
    {
        var t =  "<div id=\"RecordDetailsButtonWrapper\">";
        if (RowData.Attachment === 'N')
        {
            t += "<div id=\"RecordDetailsButtonAttachmentView\" title=\"Click to upload an attachment\" style=\"/*color: #a28867;*/ padding-left: 4px\" onclick=\"AttachAttachmentFromIcon(\'" + RowData.UniqueID + "\');\"></div> ";
        }
        else
        {
            t += "<div id=\"RecordDetailsButtonAttachmentUpload\" title=\"Click to Download the Attchment\" style=\"/*color: #a28867;*/ padding-left: 4px\" onclick=\"DownloadAttachmentFromIcon(\'" + RowData.UniqueID + "\');\"></div> ";
        }

        if (RowData.break_type.toLowerCase().includes('match'))
        {
            t += "<div id=\"RecordDetailsButtonMatchedRecord\" title=\"This record is Matched\" style=\"/*color: #a28867;*/ padding-left: 4px\"\"></div> ";
        }

        if (RowData.Status==='Pending') {
            t += "<div id=\"RecordDetailsButtonPendingRecord\" title=\"This record is in Pending State\" style=\"/*color: #a28867;*/ padding-left: 4px\" onclick=\"OpenDetailsPopupForRecord(\'" + RowData.UniqueID + "\');\"></div> ";
        }

        if ((RowData.AF !== null || RowData.AP !== null) && (RowData.AF > 0 || RowData.AP > 0)) {
            t += "<div id=\"RecordDetailsButtonIsAggregated\" title=\"Aggregated Records\" style=\"/*color: #a28867;*/ padding-left: 4px\" onclick=\"OpenAggregatedDetailsIcon(\'" + RowData.UniqueID + "\');\"></div> ";
        }
        //else
        //{
        //    t += "<div id=\"RecordDetailsButtonIsNotAggregated\" title=\"This record is not aggregated\" style=\"/*color: #a28867;*/ padding-left: 4px\" onclick=\"OpenDetailsPopupForRecord(\'" + RowData.UniqueID + "\');\"></div> ";
        //}

        if (true) {
            t += "<div id=\"RecordDetailsButtonIsFlagged\" title=\"Record is Flaged\" style=\"/*color: #a28867;*/ padding-left: 4px\" \"></div> ";
        }

        t += "<div id=\"RecordDetailsButtonCheckBox\" title=\"Click to open record details\" style=\"/*color: #a28867;*/ padding-left: 4px\" onclick=\"OpenDetailsPopupForRecord(\'" + RowData.UniqueID + "\');\"></div>";

        t += "</div>";

        return t;
    }
    return "<div>Total</div>";
}

var ApplyCustomFormattingForBreakType = function (val, RowData, ColumnName) {
    if (val != null && val != undefined && val.length > 0) {

        if (val.toString() == "Internal Exception") {
            return "<div style=\"border-left: 4px solid #a28867; /*color: #a28867;*/ padding-left: 4px ;display: inline-block\">Internal Exception</div>";
        }
        else if (val.toString() == "Paired") {
            return "<div style=\"border-left: 4px solid #6f99d2; /*color: #6f99d2;*/ padding-left: 4px ;display: inline-block\">Paired</div>";
        }
        else if (val.toString() == "External Exception") {
            return "<div style=\"border-left: 4px solid #e3be77; /*color: #a28867;*/ padding-left: 4px ;display: inline-block\">External Exception</div>";
        }
        else if (val.toString().toLowerCase().includes("match")) {
            return "<div style=\"border-left: 4px solid #81bda9; /*color: #81bda9;*/ padding-left: 4px ;display: inline-block\">" + capitalize(val.toString()) + "</div>";
        }

        return "<div style=\"border-left: 4px solid #5e4d36; /*color: #5e4d36;*/ padding-left: 4px ;display: inline-block\">" + capitalize(val.toString()) + "</div>";
    }
}
