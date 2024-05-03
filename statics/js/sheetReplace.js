// var all_tableData = []
// var paragraph_tableData = []
// var sheet_tableData = []
//接收python传来的数据
function showPythonValue(msg) {
    // alert("接收到了python中的值")
    // $("#replaceState_InfoBox").text(msg.message)
    // alert("姓名："+ msg.name +",性别："+ msg.gender +",年龄："+ msg.age);
    // document.getElementById('replaceState_InfoBox').innerHTML=msg.message;
}

//初始化代码，固定格式
$(function () {
    try{
        let sheet_array = [
            {
                "id": "", //表格中的table id
                "name": "",
                "sheetKeyWords": ["","",""],
                "all_tableData": [{
                    "id": 1,
                    "rowKeyWords": "",
                    "colKeyWords": "",
                    "oldText": "表格1内旧文本内容1",
                    "newText": "表格1内新文本内容1"
                },{
                    "id": 2,
                    "rowKeyWords": "",
                    "colKeyWords": "",
                    "oldText": "表格1内旧文本内容2",
                    "newText": "表格1内新文本内容2"
                }]
            },
        ];
        //给每个表格动态设置id和表格名称
        sheet_array = setSheet_ID_Name(sheet_array);
        //初始化所有表格内容
        //第二个参数为 fadeSheetIndex，表示给第几个表格添加淡入淡出效果;
        initSheet(sheet_array, null)

        $("#sheet-startButton").click(function(){
            var message = {
                "source_path": textClean(document.getElementById("sheet-inputTextCustom").value),
                "output_path": textClean(document.getElementById("sheet-outputTextCustom").value),
                "replace_list": sheet_array,  //当前表中最新的数据
                "is_logined": 1, //1代表登录状态
            }
            if(!message.source_path){
                alert("文档输入路径不能为空！")
            }            
            else if(!message.output_path){
                alert("文档输出路径不能为空！")
            }else{
                //开启文本替换状态提示信息
                $("#sheet_replaceState_InfoBox").remove();
                $(".sheet-file-input-output").after('<div class="alert alert-warning sheet_replaceState_InfoBox" id="sheet_replaceState_InfoBox" role="alert"></div>');
                const startTime = getTime();
                $("#sheet_replaceState_InfoBox").html("开始时间：" + startTime + "<br/><b>文档内容替换中......</b>");
                $("#sheet_replaceState_InfoBox").css("display", "block");
                $("#sheet_replaceState_InfoBox").css("text-align", "center");

                sheetReplace(JSON.stringify(message));
            }
        })

        //读取本地json文件
        $("#sheet-confirmLoadButton").click(function(){
            var selectedFile = document.getElementById("sheet-inputLocalFile").files[0];//获取读取的File对象
            var name = selectedFile.name;//读取选中文件的文件名
            var size = selectedFile.size;//读取选中文件的大小
            console.log("文件名:"+name+"大小："+size);
            var reader = new FileReader();//这里是核心！！！读取操作就是由它完成的。
            reader.readAsText(selectedFile);//读取文件的内容

            reader.onload = function(){
                console.log("读取结果：", this.result);//当读取完成之后会回调这个函数，然后此时文件的内容存储到了result中。直接操作即可。

                console.log("读取结果转为JSON：");
                let json = JSON.parse(this.result);
                sheet_array = json;
                //判断加载的模板是否正确
                if(sheet_array[0].hasOwnProperty("sheetKeyWords")){
                    initSheet(sheet_array, null)
                }else{
                    alert('模板类别错误，请选择"指定表格内容替换模板"!');
                }
            };
        })

        $("#sheet-modelOutputButton").click(function(){
            var message = {
                "tableData": sheet_array,
                "is_logined": 1, //1代表登录状态
            }
            sheets_SaveMode(JSON.stringify(message));
        })

        new QWebChannel(qt.webChannelTransport, function (channel) {
            window.py = channel.objects.py;
        });

        //调用python sheetReplaceHandler接口，进行表格替换
        function sheetReplace(message){
            //调用python的sheetReplaceHandler接口
            setTimeout(function() {
                py.sheetReplaceHandler(message, function(res){
                    resList = res.split("\n")
                    resHtml = ""
                    resList.forEach(function(value, index){
                        resHtml += '<div class="row">'
                        resHtml += '<div class="col-md-1"></div>'
                        resHtml += '<div class="col-md-11">'+ value +'</div>'
                        resHtml += '</div>'
                    })
                    $('.modal-body').html(resHtml);
                    $('#staticBackdrop').modal('show');
                    $("#sheet_replaceState_InfoBox").remove()
                });
            }, 500);
        }

        //Python保存tableData为json文件
        function sheets_SaveMode(message) {
            //调用python的hello方法
            py.sheet_SaveModelHandler(message, function(res){
                alert(res)
            });
        }

        //初始化表格
        function initSheet(sheets, fadeSheetIndex){
            //首先移除存在的表格元素
            $(".sheet-feature").remove();
            let sheets_string = '';
            sheets.forEach(function(value, index){
                //为每个表格中的表格生成唯一ID
                // sheet_array[index].id = "sheetTable_" + index;
                sheets_string += '\n' +
                    '            <div class="card sheet-feature" style="display: none;">\n' +
                    '                <h5 class="card-header">'+ value.name +'</h5>\n' +
                    '                <div class="sheet-toolBox">\n' +
                    '                   <i class="bi sheet-toolBox-plus"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-square" viewBox="0 0 16 16">\n' +
                    '  <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>\n' +
                    '  <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>\n' +
                    '</svg></i>\n' +
                    '                   <i class="bi sheet-toolBox-close"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-square" viewBox="0 0 16 16">\n' +
                    '  <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>\n' +
                    '  <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>\n' +
                    '</svg></i>\n' +
                    '                </div>\n' +
                    '                <div class="card-body">\n' +
                    '                    <div class="row sheet-keywords">\n' +
                    '                        <div class="col input-group mb-3 sheet-keywords-col">\n' +
                    '                            <div class="input-group-prepend">\n' +
                    '                                <span class="input-group-text" id="inputGroup-sizing-default">表内关键词1</span>\n' +
                    '                            </div>\n' +
                    '                            <input required name="inputTextCustom" type="text" class="form-control sheet-keywords" id="sheet-keywords_0" value="'+ value.sheetKeyWords[0] +'" placeholder="必填">\n' +
                    '                        </div>\n' +
                    '                        <div class="col input-group mb-3 sheet-keywords-col">\n' +
                    '                            <div class="input-group-prepend">\n' +
                    '                                <span class="input-group-text" id="inputGroup-sizing-default">表内关键词2</span>\n' +
                    '                            </div>\n' +
                    '                            <input required name="outputTextCustom" type="text" class="form-control sheet-keywords" id="sheet-keywords_1" value="'+ value.sheetKeyWords[1] +'" placeholder="选填">\n' +
                    '                        </div>\n' +
                    '                    </div>\n' +
                    '                    <div class="row sheet-keywords">\n' +
                    '                        <div class="col input-group mb-3 sheet-keywords-col">\n' +
                    '                            <div class="input-group-prepend">\n' +
                    '                                <span class="input-group-text" id="inputGroup-sizing-default">表内关键词3</span>\n' +
                    '                            </div>\n' +
                    '                            <input required name="inputTextCustom" type="text" class="form-control sheet-keywords" id="sheet-keywords_2" value="'+ value.sheetKeyWords[2] +'" placeholder="选填">\n' +
                    '                        </div>\n' +
                    '                    </div>\n' +
                    '                    <div class="row no-gutters">\n' +
                    '                        <table id="'+ value.id +'" class="table-hover no-gutters">\n' +
                    '                        </table>\n' +
                    '                    </div>\n' +
                    '                </div>\n' +
                    '            </div>';
            })
            //把表格元素的html放到 “sheet-model-input-output”后面
            $("#sheet-model-input-output").after(sheets_string);

            //为指定的表格添加淡入效果
            if(fadeSheetIndex){
                $($(".sheet-feature")[fadeSheetIndex]).fadeIn(1000)
                $(".sheet-feature").css("display", "block");
            }else{
                $(".sheet-feature").css("display", "block");
            }

            //初始化每个表格的操作事件，添加和关闭
            //添加事件
            $(".sheet-toolBox-plus").click(function(){
                const currentSheetIndex = parseInt($(this).parents(".sheet-feature").find("h5").text().split("表格")[1]);
                const currentDocumentScroll= $(document).scrollTop()
                //更新显示所有表格
                refreshSheets(currentSheetIndex, 1);
                if($(window).height() < $(document).height()){
                    $(document).scrollTop(currentDocumentScroll);
                }
            })
            //关闭事件
            $(".sheet-toolBox-close").click(function(){
                const currentSheetIndex = parseInt($(this).parents(".sheet-feature").find("h5").text().split("表格")[1]);
                $(this).parents(".sheet-feature").fadeOut(1000)
                $(this).parents(".sheet-feature").remove();
                const currentDocumentScroll= $(document).scrollTop()
                //更新显示所有表格
                refreshSheets(currentSheetIndex, 0);
                if($(window).height() < $(document).height()){
                    $(document).scrollTop(currentDocumentScroll);
                }
            })

            //为每个表格的表内关键词标签添加blur事件
            $(".sheet-keywords").blur(function(){
                const currentDocumentScroll= $(document).scrollTop()
                refreshSheetKeyWords(this);
                if($(window).height() < $(document).height()){
                    $(document).scrollTop(currentDocumentScroll);
                }
            })

            //初始化每个表格中的表格，并为其中的行添加操作事件
            sheets.forEach(function(value, index){
                initTable(sheet_array[index].all_tableData, value.id);
            })
        }

        //表内关键词内容修改后，更新全局变量
        function refreshSheetKeyWords(_this){
            const currentSheetIndex = parseInt($(_this).parents(".sheet-feature").find("h5").text().split("表格")[1]);
            const currentKeyWordID = $(_this).attr("id");
            const currentKeyWordIDIndex = parseInt(currentKeyWordID.split("_")[1]);
            sheet_array[currentSheetIndex-1].sheetKeyWords[currentKeyWordIDIndex] = textClean($(_this).val());
            // console.log(1);
        }

        //更新所用表格，更新思路为：修改表格数据对象，然后重新渲染;type=1为新增，type=0为删除
        function refreshSheets(currentSheetIndex, type){
            if(type){
                sheet_array.splice(currentSheetIndex, 0, {
                    "id": "",
                    "name": "",
                    "sheetKeyWords": ["","",""],
                    "all_tableData": [{
                        "id": 1,
                        "rowKeyWords": "",
                        "colKeyWords": "",
                        "oldText": "",
                        "newText": ""
                    },{
                        "id": 2,
                        "rowKeyWords": "",
                        "colKeyWords": "",
                        "oldText": "",
                        "newText": ""
                    }]
                })
                //给每个表格动态设置id
                sheet_array = setSheet_ID_Name(sheet_array);
                //重新渲染所有表格
                //新增元素时，设置下一个元素淡入
                const fadeSheetIndex = currentSheetIndex
                initSheet(sheet_array, fadeSheetIndex)
            }else{
                sheet_array.splice(currentSheetIndex-1,1)
                //给每个表格动态设置id
                sheet_array = setSheet_ID_Name(sheet_array);
                //重新渲染所有表格
                //删除元素时，仅在删除事件中设置当前元素淡出，此时初始化不再添加效果
                initSheet(sheet_array, null)
            }
        }

        //给每个表格动态设置id
        function setSheet_ID_Name(sheets){
            sheets.forEach(function(value, index){
                value.id = "sheetTable_" + index;
                value.name = "表格" + (index + 1);
            })
            return sheets;
        }

        //下面是初始化table的代码
        function initTable(tableData, tableID){
            const windowInnerWidth = window.innerWidth;
            const indexWidth = 102;
            const row_col_keywords_width = 120
            const oldTextWidth = (windowInnerWidth - indexWidth - row_col_keywords_width * 2) / 2;
            const newTextWidth = oldTextWidth

            // 首先销毁表格
            $('#' + tableID).bootstrapTable('destroy');
            // 初始化表格,动态从服务器加载数据
            $('#' + tableID).bootstrapTable({
                pagination: false,   //启动分页
                striped: true,    //设置为 true 会有隔行变色效果
                cache: false,                       //是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
                pageSize: 20,//初始页记录数
                sortable: true,    //排序
                // pageList: [1,50], //记录数可选列表
                smartDisplay: false,    //程序自动判断显示分页信息
                columns: [{
                    title: '序号',
                    align: 'center',
                    halign: 'center',
                    width: indexWidth,
                    // sortable:true,    //排序
                    formatter: rowOperator
                }, {
                    field: 'rowKeyWords',
                    title: '行关键词',
                    align: 'center',
                    width: row_col_keywords_width,
                    formatter: function(value, row, index){
                        return '<textarea class="form-control sheet-textareaInput" aria-label="With textarea" style="border:none" placeholder="选填">'+ value +'</textarea>'
                    }
                    // sortable:true    //排序
                }, {
                    field: 'colKeyWords',
                    title: '列关键词',
                    align: 'center',
                    width: row_col_keywords_width,
                    formatter: function(value, row, index){
                        return '<textarea class="form-control sheet-textareaInput" aria-label="With textarea" style="border:none" placeholder="选填">'+ value +'</textarea>'
                    }
                    // sortable:true    //排序
                }, {
                    field: 'oldText',
                    title: '旧文本',
                    align: 'center',
                    width: oldTextWidth,
                    formatter: function(value, row, index){
                        return '<textarea class="form-control sheet-textareaInput" aria-label="With textarea" style="border:none">'+ value +'</textarea>'
                    }
                    // sortable:true    //排序
                }, {
                    field: 'newText',
                    title: '新文本',
                    width: newTextWidth,
                    align: 'center',
                    formatter: function(value, row, index){
                        return '<textarea class="form-control sheet-textareaInput" aria-label="With textarea" style="border:none">'+ value +'</textarea>'
                    }
                }],
                data: tableData,
                // onClickRow: rowClickMethod
            });
            //重新初始化表格行的悬浮事件、添加事件、删除事件
            initTableEvents($('#' + tableID));
        }

        //重新初始化表格行的悬浮事件、添加事件、删除事件
        function initTableEvents(tableElement){
            tableElement.find("tr").hover(
                function() {
                    $(this).find(".row_operation").css("display","inline")
                },
                function() {
                    $(this).find(".row_operation").css("display","none")
                }
            )
            $(".sheet_add_row").click(function(){
                // $(this).parents("tr").after('<tr> '+$(this).parents("tr").html() + ' </tr>');
                $(this).parents("tr").after('<tr></tr>');
                //添加完行后更新表格
                refreshTable(this, 1);
                // console.log($(this));
            })
            $(".sheet_delete_row").click(function(){
                const curTableElement = $(this).parents("table");
                $(this).parents("tr").remove();
                //删除完行后更新表格
                deleteRefreshTable(curTableElement);
                // console.log($(this));
            })
            $(".sheet-textareaInput").blur(function(){
                refreshTable(this, 0);
            })
        }

        //列操作
        function rowOperator(value, row, index){
            rowNumber = index + 1;
            return [
                '<div class="row_operation_container">',
                '<span class="row_operation">',
                '<span class="sheet_add_row"><i class="bi"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-circle" viewBox="0 0 16 16">\n' +
                '  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>\n' +
                '  <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>\n' +
                '</svg></i></span>',
                '<span class="sheet_delete_row"><i class="bi"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-dash-circle" viewBox="0 0 16 16">\n' +
                '  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>\n' +
                '  <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8z"/>\n' +
                '</svg></i></span>',
                '</span>',
                '</div>',
                '<div class="row_header">'+ rowNumber +'</div>'
            ].join("")
        }

        //查找表中是否已存在相同的key内容，以oldText字段作为key
        function is_key_exit(key, _tableData){
            let result = false;
            _tableData.each(function(index, value){
                if(key == value.oldText){
                    result = true;
                }
            })
            return result;
        }

        //添加及修改文本后刷新table
        function refreshTable(_this, type){
            //这个条件是响应添加行事件，同时排除未知原因导致的第一次添加时refreshTable()执行两次的问题，第二次执行时id为undefined，不继续执行；type=1代表添加行
            if(type && $(_this).parents("table").attr("id")){
                const currentTable = $(_this).parents("table");
                const currentTableID = currentTable.attr("id");
                const currentTableIndex = parseInt(currentTableID.split("_")[1]);
                //获取当前表格元素中的数据
                const tempTableData = getCurrentTableData(currentTable);
                sheet_array[currentTableIndex].all_tableData = tempTableData;
                initTable(sheet_array[currentTableIndex].all_tableData, currentTableID)
            }
            //这个条件是响应文本框失去焦点事件，当文本框内容改变时继续执行，没发生改变时，不继续执行；type=0代表文本框失去焦点
            //失去焦点的事件也会执行2次，暂时还不知道原因，但是不影响结果；通过$(_this).parents("table").attr("id")判断第二次执行时的id是否存在来屏蔽
            else if($(_this).parent().text() != $(_this).val() && $(_this).parents("table").attr("id")){
                const currentTable = $(_this).parents("table");
                const currentTableID = currentTable.attr("id");
                const currentTableIndex = parseInt(currentTableID.split("_")[1]);
                //修改父元素内容顺序在后，不然导致无法获取到Table元素；修改父元素文本这一步是必须的，不然后续遍历表格对象仍然无法获取改变后的内容
                $(_this).parent().text($(_this).val())
                //获取当前表格元素中的数据
                const tempTableData = getCurrentTableData(currentTable);
                sheet_array[currentTableIndex].all_tableData = tempTableData;
                initTable(sheet_array[currentTableIndex].all_tableData, currentTableID)
            }
        }

        //删除表格行后刷新表格，因为删除行后，当前this指向的元素已经移除，所以传入refreshTable()函数后，无法获取到其父元素Table,需重写一个刷新方法
        function deleteRefreshTable(curTableElement){
            const currentTableID = curTableElement.attr("id");
            const currentTableIndex = parseInt(currentTableID.split("_")[1]);
            //获取当前表格元素中的数据
            const tempTableData = getCurrentTableData(curTableElement);
            sheet_array[currentTableIndex].all_tableData = tempTableData;
            initTable(sheet_array[currentTableIndex].all_tableData, currentTableID);
        }

        //获取当前表格元素中的数据，可用textClean()函数对输入的数据进行清洗，去除特殊字符
        function getCurrentTableData(curTableElement){
            const tempTableData = [];
            curTableElement.find("tbody tr").each(function(index, value){
                const rowData = $(value).find("td");
                tempTableData.push({
                    "id": index + 1,
                    "rowKeyWords": textClean($(rowData[1]).text()),
                    "colKeyWords": textClean($(rowData[2]).text()),
                    "oldText": $(rowData[3]).text(),
                    "newText": $(rowData[4]).text(),
                    // "rowKeyWords": textClean($(rowData[1]).text()),
                    // "colKeyWords": textClean($(rowData[2]).text()),
                    // "oldText": textClean($(rowData[3]).text()),
                    // "newText": textClean($(rowData[4]).text())
                });
            })
            return tempTableData;
        }

        //清楚字符串中的空格、回车、换行符
        function textClean(text){
            if(text){
                return text.replace(/[ ]/g,"").replace(/[\r\n]/g,"");
            }else{
                return "";
            }
        }

        //获取时间
        function getTime() {
            var myDate = new Date();
            var myYear = myDate.getFullYear(); //获取完整的年份(4位,1970-????)
            var myMonth = myDate.getMonth() + 1; //获取当前月份(0-11,0代表1月)
            var myToday = myDate.getDate(); //获取当前日(1-31)
            var myDay = myDate.getDay(); //获取当前星期X(0-6,0代表星期天)
            var myHour = myDate.getHours(); //获取当前小时数(0-23)
            var myMinute = myDate.getMinutes(); //获取当前分钟数(0-59)
            var mySecond = myDate.getSeconds(); //获取当前秒数(0-59)
            var week = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
            var NowTime = myYear + '-' + fillZero(myMonth) + '-' + fillZero(myToday) + '&nbsp;&nbsp;' + week[myDay] +
                '&nbsp;&nbsp;' + fillZero(myHour) + ':' + fillZero(myMinute) + ':' + fillZero(mySecond);
            return NowTime
        };
        function fillZero(str) {
            var realNum;
            if (str < 10) {
                realNum = '0' + str;
            } else {
                realNum = str;
            }
            return realNum;
        }

    }catch (err){
        alert(err)
    }

})