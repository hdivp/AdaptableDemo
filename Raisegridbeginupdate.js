var RaiseGridBeginUpdate = function RaiseGridBeginUpdate(tempAdaptableOptions) {
    debugger;
    GridInfoForDetails = null;
    GridIdForDetails = null;
    // ProcessUserNameMentionDDL();
    // console.log("inside RaiseGridBeginUpdate");

    tempAdaptableOptions.searchOptions["filterResultsAfterQuickSearch"] = true;

    // tempAdaptableOptions['filterOptions'] = {
        // defaultNumericColumnFilter: 'Values',
        // defaultDateColumnFilter: 'Values',
        // defaultStringColumnFilter: 'Values'
    // };
// if (ViewSettingColumnInfo != null && ViewSettingColumnInfo != undefined) {
//         tempAdaptableOptions.predefinedConfig.Layout.Layouts[0].Columns = ViewSettingColumnInfo;
//     }
    
    tempAdaptableOptions.predefinedConfig.Layout.Layouts[0].ColumnSorts = [{ ColumnId: 'break_type', SortOrder: 'Desc' }];
    tempAdaptableOptions.predefinedConfig.Dashboard.IsCollapsed = true;
    tempAdaptableOptions.predefinedConfig.Layout.includeExpandedRowGroups = true;

    // if (ReportConfigurationSuccessData != undefined && ReportConfigurationSuccessData != null) {
    //     var selectedBreakStatusData = []
    //     if (ReportConfigurationSuccessData.BreakStatus != null || ReportConfigurationSuccessData.BreakStatus != undefined) {
    //         $.each(breakStatusInfo, function (i, val) {
    //             if (ReportConfigurationSuccessData.BreakStatus.split('|').indexOf(breakStatusInfo[i].BreakResolutionId.toString()) >= 0) {
    //                 selectedBreakStatusData.push(breakStatusInfo[i].BreakResolutionCode);
    //             }
    //         });

    //         if (ReportConfigurationSuccessData.BreakStatus.split('|').indexOf('0') >= 0)
    //             selectedBreakStatusData.push("");
    //     }

    //     var rowFilters = [
    //         {
    //             ColumnId: 'Break Status',
    //             Predicate: {
    //                 PredicateId: 'Values',
    //                 Inputs: selectedBreakStatusData,
    //             },
    //         },
    //     ]
        tempAdaptableOptions.gridOptions.rowHeight = 22;



    //     if (DashboarName != null && DashboarName != undefined && DashboarName != '' &&
    //         SelectedCashAttrPortfolio != undefined && SelectedCashAttrPortfolio != null)
    //         rowFilters.push(FiltersFromDashboardDrillDown());

    //     if (tempAdaptableOptions.predefinedConfig.Layout.Layouts[0].ColumnFilters == null || tempAdaptableOptions.predefinedConfig.Layout.Layouts[0].ColumnFilters == undefined) {
    //         tempAdaptableOptions.predefinedConfig.Layout.Layouts[0].ColumnFilters = rowFilters;
    //     }
    //     else {
    //         tempAdaptableOptions.predefinedConfig.Layout.Layouts[0].ColumnFilters = tempAdaptableOptions.predefinedConfig.Layout.Layouts[0].ColumnFilters.concat(rowFilters);
    //     }
        
    // }


    tempAdaptableOptions.gridOptions.enableBrowserTooltips = true;

    tempAdaptableOptions.gridOptions.columnDefs.forEach(item => {
       try
       {
           item.maxWidth = 250;
           item.tooltipField = item.field;
           item.minWidth = 30;
           editable = true;
       }
       catch(e)
       {

       }
    });

    var ColumnList = adaptablegridbundle.getGridInfo("RecordSummaryGrid").ColumnInfo;

    if (ColumnList != null && ColumnList.length > 0) {
        const ColtoSort = [];

        ColumnList.forEach(ColumntoSet => {
            if (ColumntoSet.ColumnName.includes('-Difference')) {
                ColtoSort.push(ColumntoSet.ColumnName);
            }
        })

        var ColumnsToAbsoluteSort = [
            {
                scope:
                {
                    ColumnIds: ColtoSort
                },
                comparer: (valueA, valueB) => {
                    return Math.abs(valueB) - Math.abs(valueA);
                },
            }
        ]

        if (tempAdaptableOptions.generalOptions['customSortComparers'] == null) {
            tempAdaptableOptions.generalOptions['customSortComparers'] = ColumnsToAbsoluteSort;
        }
        else {
            tempAdaptableOptions.generalOptions['customSortComparers'].push(ColumnsToAbsoluteSort);
        }
    }


    tempAdaptableOptions.alertOptions = {
        rowHighlightDuration: 3000,
            cellHighlightDuration: 3000,
    }
    
    var Flashing = {
        
            AlertDefinitions: [
                {
                    MessageType: 'Success',
                    Scope: {
                        ColumnIds: ["is_historical","break_type", 'Break Status','User Name','Status','Attachment'],
                    },
                    Rule: {
                        Predicate: {
                            PredicateId: 'Any',
                        },
                    },

                    AlertProperties: {
                        HighlightCell:true,
                        HighlightRow: {
                            BackColor: '#cafcb5',
                            ForeColor: '#000000',
                        },
                        JumpToCell: false,
                        JumpToRow : false,
                    },
                },
            ],
    }

    tempAdaptableOptions.predefinedConfig.Alert = Flashing;


    tempAdaptableOptions.menuOptions.contextMenuOrder = [];
    tempAdaptableOptions.menuOptions.contextMenuItems =
        [
            {
                label: 'Match',
                onClick: (menuContext) => {
                    console.log(menuContext);
                }
            },
            {
                label: 'Update Remarks',
                onClick: (menuContext) => {
                    console.log(menuContext);
                },
                isHidden: (menuContext) => {
                    debugger;
                }

            },
            {
                label: 'Close',
                onClick: (menuContext) => {
                    console.log(menuContext);
                }
            },
            {
                label: 'WorkFlow Actions',
                subMenuItems: [
                    {
                        label: 'Assign Breaks',
                        onClick: (menuContext) => {
                            console.log(menuContext);
                        }

                    }
                ]
            },
            {
                label: 'Communicate',
                onClick: (menuContext) => {
                    console.log(menuContext);
                }
            },
            {
                label: 'Insert Mapping',
                onClick: (menuContext) => {
                    console.log(menuContext);
                }
            },
            {
                label: 'Attachment',
                subMenuItems: [
                    {
                        label: 'Attach Document',
                    },
                    {
                        label: 'View Document'
                    },
                    {
                        label: 'Delete Document'
                    }]
            },
            {
                label: 'Search',
                onClick: (menuContext) => {
                    console.log(menuContext);
                }
            },
            {
                label: 'Trace Record',
                onClick: (menuContext) => {
                    console.log(menuContext);
                }
            },
            {
                label: 'Audit Trail',
                onClick: (menuContext) => {
                    console.log(menuContext);
                }
            },
            {
                label: 'Post',
                subMenuItems: [
                    {
                        label: 'Generate Wire',
                        onClick: (menuContext) => {
                            debugger;
                            if (menuContext.selectedRowInfo.GridRows.length > 0) {
                                var postingArray = [];
                                menuContext.selectedRowInfo.GridRows.forEach(function (items) {
                                    var postingInfo = {};
                                    postingInfo.AssetId = items.rowData.AssetID;
                                    postingInfo.ReconName = items.rowData.NamedReconID;
                                    postingInfo.ReportKey = items.rowData.report_key;

                                    postingArray.push(postingInfo);
                                });

                                var param = {
                                    "records": JSON.stringify(postingArray)
                                }

                                var URL = URL + "Resources/Services/RWorkAreaServices.svc";
                                var obj = new WebHttpAPICall("GET", URL, "PostActionFromAdaptable", param, PostActionFromAdaptableSuccessHandler, PostActionFromAdaptableFailureHandler);
                                obj.CallServiceAPI();
                            }
                        },
                    }]

            }
        ];
    try {
        adaptablestate[GetSelectedGridId()] = adaptablegridbundle.getCurrentAdaptableState(GetSelectedGridId());
    }
    catch (e) {

    }


}
