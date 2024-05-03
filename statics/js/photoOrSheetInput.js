// var photoSheetInput_tableData = []
// var paragraph_tableData = []
// var sheet_tableData = []
//接收python传来的数据
function showPythonValue(msg) {
    // alert("接收到了python中的值")
    // $("#photoSheet_inputState_InfoBox").text(msg.message)
    // alert("姓名："+ msg.name +",性别："+ msg.gender +",年龄："+ msg.age);
    // document.getElementById('photoSheet_inputState_InfoBox').innerHTML=msg.message;
}

//初始化代码，固定格式
$(function () {
    try{
        let photoSheetInput_tableData = [{
                id: 1,
                placeHolder: "###示例图片1###",
                inputResourceType: "图片",
                resourceUrl: "./###/###",
            },{
                id: 2,
                placeHolder: "###示例表格1###",
                inputResourceType: "表格",
                resourceUrl: "./###/###",
            }
        ]
        let usedTimeInterval = "";
        initPhotoSheetInputTable(photoSheetInput_tableData);

        $("#photo-sheet-startButton").click(function(){
            var message = {
                "source_path": document.getElementById("photo-sheet-inputTextCustom").value,
                "output_path": document.getElementById("photo-sheet-outputTextCustom").value,
                "replace_list": photoSheetInput_tableData,  //当前表中最新的数据
                "is_logined": 1, //1代表登录状态
            }
            if(!message.source_path){
                alert("文档输入路径不能为空！")
            }            
            else if(!message.output_path){
                alert("文档输出路径不能为空！")
            }
            else if(message.replace_list.length == 0){
                alert("数据导入对照表不能为空！")
            }
            else{
                //开启文本替换状态提示信息
                $("#photoSheet_inputState_InfoBox").remove();
                $(".photo-sheet-file-input-output").after('<div class="alert alert-warning photoSheet_inputState_InfoBox" id="photoSheet_inputState_InfoBox" role="alert"></div>');
                const startTime = getTime();
                let usedTime = 0;
                $("#photoSheet_inputState_InfoBox").html("开始时间：" + startTime.dateString + "<br/><b>数据内容导入中......&nbsp;&nbsp;&nbsp;&nbsp;</b><b class='usedTime'></b>");
                $("#photoSheet_inputState_InfoBox").css("display", "block");
                $("#photoSheet_inputState_InfoBox").css("text-align", "center");
                
                // usedTimeInterval = setInterval(function(){
                //     usedTime++;
                //     usedTime_hours = Math.floor(usedTime/3600);
                //     usedTime_minutes = Math.floor((usedTime % 3600) / 60);
                //     usedTime_seconds = Math.floor(usedTime % 60);
                //     let usedTimeString = (usedTime_hours > 0 ? usedTime_hours + "时" : "") +
                //                          (usedTime_minutes > 0 ? usedTime_minutes + "分" : "") +
                //                          (usedTime_seconds > 0 ? usedTime_seconds + "秒" : "");
                //     // console.log(usedTimeString);
                //     $(".usedTime").text("耗时：" + usedTimeString)
                // },1)

                handlePhotoSheetInput(JSON.stringify(message));
            }
        })

        //读取本地json文件
        $("#photo-sheet-confirmLoadButton").click(function(){
            var selectedFile = document.getElementById("photo-sheet-inputLocalFile").files[0];//获取读取的File对象
            var name = selectedFile.name;//读取选中文件的文件名
            var size = selectedFile.size;//读取选中文件的大小
            console.log("文件名:"+name+"大小："+size);
            var reader = new FileReader();//这里是核心！！！读取操作就是由它完成的。
            reader.readAsText(selectedFile);//读取文件的内容

            reader.onload = function(){
                console.log("读取结果：", this.result);//当读取完成之后会回调这个函数，然后此时文件的内容存储到了result中。直接操作即可。

                console.log("读取结果转为JSON：");
                let json = JSON.parse(this.result);
                photoSheetInput_tableData = json;
                //判断加载的模板是否正确
                if(photoSheetInput_tableData[0].hasOwnProperty("paragraphKeyWords") || photoSheetInput_tableData[0].hasOwnProperty("sheetKeyWords") || photoSheetInput_tableData[0].hasOwnProperty("newText")){
                    alert('模板类别错误，请选择"全文内容替换模板"!');
                }else{
                    initPhotoSheetInputTable(photoSheetInput_tableData)
                }
            };
        })

        $("#photo-sheet-modelOutputButton").click(function(){
            var message = {
                "tableData": photoSheetInput_tableData,
                "is_logined": 1, //1代表登录状态
            }
            saveMode(JSON.stringify(message));
        })

        new QWebChannel(qt.webChannelTransport, function (channel) {
            window.py = channel.objects.py;
        });

        //调用python photoSheetInputHandler接口，进行图片、excel表格导入
        function handlePhotoSheetInput(message) {
            //调用python的hello方法
            setTimeout(function() {
                py.photoSheetInputHandler(message, function(res){
                    // clearInterval(usedTimeInterval);
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
                    $("#photoSheet_inputState_InfoBox").remove()
                });
            }, 500);
        }

        //Python保存tableData为json文件
        function saveMode(message) {
            //调用python的hello方法
            py.photoSheetInput_SaveModelHandler(message, function(res){
                alert(res)
            });
        }

        //下面是初始化table的代码
        function initPhotoSheetInputTable(tableData){
            const windowInnerWidth = window.innerWidth;
            const indexWidth = 102;
            const placeHolderWidth = 240;
            const URLContentWidth = windowInnerWidth - indexWidth * 2 - placeHolderWidth - 20;

            // 首先销毁表格
            $('#photoSheetInputTable').bootstrapTable('destroy');
            // 初始化表格,动态从服务器加载数据
            $('#photoSheetInputTable').bootstrapTable({
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
                },{
                    field: 'inputResourceType',
                    title: '导入数据类型',
                    align: 'center',
                    width: indexWidth,
                    formatter: function(value, row, index){
                        return '<select class="custom-select">'
                            + (value =="图片" ? '<option value="图片" selected>图片</option>' : '<option value="图片">图片</option>')
                            + (value =="表格" ? '<option value="表格" selected>表格</option>' : '<option value="表格">表格</option>')
                            +'</select>'
                        
                        // '<textarea class="form-control photo_sheet-textareaInput" aria-label="With textarea" style="border:none">'+ value +'</textarea>'
                    }
                    // sortable:true    //排序
                }, {
                    field: 'placeHolder',
                    title: '文档中占位符',
                    align: 'center',
                    width: placeHolderWidth,
                    formatter: function(value, row, index){
                        // return '<input class="form-control" aria-label="old text" style="border:none;width:100%;height:100%;overflow:scroll;" value='+ value +' onBlur="refreshPhotoSheetInputTable(this.value)"></input>'
                        return '<textarea class="form-control photo_sheet-textareaInput" aria-label="With textarea" style="border:none">'+ value +'</textarea>'
                    }
                    // sortable:true    //排序
                }, {
                    field: 'resourceUrl',
                    title: '图片或数据表父级路径',
                    width: URLContentWidth,
                    align: 'center',
                    formatter: function(value, row, index){
                        return '<textarea class="form-control photo_sheet-textareaInput" aria-label="With textarea" style="border:none">'+ value +'</textarea>'
                    }
                }],
                data: tableData,
                // onClickRow: rowClickMethod
            });
            //重新初始化表格行的悬浮事件、添加事件、删除事件
            initPhotoSheetInputTableEvents($('#photoSheetInputTable'));
        }

        //重新初始化表格行的悬浮事件、添加事件、删除事件
        function initPhotoSheetInputTableEvents(tableElement){
            tableElement.find("tr").hover(
                function() {
                    $(this).find(".row_operation").css("display","inline")
                },
                function() {
                    $(this).find(".row_operation").css("display","none")
                }
            )
            $(".photo_sheet_add_row").click(function(){
                // $(this).parents("tr").after('<tr> '+$(this).parents("tr").html() + ' </tr>');
                $(this).parents("tr").after('<tr></tr>');
                const currentDocumentScroll= $(document).scrollTop()
                //添加完行后更新表格
                refreshPhotoSheetInputTable();
                if($(window).height() < $(document).height()){
                    $(document).scrollTop(currentDocumentScroll);
                }
            })
            $(".photo_sheet_delete_row").click(function(){
                $(this).parents("tr").remove();
                const currentDocumentScroll= $(document).scrollTop()
                //删除完行后更新表格
                refreshPhotoSheetInputTable();
                if($(window).height() < $(document).height()){
                    $(document).scrollTop(currentDocumentScroll);
                }
            })
            $(".photo_sheet-textareaInput").blur(function(){
                const currentDocumentScroll= $(document).scrollTop()
                refreshPhotoSheetInputTable(this)
                if($(window).height() < $(document).height()){
                    $(document).scrollTop(currentDocumentScroll);
                }
            })
            $(".custom-select").change(function(){
                const currentDocumentScroll= $(document).scrollTop()
                refreshPhotoSheetInputTable(this)
                if($(window).height() < $(document).height()){
                    $(document).scrollTop(currentDocumentScroll);
                }
            })
        }

        //列操作
        function rowOperator(value, row, index){
            rowNumber = index + 1;
            return [
                '<div class="row_operation_container">',
                '<span class="row_operation">',
                '<span class="photo_sheet_add_row"><i class="bi"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-circle" viewBox="0 0 16 16">\n' +
                '  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>\n' +
                '  <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>\n' +
                '</svg></i></span>',
                '<span class="photo_sheet_delete_row"><i class="bi"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-dash-circle" viewBox="0 0 16 16">\n' +
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

        //刷新table
        function refreshPhotoSheetInputTable(_this){
            if(!_this){
                const tempTableData = [];
                $('#photoSheetInputTable').find("tbody tr").each(function(index, value){
                    const rowData = $(value).find("td");
                    tempTableData.push({
                        id: index + 1,
                        // inputResourceType: $(rowData[1]).text(),
                        inputResourceType: $($(rowData[1]).children()).val(),
                        placeHolder: $(rowData[2]).text(),
                        resourceUrl: $(rowData[3]).text()
                    });
                })
                photoSheetInput_tableData = tempTableData;
                initPhotoSheetInputTable(photoSheetInput_tableData)
            }
            else if($(_this).parent().text() != $(_this).val()){
                const currentTable = $(_this).parents("table");
                //修改父元素内容顺序在后，不然导致无法获取到Table元素；修改父元素文本这一步是必须的，不然后续遍历表格对象仍然无法获取改变后的内容
                if($($(_this).parent().children()).is("select")){
                    let selectedValue = $($(_this).parent().children()).val();
                    $($(_this).parent().children()).val(selectedValue);
                }else{
                    $(_this).parent().text($(_this).val())
                }
                const tempTableData = [];
                currentTable.find("tbody tr").each(function(index, value){
                    const rowData = $(value).find("td");
                    tempTableData.push({
                        id: index + 1,
                        // inputResourceType: $(rowData[1]).text(),
                        inputResourceType: $($(rowData[1]).children()).val(),
                        placeHolder: $(rowData[2]).text(),
                        resourceUrl: $(rowData[3]).text()
                    });
                })
                photoSheetInput_tableData = tempTableData;
                initPhotoSheetInputTable(photoSheetInput_tableData)
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
            var nowTime = myYear + '-' + fillZero(myMonth) + '-' + fillZero(myToday) + '&nbsp;&nbsp;' + week[myDay] +
                '&nbsp;&nbsp;' + fillZero(myHour) + ':' + fillZero(myMinute) + ':' + fillZero(mySecond);
            return {
                    "dateObj":myDate,
                    "dateString": nowTime
                }
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