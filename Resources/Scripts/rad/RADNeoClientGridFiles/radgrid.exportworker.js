onmessage = function (e) {
    if (!e.data.JsonData || e.data.JsonData.length == 0)
        return;

    var columns = [];
    var table = [];
	if(e.data.pivotview) {
		columns = Object.keys(e.data.JsonData[0]);
        var t1 = performance.now();
        if (e.data.ColumnsNotToExport == null)
            e.data.ColumnsNotToExport = [];
        if (e.data.ColumnsNotToExport && e.data.ColumnsNotToExport.length > 0) {
            columns = columns.filter(x => !e.data.ColumnsNotToExport.includes(x));
            table = e.data.JsonData.map(x => {
                var values = [];
                columns.forEach(col => values.push(x[col]));
                return values;
            });
        }
        else {
            columns = columns.filter(x => !e.data.ColumnsNotToExport.includes(x));
            table = e.data.JsonData.map(x => Object.values(x));
        }
        console.log("compression time : " + (performance.now() - t1));
        postMessage({ Table: table, Columns: columns });
	}
    else if (!e.data.IsGrouped) {
        columns = Object.keys(e.data.JsonData[0]);
        var t1 = performance.now();
        if (e.data.ColumnsNotToExport == null)
            e.data.ColumnsNotToExport = [];
        if (e.data.ColumnsNotToExport && e.data.ColumnsNotToExport.length > 0) {
            columns = columns.filter(x => !e.data.ColumnsNotToExport.includes(x));
            columns = e.data.ColumnOrder.filter(x => columns.includes(x));
            table = e.data.JsonData.map(x => {
                var values = [];
                columns.forEach(col => values.push(x[col]));
                return values;
            });
        }
        else {
            columns = columns.filter(x => !e.data.ColumnsNotToExport.includes(x));
            columns = e.data.ColumnOrder.filter(x => columns.includes(x));
            table = e.data.JsonData.map(x => {
                var values = [];
                columns.forEach(col => values.push(x[col]));
                return values;
            });
        }
        console.log("compression time : " + (performance.now() - t1));
        
        postMessage({ Table: table, Columns: columns });
    }
    else {
        if (e.data.IsInterOpInstalled) {
            columns = Object.keys(e.data.JsonData[0]);
            table = e.data.JsonData.map(x => Object.values(x));
            postMessage({ Table: table, Columns: columns });
        }
        else {
            columns = getColumns(e.data.JsonData);
            columns.push("isGroupHeader");
            // columns = e.data.ColumnOrder.filter(x => columns.includes(x));
            table = convertGroupedData(e.data.JsonData, columns, e.data.GroupedColumns);
            table = table.map(x => Object.values(x));
            // let tempList = e.data.ColumnOrder.filter(x => columns.includes(x));
            postMessage({ Table: table, Columns: columns });
        }
    }
}

function getColumns(JsonData) {
    if (JsonData[0].hasOwnProperty("RADGroupvalues")) {
        return getColumns(JsonData[0]["RADGroupvalues"]);
    }
    else {
        return Object.keys(JsonData[0]);
    }
}

function convertGroupedData(JsonData, columns, GroupedColumns, level = 1) {
    let table = [];
    if (JsonData[0].hasOwnProperty("RADGroupvalues")) {
        for (let i = 0; i < JsonData.length; i++) {
            var row = {};
            for (let key in JsonData[i]) {
                if (key != "RADGroupvalues") {
                    row[key] = JsonData[i][key];
                }
            }
            row["isGroupHeader"] = "True|" + level;
            //row[columns[0]] = JsonData[i][GroupedColumns[level-1]] + ' (' + JsonData[i]["recordCount"] + ')';
            //row[GroupedColumns[level-1]] = "";
            let columnList = columns.map(col => {
                if (row.hasOwnProperty(col))
                    return row[col];
                else
                    return null;
            });


            table.push(columnList);

            var obj = convertGroupedData(JsonData[i]["RADGroupvalues"], columns, GroupedColumns, level + 1);
            table = [...table, ...obj];
        }
    }
    else {
        // if (columns.length == 0) {
        //     columns = Object.keys(JsonData[0]);
        //     columns.push("isGroupHeader");
        // }
        table = [...table, ...JsonData.map(x => [...Object.values(x), "False"])];
    }
    return table;
}