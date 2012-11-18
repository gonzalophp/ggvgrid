var GGVGrid = {
    column:{required:0x01, editable:0x02, display:0x04, numeric:0x08},
    updateTips: function( o, t ) {
        var oTR = $('<tr></tr>').addClass('ui-state-error'),
            oTD = $('<td></td>').attr('colspan', 2).text( t );
        oTR.append(oTD);
        $(o).parents('tr').before(oTR);
        GGVGrid.highlight(oTD);
    },
    checkRegexp:function(o, regExpString ) {
        var regExpStringTrimmed = regExpString.substring(1, regExpString.length-1),
            oRegExp = new RegExp(regExpStringTrimmed,'');

        if ( !( oRegExp.test( o.value ) ) ) {
            $(o).addClass( "ui-state-error" );
            return false;
        } 
        else {
            return true;
        }
    },
    highlight:function(oNode){
        $(oNode).addClass( "ui-state-highlight");
        setTimeout(function() {
            $(oNode).removeClass( "ui-state-highlight", 1500 );
        }, 500 );   
    },
    button_add:function(e){
        var oDivGrid = $(GGVGrid.get_sender(e)).parents('div.ggvgrid'),
            oForm = $('<form></form>'),
            oTable = $('<table></table>'),
            data_source = $(oDivGrid).attr("data-source"),
            oTR,oTD,sColumn;
        
        $.each($('div.thead thead th',oDivGrid), function(index, oTH) { 
            var bRequired = ((GGVGrid.column.required&oTH.getAttribute("flags"))>0),
                bEditable = ((GGVGrid.column.editable&oTH.getAttribute("flags"))>0),
                bDisplay = ((GGVGrid.column.display&oTH.getAttribute("flags"))>0);
            
            sColumn=$("span.header",oTH).text();
            oTD = $('<td></td>');
            oTD.append('<label for="'+sColumn+'">'+sColumn+'</label>');
            oTR = $('<tr></tr>');
            oTR.append(oTD);
            oTD = $('<td></td>');
            oTD.append('<input type="text" name="'+sColumn+'" valid_format="'+oTH.getAttribute("valid_format")+'" tip_message="'+oTH.getAttribute("tip_message")+'"/>');
            oTR.append(oTD);
            oTable.append(oTR);
        });

        oForm.append(oTable);
        oDivGrid.append(oForm);

        oForm.dialog({
            autoOpen: true,
            modal: true,
            buttons: {
                "Add": function() {
                    var bFormValid = true,
                        aInput = $('tr input', this );

                    $('tr.ui-state-error',this).remove();
                    $('.ui-state-error',this).removeClass('ui-state-error');

                    $.each(aInput, function(index, oInput) { 
                        if (!GGVGrid.checkRegexp(oInput, oInput.getAttribute('valid_format'))) {
                            GGVGrid.updateTips( oInput, oInput.getAttribute('tip_message'));
                            bFormValid = false;
                        }
                    });

                    if ( bFormValid ) {
                        var parameters = { query: "save", data:{} };
                        $.each(aInput, function(index, oInput) { 
                            parameters.data[oInput.name] = oInput.value;
                        });
                        $.post(data_source, parameters, function(result) {
                            var oTHead = $("div.griddata div.thead table thead",oDivGrid);
                            var oTBody = $("div.griddata div.tbody table tbody",oDivGrid);
                            $.each(  $("add tr", $.parseXML( result )), function(index, oTRXML) { 
                                GGVGrid.highlight(GGVGrid.add_row(oTBody,oTHead,$(oTRXML)));
                            });
                        });
                        $( this ).dialog( "close" );
                    }
                },
                Cancel: function() {
                    $( this ).dialog( "close" );
                }
            }
        });
    },
    button_edit:function(e){
        var oDivGrid = $(GGVGrid.get_sender(e)).parents('div.ggvgrid'),
            oForm = $('<form></form>'),
            oTable = $('<table></table>'),
            data_source = $(oDivGrid).attr("data-source"),
            oTR,oTD,
            oTRSelected = $("tr.selected",oDivGrid);
            
        $.each($('div.thead thead th',oDivGrid), function(index, oTH) { 
            var sColumn=$("span.header",oTH).text();
            oTD = $('<td></td>');
            oTD.append('<label for="'+sColumn+'">'+sColumn+'</label>');
            oTR = $('<tr></tr>');
            oTR.append(oTD);
            oTD = $('<td></td>');
            oTD.append('<input type="text" name="'+sColumn+'" valid_format="'+oTH.getAttribute("valid_format")+'" tip_message="'+oTH.getAttribute("tip_message")+'" value="'+$("td",oTRSelected).eq(index).text()+'"/>');
            oTR.append(oTD);
            oTable.append(oTR);
        });
        
        oForm.append(oTable);
        oForm.append('<input type="hidden" name="data_id" value="'+$(oTRSelected).prop('id')+'"/>');
        oDivGrid.append(oForm);

        oForm.dialog({
            autoOpen: true,
            modal: true,
            buttons: {
                "update": function() {
                    var bFormValid = true,
                        aInput = $('tr input', this );

                    $('tr.ui-state-error',this).remove();
                    $('.ui-state-error',this).removeClass('ui-state-error');

                    $.each(aInput, function(index, oInput) { 
                        if (!GGVGrid.checkRegexp(oInput, oInput.getAttribute('valid_format'))) {
                            GGVGrid.updateTips( oInput, oInput.getAttribute('tip_message'));
                            bFormValid = false;
                        }
                    });

                    if ( bFormValid ) {
                        var parameters = { query: "update", data:{} };
                        $.each(aInput, function(index, oInput) { 
                            parameters.data[oInput.name] = oInput.value;
                        });
                         parameters.data_id = $('input[name="data_id"]', this ).prop('value');
                        $.post(data_source, parameters, function(result) {
                            
                            var oTHead = $("div.griddata div.thead table thead",oDivGrid);
                            var oTBody = $("div.griddata div.tbody table tbody",oDivGrid);
                            $.each(  $("update tr", $.parseXML( result )), function(index, oTRXML) { 
                                
                                GGVGrid.highlight(GGVGrid.update_row(oTBody,oTHead,$(oTRXML)));
                            });
                        });
                        $( this ).dialog( "close" );
                    }
                },
                Cancel: function() {
                    $( this ).dialog( "close" );
                }
            }
        });
    },
    button_delete:function(e){
        var oDivGrid = $(GGVGrid.get_sender(e)).parents('div.ggvgrid'),
            oDivGridData = $('div.griddata', oDivGrid),
            data_source = $(oDivGrid).attr("data-source");
        
        var parameters = { query: "delete", data:[] };
        $.each($('tr.selected',oDivGridData), function(index, oTR) { 
            parameters.data.push(oTR.id);
        });
        
        $.post(data_source, parameters, function(result) {
            $.each($($("removed", $.parseXML( result ))).attr('items').split(','), function(index, idRemoved) { 
                $('tr#'+idRemoved,oDivGridData).remove();
            });
        });
    },
    table_row_click:function(){
        (!$(this).hasClass('selected')) ? $(this).addClass('selected'):$(this).removeClass('selected');
    },
    get_sender:function(e){
        return ((e && e.target) || (window.event && window.event.srcElement));
    },
    get_numeric_position:function(sPosition){
        var nPosition;
        if ((nPosition=sPosition.indexOf(".")) >= 0 ){
            return parseInt(sPosition.substr(0, nPosition));
        }
        else {
            if ((nPosition=sPosition.indexOf("px")) >= 0){
                return parseInt(sPosition.substr(0, nPosition));
            }
            else {
                return parseInt(sPosition);
            }
        }
    },
    column_resize_mousedown:function(e){
        e.stopPropagation();
        var oSpan = GGVGrid.get_sender(e),
            oTH=$(oSpan).parents('th').get(0),
            oTHeadTable = $(oTH).parents("table"),
            aTH=$("th", oTHeadTable),
            oDivGrid = $(oTH).parents('div.ggvgrid'),
            sTHWidth = $(oTH).css('width'),
            oTBodyDiv = $("div.tbody",oDivGrid).get(0),
            oTBodyTable = $("div.tbody table",oDivGrid),
            oTBodyTH;
        
        
        for(var iColumnClicked=0;((iColumnClicked<(aTH.length))&&(oTH != aTH[iColumnClicked]));iColumnClicked++);
        oTBodyTH=$("th", oTBodyTable).get(iColumnClicked);
        
        $(document).disableSelection();
        $(oSpan).css('height',$(oTBodyDiv).css("height"));
         
        $(oDivGrid)
            .data('column_resize_start_x', e.pageX)
            .data('column_resize_start_th_width', GGVGrid.get_numeric_position(sTHWidth))
            .data('column_resize_span', oSpan)
            .data('column_resize_thead_table', oTHeadTable)
            .data('column_resize_tbody_table', oTBodyTable)
            .data('column_resize_thead_th', oTH)
            .data('column_resize_tbody_th', oTBodyTH)
            .on("mousemove", GGVGrid.column_resize_mousemove)
            .on("mouseup", GGVGrid.column_resize_mouseup);
        if ($.browser.mozilla){
            var oBody = $('body');
            $(oDivGrid).data('mozilla_css',["user-select",         $(oBody).css("user-select"),
                                            "-khtml-user-select",  $(oBody).css("-khtml-user-select"),
                                            "-moz-user-select",    $(oBody).css("-moz-user-select")]);
            $(oBody)
                .css("user-select","none")
                .css("-khtml-user-select","none")
                .css("-moz-user-select","none");
        }
    },
    column_resize_mouseup:function(e){
        var oDivGridTableTHead = $("div.thead", this).get(0), 
            oDivGridTableTBody = $("div.tbody", this).get(0);
        GGVGrid.init_adjust_column_sizes(oDivGridTableTHead, oDivGridTableTBody);
        $(this).off("mousemove").off("mouseup");
        var oTH = $(this).data('column_resize_thead_th'),
            oSpan = $(this).data('column_resize_span');
        $(oSpan)
            .css('height', $(oTH).css('height'))
            .css('background','none')
            .hover( function(){$(this).css('background-color','#444444');},
                    function(){
                        $(this).css('background-color','transparent');
                    });
        
        $(document).enableSelection();
        if ($.browser.mozilla){
            var oBody = $('body');
            var aMozillaCss = $(this).data('mozilla_css');
            for(var i=0;i<aMozillaCss.length;i+=2){
                $(oBody).css(aMozillaCss[i],aMozillaCss[i+1]);
            }
        }
    },
    column_resize_mousemove:function(e) {
        e.stopPropagation();
        var nWidth = $(this).data('column_resize_start_th_width')+(e.pageX-$(this).data('column_resize_start_x'));
        $($(this).data('column_resize_thead_th')).css('width',nWidth+'px');
        $($(this).data('column_resize_tbody_th')).css('width',nWidth+'px');
        
        
        var aTHeadTH = $("thead th",$(this).data('column_resize_thead_table')),
            aTBodyTH = $("thead th",$(this).data('column_resize_tbody_table')),
            sHead='', sBody='';
        $.each(aTHeadTH,function(index,oTH) {
            $(aTBodyTH[index]).css("width", $(oTH).css("width"));
            
            sHead += " "+$(oTH).css("width");
            sBody += " "+$(aTBodyTH[index]).css("width");
        });
        
        $("span.statushead").text(sHead+" --------- "+nWidth);
        $("span.statusbody").text(sBody);
        
        $($(this).data('column_resize_span')).css('height', $(($(this).data('column_resize_tbody_table')).parents("div.tbody").get(0)).css("height"));
    },
    sort:function(a,b){
        if (isNaN(a)||isNaN(b)) return ((b<a)-(a<b)); else return a-b;
    },
    reverse_sort:function(a,b){
        return GGVGrid.sort(b, a);
    },
    table_header_click:function(e){
        var oSender = GGVGrid.get_sender(e);
        if ($(oSender).prop('className') == 'resize') return false;
        var oTH = (($(oSender).prop('tagName'))=="TH") ? oSender:$(oSender).parents("th").get(0),
            oTHeadTable = $(oTH).parents("table"),
            sOrder = ($(oTH).hasClass('order_asc')) ? 'asc':'desc',
            aTHeadTH = $("thead tr th",oTHeadTable),
            oDivGrid = $(oTHeadTable).parents("div.ggvgrid").get(0),
            oTBodyTBody = $("div.griddata div.tbody table tbody", oDivGrid),
            aTBodyTR = $("tr", oTBodyTBody),
            aColumn=[],
            aSortedColumnValues = [],
            i,oTR,
            aSortedColumns = [],
            bNumeric = ((GGVGrid.column.numeric&$(oTH).get(0).getAttribute("flags"))>0);

        for(var iColumnClicked=0;((iColumnClicked<(aTHeadTH.length))&&(oTH!=aTHeadTH[iColumnClicked]));iColumnClicked++);
        $.each(aTBodyTR, function(index,oTR) {
            aColumn[index]=new Array(oTR, $("td",oTR).eq(iColumnClicked).text(), null);
            aSortedColumnValues[index] = aColumn[index][1];
        });
        
        $("span.ui-icon",$(aTHeadTH)).remove();
        $(aTHeadTH).removeClass('order_asc').removeClass('order_desc');
        
        var oSpan = $("<span class='ui-icon'></span>");
        $("div.th",oTH).append(oSpan);
        
        if (sOrder=='asc'){ // switch to desc
            $(oTH).addClass('order_desc');
            aSortedColumnValues.sort(GGVGrid.reverse_sort);
            $(oSpan).addClass("ui-icon-triangle-1-s");
        }
        else { // switch to asc
            $(oTH).addClass('order_asc');
            aSortedColumnValues.sort(GGVGrid.sort);
            $(oSpan).addClass("ui-icon-triangle-1-n");
        }
        
        for(i=0; i < aSortedColumnValues.length; i++){
            for(var i2=0; i2 < aColumn.length; i2++){
                if ((aColumn[i2][2]===null) && (aColumn[i2][1]==aSortedColumnValues[i])){
                    aColumn[i2][2]='found';
                    aSortedColumns[i]=i2;
                    continue;
                }
            }
        }
        
        for (i=0; i < aSortedColumns.length; i++){
            oTR = $(aColumn[aSortedColumns[i]][0]).clone(true);
            $(oTBodyTBody).append(oTR);
            $(aColumn[aSortedColumns[i]][0]).remove();
        }
    },
    populate_thead:function(oXMLTHead){
        var oTR=$("<tr></tr>");
        $.each($('tr th',oXMLTHead), function(index, oXMLTH) {
            var bRequired = ((GGVGrid.column.required&oXMLTH.getAttribute("flags"))>0),
                bEditable = ((GGVGrid.column.editable&oXMLTH.getAttribute("flags"))>0),
                bDisplay = ((GGVGrid.column.display&oXMLTH.getAttribute("flags"))>0),
                oTH = $('<th></th>')
                                    .attr('valid_format', $(oXMLTH).attr('valid_format'))
                                    .attr('tip_message', $(oXMLTH).attr('tip_message'))
                                    .attr('flags', $(oXMLTH).attr('flags'))
                                    .click(GGVGrid.table_header_click),
                oSpan = $('<span class="header"></span>').text($(oXMLTH).text()),
                oDiv = $('<div class="th"></div>');
                $(oDiv).append(oSpan);
            oSpan = $('<span class="resize">&nbsp;</span>').mousedown(GGVGrid.column_resize_mousedown);
            $(oDiv).append(oSpan);
            if (!bDisplay) oTH.css('display','none');
            $(oTH).append(oDiv);
            $(oTR).append(oTH);
        });
        
        var oTableTHead = $("<table></table>").append($("<thead></thead>").append(oTR));
        return oTableTHead;
    },
    _add_update_row:function(oTHead,oXMLTR){
        var aTH=$("tr th", oTHead),
            oTR=$("<tr></tr>");
        $(oTR).attr('id', $(oXMLTR).attr('id'));

        $.each($('td',oXMLTR), function(index, oXMLTD) {
            var bRequired = ((GGVGrid.column.required&aTH[index].getAttribute("flags"))>0),
                bEditable = ((GGVGrid.column.editable&aTH[index].getAttribute("flags"))>0),
                bDisplay = ((GGVGrid.column.display&aTH[index].getAttribute("flags"))>0);
            var oTD = $('<td></td>').text($(oXMLTD).text());
            if (!bDisplay) oTD.css('display','none');
            $(oTR).append(oTD);
        });
        $(oTR).click( GGVGrid.table_row_click );
        
        return oTR;
    },
    add_row:function(oTBody, oTHead, oXMLTR){
        var oTR = GGVGrid._add_update_row(oTHead, oXMLTR);
        $(oTBody).append(oTR);
        return oTR;
    },
    update_row:function(oTBody,oTHead,oXMLTR){
        var oTR = GGVGrid._add_update_row(oTHead,oXMLTR),
            oOldTR = $("tr#"+$(oXMLTR).attr('id'),oTBody);
        $(oOldTR).after(oTR);
        $(oOldTR).remove();
        return oTR;
    },
    populate_tbody:function(oTableTHead, oXMLTBody){
        var oTBody = $("<tbody></tbody>");
        var oTHead = $("thead",oTableTHead);
        $.each($('tr',oXMLTBody), function(index, oXMLTR) { 
            GGVGrid.add_row(oTBody, oTHead, oXMLTR);
        });
        
        var oTableTBody = $("<table></table>").append(($(oTHead).clone(false))).append(oTBody);
        return oTableTBody;
    },
    init_adjust_column_sizes:function(oDivGridTableTHead,oDivGridTableTBody){
        
        var aTHeadTH = $("table thead tr th",oDivGridTableTHead),
            aTBodyTH = $("table thead tr th",oDivGridTableTBody),
            nTHeadTHWidth,
            nTBodyTHWidth;
               
        $.each(aTBodyTH, function(index,oTBodyTH){
            nTHeadTHWidth = GGVGrid.get_numeric_position($(aTHeadTH[index]).css("width")),
            nTBodyTHWidth = GGVGrid.get_numeric_position($(oTBodyTH).css("width"));
            
            if (nTHeadTHWidth > nTBodyTHWidth) {
                $(oTBodyTH).css("width", nTHeadTHWidth+'px');
            }
            else {
                $(aTHeadTH[index]).css("width", nTBodyTHWidth+'px');
            }
        });
    },
    paginator_action:function(e){
        var oSender = GGVGrid.get_sender(e),
            sId = $(oSender).prop("id"),
            oDivPaginator = $(oSender).parents("div.paginator").get(0),
            iViewPage,iViewRows;
            
        if(sId=="rows_per_page"){
            iViewRows = $("option:selected",oSender).get(0).value;
            iViewPage = parseInt($("input#page",oDivPaginator).val());
        }
        else {
            iViewRows = $("option:selected",oDivPaginator).get(0).value;
            if(sId=="page"){
                iViewPage=parseInt(oSender.value);
            }
            else {
                if(sId=="start"){
                    iViewPage=1;
                }
                else if(sId=="end"){
                    iViewPage='end';
                }
                else {
                    iViewPage=parseInt($("input#page",oDivPaginator).val());
                    if(sId=="prev"){
                        (iViewPage>1)? iViewPage--:null;
                    }
                    else if(sId=="next"){
                        iViewPage++;
                    }
                }
            }
        }

        var oDivGrid = $(oDivPaginator).parents("div.ggvgrid").get(0),
            aDataRequest = {page:iViewPage
                           ,rows:iViewRows};
        
        $($("div.thead table", oDivGrid)).remove();
        $($("div.tbody table", oDivGrid)).remove();
        
        GGVGrid.reset_data(oDivGrid,aDataRequest);
    },
    page_input_keypress:function(e){
        if (e.which==13){
            GGVGrid.paginator_action();
        }
    },
    get_paginator:function(){
        var oTD, oSpan, oInput, oSelect,
            oTR = $("<tr></tr>");
        
        oSpan = $("<span id='start'>&nbsp;</span>").addClass("ui-icon ui-icon-seek-start").click(GGVGrid.paginator_start);
        oTD = $("<td></td>").append(oSpan);
        $(oTR).append(oTD);
        oSpan = $("<span id='prev'>&nbsp;</span>").addClass("ui-icon ui-icon-seek-prev").click(GGVGrid.paginator_start);
        oTD = $("<td></td>").append(oSpan);
        $(oTR).append(oTD);
        
        oInput = $('<input type="text" id="page" name="page" value="1"/>').keypress(GGVGrid.page_input_keypress);
        oTD = $("<td></td>").append(oInput);
        $(oTR).append(oTD);
        
        oSpan = $("<span id='next'>&nbsp;</span>").addClass("ui-icon ui-icon-seek-next").click(GGVGrid.paginator_start);
        oTD = $("<td></td>").append(oSpan);
        $(oTR).append(oTD);
        oSpan = $("<span id='end'>&nbsp;</span>").addClass("ui-icon ui-icon-seek-end").click(GGVGrid.paginator_start);
        oTD = $("<td></td>").append(oSpan);
        $(oTR).append(oTD);
        
        oSelect = $('<select id="rows_per_page" class="paginator"></select>').change(GGVGrid.paginator_action);
        $(oSelect).append('<option value="10">10</option>');
        $(oSelect).append('<option value="20">20</option>');
        $(oSelect).append('<option value="50">50</option>');
        oTD = $("<td></td>").append(oSelect);
        $(oTR).append(oTD);
        $("span",oTR).click(GGVGrid.paginator_action);
        
        return $('<div class="paginator"></div>').append($("<table></table>").append(oTR));
    },
    reset_data:function(oDivGrid,aDataRequest){
        var aParameters = { query: "init", 
                            page:aDataRequest.page,
                            rows:aDataRequest.rows};
        $.post(oDivGrid.getAttribute("data-source"), aParameters, function(xmldata){
            var oXMLDocument = $.parseXML(xmldata),
                oDivGridData = $("div.griddata",oDivGrid),
                oDivTitle = $('div.title',oDivGridData),
                oDivGridTableTHead = $("div.thead", oDivGridData),
                oDivGridTableTBody = $("div.tbody", oDivGridData),
                oTableTHead = GGVGrid.populate_thead($("thead",oXMLDocument)),
                oTableTBody = GGVGrid.populate_tbody(oTableTHead, $("tbody",oXMLDocument)),
                oParameters = $("parameters",oXMLDocument).get(0);
            $(oDivTitle).text($("title",oXMLDocument).text());
            $(oDivGridTableTHead).append(oTableTHead);
            $(oDivGridTableTBody).append(oTableTBody);
            
            var oDivPaginator = $("div.paginator", oDivGrid),
                oInputPage = $("input", oDivPaginator).get(0),
                oSelectRows = $("select", oDivPaginator).get(0);
            
            oInputPage.value = oParameters.getAttribute("page");
            oSelectRows.selectedIndex = $('option[value="'+oParameters.getAttribute("rows")+'"]',oSelectRows).get(0).index
            GGVGrid.init_adjust_column_sizes(oDivGridTableTHead,oDivGridTableTBody);
        });
    },
    init:function(){
        $.each($('div.ggvgrid'), function(index, oDivGrid) {
            var oButtonAdd = $('<button id="add"></button>').text('Add').button().click(GGVGrid.button_add),
                oButtonEdit = $('<button id="edit"></button>').text('Edit').button().click(GGVGrid.button_edit),
                oButtonDelete = $('<button id="delete"></button>').text('Delete').button().click(GGVGrid.button_delete),
                oDivGridData = $('<div class="griddata"></div>'),
                oDivTitle = $('<div class="title"></div>').addClass('title ui-widget-header'),
                oDivGridTableTHead = $('<div class="thead"></div>'),
                oDivGridTableTBody = $('<div class="tbody"></div>'),
                oDivButtonsDataManipulation = $('<div class="data_manipulation"></div>')
                    .append(oButtonAdd)
                    .append(oButtonEdit)
                    .append(oButtonDelete),
                oDivPaginator = GGVGrid.get_paginator(),
                oGridButtons = $('<div class="gridbuttons"></div>')
                    .append(oDivButtonsDataManipulation)
                    .append('<span class="space">&nbsp;</span>')
                    .append(oDivPaginator),
                oDivContainer = $(oDivGrid).parents("div").get(0),
                oTable = $("<table></table>").addClass('data');
            $(oDivGrid).append(oDivGridData).append(oGridButtons);
            
            var aDataRequest = {page:$("input#page",oDivPaginator).get(0).value
                               ,rows:$("option:selected",oDivPaginator).get(0).value};
            
            GGVGrid.reset_data(oDivGrid, aDataRequest);
            $(oDivGridData).append(oDivTitle).append(oDivGridTableTHead).append(oDivGridTableTBody);
            
            $(oDivGridTableTBody).css('max-height', (GGVGrid.get_numeric_position($(oDivContainer).css('height'))-80)+'px')
            $(oDivContainer).append(oDivGrid);
            $(oDivGrid).append(oGridButtons).resizable({containment: "#containerdiv",
                                                        alsoResize: oTable,
                                                        maxHeight: GGVGrid.get_numeric_position($(oDivContainer).css('height')),
                                                        maxWidth: GGVGrid.get_numeric_position($(oDivContainer).css('width')),
                                                        stop:function(){GGVGrid.init_adjust_column_sizes(oDivGridTableTHead,oDivGridTableTBody);}});
        });
    }
};

$(document).ready(GGVGrid.init);