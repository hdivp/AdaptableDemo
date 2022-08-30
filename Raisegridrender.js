var AdaptiveGridRaiseGridRender = function (event, gridID) {
    console.log(event);
    if (gridID == null || gridID == undefined)
        selectedGridId = GetSelectedGridId();
    else
        selectedGridId = gridID;

    // if (Report_Name!==undefined && Report_Name !== "BreakManagement") {
    //     $('#quickActionBottomMainDiv').css("display", "none");
    // }

    try {
        adaptablestate[GetSelectedGridId()] = adaptablegridbundle.getCurrentAdaptableState(GetSelectedGridId());
    }
    catch (e) {

    }


    if (event != null && event != undefined && event.type != null && event.type != undefined && event.type === "gridReady") {

        adaptablegridbundle.getAdaptableApi("RecordSummaryGrid").eventApi.on("SelectionChanged", function (x) {
            
            if (x.selectedRowInfo != null && x.selectedRowInfo != undefined && x.selectedRowInfo.gridRows != null && x.selectedRowInfo.gridRows != undefined) {
                if (x.selectedRowInfo.gridRows.length > 0)
                    SelectionChangedEventForGrid(x);

                // let pinnedBottomData = this.generatePinnedBottomData("RecordSummaryGrid");

                try {
                    adaptablegridbundle.getVendorGridApi("RecordSummaryGrid").pinnedRowModel.setPinnedBottomRowData([pinnedBottomData]);
                }
                catch (ex) {

                }


                //Handling of Suggestion Accept and Reject Buttons
                //Only Calculate if Suggestion Left Tree is visible
                if ($('#divSuggestionLeftTree').is(':visible'))  
                {
                    var countSuggestionHeadersChecked = 0;
                    adaptablegridbundle.getVendorGridApi(GetSelectedGridId()).gridOptionsWrapper.gridOptions.api.forEachNodeAfterFilterAndSort((rowNode, rowIndex) => {
                        
                        console.log(`Calculating Accept/Reject Count for Suggestion handling`);
                        if(rowNode.__hasChildren && rowNode.selected)
                        {
                           //this is the group header whose all children rows(grid rows under this group) is checked , so adding this count
                            countSuggestionHeadersChecked += 1;                            
                        }
                    });

                    if (countSuggestionHeadersChecked > 0)
                    {
                        //Changing Accept and Reject Value according to groups selected                        
                        $('#divSuggestionLeftTreeAccept').text(`Accept (${countSuggestionHeadersChecked})`);
                        $('#divSuggestionLeftTreeReject').text(`Reject (${countSuggestionHeadersChecked})`);
                    }
                    else {
                        $('#divSuggestionLeftTreeAccept').text('Accept');
                        $('#divSuggestionLeftTreeReject').text('Reject');
                    }
                }


                //Handling on UI for Selected Row Count
                $('#selectedRowCountNumber').text(x.selectedRowInfo.gridRows.length);
                $('#divNewQuickActionSelectedRecordsInfo').text(x.selectedRowInfo.gridRows.length + ' Record selected.');


                if (parseInt($('#selectedRowCountNumber').text()) > 0) {
                    $('.ag-floating-bottom').show()
                    $('#selectedRowCountNumber').css('color', 'red');
                    $('#selectedRowCount').css('color', 'red');
                    $('#selectedRowCountNumber').css('font-size', '13px');
                    $('#selectedRowCount').css('font-size', '13px');
                    $('#selectedRowCount').css('line-height', '2.4');
                }
                else {
                    $('.ag-floating-bottom').hide()
                    $('#selectedRowCountNumber').css('color', 'black');
                    $('#selectedRowCount').css('color', 'black');
                    $('#selectedRowCountNumber').css('font-size', '12px');
                    $('#selectedRowCount').css('font-size', '12px');
                    $('#selectedRowCount').css('line-height', '2.5');
                }
                if (parseInt(x.selectedRowInfo.gridRows.length) <= 0) {
                    $('#divNewQuickActionFirstActionOK').hide();
                    $('#divNewQuickActionSecondActionOK').hide();
                    $('#divNewQuickActionThirdActionOK').hide();
                }
            }

        }
        );

        // if (Report_Name != "Recon Diagnostic Report" && Report_Name != "Unprocessed Report") {    // we dont need context menu and its info in this report
        //     VisibleEveryContextMenuItems();


        // }

        // if (Report_Name != "Master Feed Report" && Report_Name != "Unprocessed Report" && Report_Name != "Asset Feed Report" && Report_Name != "Recon Diagnostic Report" && Report_Name != "Audit Report" && Report_Name != "Break Report - Historical" && Report_Name != "Recon Report - Historical") {
        //     if ($('#' + selectedGridId + '_contextMenu').length == 0)
        //         ContextMenu("RecordSummaryGrid");
        //     //attachEventHandlerForColumnWidth("RecordSummaryGrid");                    
        // }
        // else {
        //     for (var i = 0; i < TabFilterInfo.length; i++) {   // destroy context menu from the tabs (in which we don't required)
        //         selectedGridInfo = TabFilterInfo[i].GridInfo;
        //         if (selectedGridInfo != null && selectedGridInfo != undefined) {
        //             $.contextMenu('destroy', "#" + selectedGridInfo.GridId);
        //         }
        //     }
        // }


        // if (GetReportTypeId(Report_Name) != 13
        //     && ((IsFundLevelSignOff == false && isContinuousRecon == false && (SignOffInfo != undefined && SignOffInfo != null && SignOffInfo.SignOffState != 1 && SignOffInfo.SignOffState != 2))
        //         || (IsMonthEndFreeze == true && DailyOrMonthEndOnEdit == true
        //         )
        //     )
        // ) {
        //     $("#" + GetSelectedGridId() + " .ag-row").css('background-color', '#E4DCD5');

        // }
        // CallPostGridPlotRequests();
        //RenderDataForPendingAssets();

        // closeLoader_workarea_upper();
        // closeLoader_workarea();
    }
    else if (event != null && event != undefined && event == "columnRowGroupChanged") {
        try
        {
            adaptablegridbundle.getAdaptableApi(GetSelectedGridId()).gridApi.adaptable.expandAllRowGroups();
            adaptablegridbundle.getVendorGridApi(GetSelectedGridId()).columnModel.columnApi.setColumnPinned("ag-Grid-AutoColumn", "left");
        }
        catch(ex)
        {

        }
    }
    // else if (!IsAdaptiveGridFirstTimeLoad && event == "filterChanged" && IsCallGridRenderAfterFilter && ReconType == "Cash"
    //     && Report_Name != "Recon Diagnostic Report" && Report_Name != "Asset Feed Report"
    //     && Report_Name != "Recon Configuration Report" && Report_Name != "Master Feed Report"
    //     && Report_Name != "Unprocessed Report" && Report_Name != "Audit Report"
    //     && Report_Name != "Continuity Report" && Report_Name != "Unexplained Report"
    //     && Report_Type != 17 && Report_Type != 18 && Report_Type != 24) {
    //     var RowNode = [];
    //     adaptablegridbundle.getVendorGridApi(gridID).gridOptionsWrapper.gridOptions.api.forEachNodeAfterFilterAndSort((rowNode, rowIndex) => {
    //         RowNode.push(rowNode.data);
    //     });

    //     GetTradeMoneyDataAfterGridFiltering(selectedGridId, event, RowNode.filter(row => row != undefined));
    // }
    // else if (event == "filterChanged" && IsCallGridRenderAfterFilter) {
    else if (event == "filterChanged") {
        try {
            adaptablestate[GetSelectedGridId()] = adaptablegridbundle.getCurrentAdaptableState(GetSelectedGridId());
            //adaptablegridbundle.getAdaptableApi(GetSelectedGridId()).gridApi.adaptable.gridOptions.columnDefs.forEach(item => {
            //    try {
            //        if(item.field=='')
            //        {
            //            item
            //        }
            //    }
            //    catch (e) {

            //    }
            //});
        }
        catch (e) {

        }
    }


    $('.ab-Dashboard__tab').unbind("click").click(function () {
        console.log("height of grid tab : " + $(".ab-Dashboard__content").outerHeight());
        if ($(".ab-Dashboard__content").outerHeight() == null) {
            $(".rad-preview-gridparent").height($(".rad-preview-gridparent").outerHeight() - 71)
        }
        else {
            $(".rad-preview-gridparent").height($(".rad-preview-gridparent").outerHeight() + 71)
        }
    });

}

