var url = "http://localhost:5005/webhooks/rest/webhook";

/*全局函数*/
$(function () {
    // 初始化
    var sender = uuid();  // 随机生成uuid作为conversation_id
    $("#sender").val(sender);
    // 发送事件
    send();
});

/*发送事件*/
function send() {
    // 点击或回车发送按钮
    $("#send").on("click", function () {
        f();
    });
    $("#message").on("keydown", function (event) {
        var keyCode = event.keyCode || event.which;
        if (keyCode == "13") {//回车
            f();
        }
    });

    function f() {
        var message = $("#message").val();  // 获取输入文本
        $("#message").val("");  // 重置为空
        $("#message").focus();  // 设置焦点
        $("#dialog").append("<p>Your input ->  <b>" + message + "</b></p>");  // 页面添加输入文本
        messages(message);  // 发送消息
    }
}

/*发送消息*/
function messages(message) {
    $("#send").attr("disabled", true);  // 按钮设为不可用
    $(".choice").attr("disabled", true);  // 按钮设为不可用
    message = message.replaceAll("'", '"');  // 单引号替换为双引号
    console.log('发送消息', message);
    $.ajax({
        type: "POST",
        url: url,
        data: JSON.stringify({"sender": sender, "message": message}), //需要转成JSON字符串
        dataType: "json",
        async: false,
        success: function (response) {
            if (response.length !== 0) {
                console.log(response);
            }
            for (i in response) {
                if ("text" in response[i]) {
                    var t = response[i]["text"];
                    $("#dialog").append("<p>" + t + "</p>");
                }
                if ("image" in response[i]) {
                    var image = response[i]["image"];
                    $("#dialog").append('<a href="' + image + '"><img src="' + image + '" class="img-rounded"></a>');
                }
                if ("buttons" in response[i]) {
                    var buttons = response[i]["buttons"];
                    for (j in buttons) {
                        var payload = buttons[j]["payload"];
                        var html = '<button type="submit" class="btn btn-default btn-sm choice" value=\'{0}\'>{1}</button>&nbsp;&nbsp;'.format(payload, buttons[j]["title"]);
                        $("#dialog").append(html);
                    }
                    choose();  // 选择事件
                }
            }
            $("#send").attr("disabled", false);  // 按钮设为可用
            $("#dialog").get(0).scrollTop = $("#dialog").get(0).scrollHeight; // 自动滚到底
        }
    });
}

/*选择事件*/
function choose() {
    $(".choice").on("click", function () {
        var payload = $(this).val();  // 真实数据
        var message = $(this).text();  // 呈现数据
        if (payload === "") {
            payload = message;  // 真实数据为空时替换成呈现数据
        }
        $("#dialog").append("<p>Your input ->  <b>" + payload + "</b></p>");  // 页面添加输入文本
        $("#message").focus();  // 设置焦点
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

/*字符串占位符*/
String.prototype.format = function () {
    if (arguments.length == 0) return this;
    var param = arguments[0];
    var s = this;
    if (typeof (param) == 'object') {
        for (var key in param)
            s = s.replace(new RegExp("\\{" + key + "\\}", "g"), param[key]);
        return s;
    } else {
        for (var i = 0; i < arguments.length; i++)
            s = s.replace(new RegExp("\\{" + i + "\\}", "g"), arguments[i]);
        return s;
    }
};

/*字符串replaceAll*/
String.prototype.replaceAll = function (s1, s2) {
    return this.replace(new RegExp(s1, "gm"), s2);
};
