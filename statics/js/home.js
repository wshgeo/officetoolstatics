// var all_tableData = []
// var paragraph_tableData = []
// var sheet_tableData = []
//接收python传来的数据
function showPythonValue(msg) {
    // alert("接收到了python中的值")
    // $("#full_replaceState_InfoBox").text(msg.message)
    // alert("姓名："+ msg.name +",性别："+ msg.gender +",年龄："+ msg.age);
    // document.getElementById('full_replaceState_InfoBox').innerHTML=msg.message;
}

//初始化代码，固定格式
$(function () {
    try{
        const testValue = "page1"
        $(".test1").text(testValue)
        let all_tableData = [{
                id: 1,
                oldText: "旧文本内容1",
                newText: "新文本内容1"
            },{
                id: 2,
                oldText: "旧文本内容2",
                newText: "新文本内容2"
            }
        ]
        initFullContentTable(all_tableData);

        $("#startButton").click(function(){
            var message = {
                "source_path": document.getElementById("inputTextCustom").value,
                "output_path": document.getElementById("outputTextCustom").value,
                "replace_list": all_tableData,  //当前表中最新的数据
                "is_logined": 1, //1代表登录状态
            }
            if(!message.source_path){
                alert("文档输入路径不能为空！")
            }            
            else if(!message.output_path){
                alert("文档输出路径不能为空！")
            }else{
                //开启文本替换状态提示信息
                $("#full_replaceState_InfoBox").remove();
                $(".full-file-input-output").after('<div class="alert alert-warning full_replaceState_InfoBox" id="full_replaceState_InfoBox" role="alert"></div>');
                const startTime = getTime();
                $("#full_replaceState_InfoBox").html("开始时间：" + startTime + "<br/><b>文档内容替换中......</b>");
                $("#full_replaceState_InfoBox").css("display", "block");
                $("#full_replaceState_InfoBox").css("text-align", "center");

                fullContentReplace(JSON.stringify(message));
            }
        })

        //读取本地json文件
        $("#confirmLoadButton").click(function(){
            var selectedFile = document.getElementById("inputLocalFile").files[0];//获取读取的File对象
            var name = selectedFile.name;//读取选中文件的文件名
            var size = selectedFile.size;//读取选中文件的大小
            console.log("文件名:"+name+"大小："+size);
            var reader = new FileReader();//这里是核心！！！读取操作就是由它完成的。
            reader.readAsText(selectedFile);//读取文件的内容

            reader.onload = function(){
                console.log("读取结果：", this.result);//当读取完成之后会回调这个函数，然后此时文件的内容存储到了result中。直接操作即可。

                console.log("读取结果转为JSON：");
                let json = JSON.parse(this.result);
                all_tableData = json;
                //判断加载的模板是否正确
                if(all_tableData[0].hasOwnProperty("paragraphKeyWords") || all_tableData[0].hasOwnProperty("sheetKeyWords") || all_tableData[0].hasOwnProperty("inputResourceType")){
                    alert('模板类别错误，请选择"全文内容替换模板"!');
                }else{
                    initFullContentTable(all_tableData)
                }
            };
        })

        $("#modelOutputButton").click(function(){
            var message = {
                "tableData": all_tableData,
                "is_logined": 1, //1代表登录状态
            }
            saveMode(JSON.stringify(message));
        })

        new QWebChannel(qt.webChannelTransport, function (channel) {
            window.py = channel.objects.py;


            // $(".data_row").mouseover(//为li绑定了鼠标进入和鼠标移开的两个参数
            //     function() {
            //         $(".row_option").css("display","inline");
            //     }
            // );
            // $(".data_row").mouseout(//为li绑定了鼠标进入和鼠标移开的两个参数
            //     function() {
            //         $(".row_option").css("display","none");
            //     }
            // );
        });

        //向Python传送数据
        function fullContentReplace(message) {
            //调用python的hello方法
            setTimeout(function() {
                py.fullContentReplaceHandler(message, function(res){
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
                    $("#full_replaceState_InfoBox").remove()
                });
            }, 500);
        }

        //调用python paragraphReplaceHandler接口，进行段落替换
        function paragraphReplace(message){
            //调用python的paragraphReplaceHandler接口
            py.paragraphReplaceHandler(message, function(res){
                alert(res)
            });
        }

        //Python保存tableData为json文件
        function saveMode(message) {
            //调用python的hello方法
            py.saveModelHandler(message, function(res){
                alert(res)
            });
        }

        //下面是初始化table的代码
        function initFullContentTable(tableData){
            const windowInnerWidth = window.innerWidth;
            const indexWidth = 102;
            const oldTextWidth = (windowInnerWidth - indexWidth) / 2;
            const newTextWidth = (windowInnerWidth - indexWidth) / 2;

            // 首先销毁表格
            $('#table').bootstrapTable('destroy');
            // 初始化表格,动态从服务器加载数据
            $('#table').bootstrapTable({
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
                    field: 'oldText',
                    title: '旧文本',
                    align: 'center',
                    width: oldTextWidth,
                    formatter: function(value, row, index){
                        // return '<input class="form-control" aria-label="old text" style="border:none;width:100%;height:100%;overflow:scroll;" value='+ value +' onBlur="refreshFullContentTable(this.value)"></input>'
                        return '<textarea class="form-control full-textareaInput" aria-label="With textarea" style="border:none">'+ value +'</textarea>'
                    }
                    // sortable:true    //排序
                }, {
                    field: 'newText',
                    title: '新文本',
                    width: newTextWidth,
                    align: 'center',
                    formatter: function(value, row, index){
                        return '<textarea class="form-control full-textareaInput" aria-label="With textarea" style="border:none">'+ value +'</textarea>'
                    }
                }],
                data: tableData,
                // onClickRow: rowClickMethod
            });
            //重新初始化表格行的悬浮事件、添加事件、删除事件
            initFullContentEvents($('#table'));
        }

        //重新初始化表格行的悬浮事件、添加事件、删除事件
        function initFullContentEvents(tableElement){
            tableElement.find("tr").hover(
                function() {
                    $(this).find(".row_operation").css("display","inline")
                },
                function() {
                    $(this).find(".row_operation").css("display","none")
                }
            )
            $(".fullContent_add_row").click(function(){
                // $(this).parents("tr").after('<tr> '+$(this).parents("tr").html() + ' </tr>');
                $(this).parents("tr").after('<tr></tr>');
                const currentDocumentScroll= $(document).scrollTop()
                //添加完行后更新表格
                refreshFullContentTable();
                if($(window).height() < $(document).height()){
                    $(document).scrollTop(currentDocumentScroll);
                }
            })
            $(".fullContent_delete_row").click(function(){
                $(this).parents("tr").remove();
                const currentDocumentScroll= $(document).scrollTop()
                //删除完行后更新表格
                refreshFullContentTable();
                if($(window).height() < $(document).height()){
                    $(document).scrollTop(currentDocumentScroll);
                }
            })
            $(".full-textareaInput").blur(function(){
                const currentDocumentScroll= $(document).scrollTop()
                refreshFullContentTable(this)
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
                '<span class="fullContent_add_row"><i class="bi"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-circle" viewBox="0 0 16 16">\n' +
                '  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>\n' +
                '  <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>\n' +
                '</svg></i></span>',
                '<span class="fullContent_delete_row"><i class="bi"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-dash-circle" viewBox="0 0 16 16">\n' +
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
        function refreshFullContentTable(_this){
            if(!_this){
                const tempTableData = [];
                $('#table').find("tbody tr").each(function(index, value){
                    const rowData = $(value).find("td");
                    tempTableData.push({
                        id: index + 1,
                        oldText: $(rowData[1]).text(),
                        newText: $(rowData[2]).text()
                    });
                })
                all_tableData = tempTableData;
                initFullContentTable(all_tableData)
            }
            else if($(_this).parent().text() != $(_this).val()){
                const currentTable = $(_this).parents("table");
                //修改父元素内容顺序在后，不然导致无法获取到Table元素；修改父元素文本这一步是必须的，不然后续遍历表格对象仍然无法获取改变后的内容
                $(_this).parent().text($(_this).val())
                const tempTableData = [];
                currentTable.find("tbody tr").each(function(index, value){
                    const rowData = $(value).find("td");
                    tempTableData.push({
                        id: index + 1,
                        oldText: $(rowData[1]).text(),
                        newText: $(rowData[2]).text()
                    });
                })
                all_tableData = tempTableData;
                initFullContentTable(all_tableData)
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