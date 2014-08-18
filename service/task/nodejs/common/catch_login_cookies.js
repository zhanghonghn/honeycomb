var page = require('webpage').create();
var system = require("system");
var fs = require('fs');
var args = system.args; //获取参数
var url = args[1];
var json_data = args[2] || '{}';
function getPageBody(json_data) {
    var arrData = [];
    for (var sName in json_data) {
        arrData.push(sName + "=" + json_data[sName]);
    }
    return encodeURI(arrData.join('&'));
}

page.onResourceError = function (resourceError) {
    console.log(JSON.parse(json_data));
    if (resourceError.url == url) {
        console.log('发生异常！');
        phantom.exit();
    }
}

page.customHeaders = {
    "Origin": "http://www.newsmth.net",
    "X-Requested-With": "XMLHttpRequest"
}
page.open(url, 'POST', getPageBody(JSON.parse(json_data)), function (status) {
    if (status == 'success') {
//        page.evaluate(function () {
//            console.log(JSON.stringify(page.cookies));
//        });
        console.log(JSON.stringify(page.cookies));
    } else {
        console.log(url + ':登录加载失败！');
    }
    phantom.exit();
});