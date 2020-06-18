var url = "http://localhost:5005/conversations/";  // Rasa API
var messages_url;  // 发送消息
var predict_url;  // 预测下一步动作
var execute_url;  // 执行动作
var action = "action_listen";  // 动作初始化为等待输入

/*全局函数*/
$(function () {
    // 初始化
    var conversation_id = uuid();  // 随机生成uuid作为conversation_id
    $("#conversation_id").val(conversation_id);
    messages_url = url + conversation_id + "/messages";  // 发送消息
    predict_url = url + conversation_id + "/predict";  // 预测下一步动作
    execute_url = url + conversation_id + "/execute";  // 执行动作
    // 发送事件
    send();
});

/*发送事件*/
function send() {
    // 点击或回车发送按钮
    $("#send").on("click", function () {
        f();
    });
    $("#text").on("keydown", function (event) {
        var keyCode = event.keyCode || event.which;
        if (keyCode == "13") {//回车
            f();
        }
    });

    function f() {
        var text = $("#text").val();  // 获取输入文本
        $("#text").val("");  // 重置为空
        $("#text").focus();  // 设置焦点
        $("#dialog").append("<p>Your input ->  <b>" + text + "</b></p>");  // 页面添加输入文本
        messages(text);  // 发送消息
    }
}

/*发送消息*/
function messages(text) {
    $("#send").attr("disabled", true);  // 按钮设为不可用
    $(".choice").attr("disabled", true);  // 按钮设为不可用
    console.log('发送消息', text);
    $.ajax({
        type: "POST",
        url: messages_url,
        data: JSON.stringify({"text": text, "sender": "user"}), //需要转成JSON字符串
        dataType: "json",
        success: function () {
            while (true) {
                if (action === "action_listen" && $("#send").attr("disabled") === undefined) {
                    break;  // 动作不是等待输入的话一直预测并执行动作
                }
                predict();  // 循环的内容需要同步
            }
        }
    });
}

/*预测下一步动作*/
function predict() {
    $.ajax({
        type: "POST",
        url: predict_url,
        dataType: "json",
        async: false,
        success: function (response) {
            action = response["scores"][0]["action"];  // 取置信度最高的动作
            console.log(action);
            if (action === "action_listen") {
                $("#send").attr("disabled", false);  // 按钮设为可用
            }
            execute();
        }
    });
}

/*执行动作*/
function execute() {
    $.ajax({
        type: "POST",
        url: execute_url,
        data: JSON.stringify({"name": action}),
        dataType: "json",
        success: function (response) {
            var messages = response["messages"];
            if (messages.length !== 0) {
                console.log(messages);
            }
            for (i in messages) {
                if ("text" in messages[i]) {
                    var t = messages[i]["text"];
                    $("#dialog").append("<p>" + t + "</p>");
                }
                if ("image" in messages[i]) {
                    var image = messages[i]["image"];
                    // $("#dialog").append("<p><a href=" + image + ">" + image + "</a></p>");
                    $("#dialog").append('<a href="' + image + '"><img src="' + image + '" class="img-rounded"></a>');
                }
                if ("buttons" in messages[i]) {
                    var buttons = messages[i]["buttons"];
                    for (j in buttons) {
                        var payload = buttons[j]["payload"];
                        $("#dialog").append('<button type="submit" class="btn btn-default btn-sm choice" value="' + payload + '">' + buttons[j]["title"] + '</button>' + "&nbsp;&nbsp;");
                    }
                    choose();  // 选择事件
                }
            }
            $("#dialog").get(0).scrollTop = $("#dialog").get(0).scrollHeight; // 自动滚到底
        }
    });
}

/*选择事件*/
function choose() {
    $(".choice").on("click", function () {
        // $("#send").attr("disabled", true);  // 按钮设为不可用
        // $(".choice").attr("disabled", true);  // 按钮设为不可用
        var payload = $(this).val();  // 真实数据
        var text = $(this).text();  // 呈现数据
        if (payload === "") {
            payload = text;  // 真实数据为空时替换成呈现数据
        }
        $("#dialog").append("<p>Your input ->  <b>" + payload + "</b></p>");  // 页面添加输入文本
        $("#text").focus();  // 设置焦点
        messages(payload);  // 发送消息
    });
}

/*生成唯一id*/
function uuid() {
    function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }

    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}