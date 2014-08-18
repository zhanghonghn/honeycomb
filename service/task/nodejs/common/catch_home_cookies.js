var page = require('webpage').create();
var system = require("system");
var fs = require('fs');
var args = system.args; //获取参数
var url = args[1];
var cookies = args[2];

function trim(str) {
    return str.replace(/(^\s*)|(\s*$)/g, "");
}
var oCookies = (function () {
    var oData = {};
    var arrData = cookies.split(';');
    var arrTemp = null;
    var iLen = arrData.length;
    while (iLen--) {
        arrTemp = arrData[iLen];
        if (arrTemp) {
            arrTemp = arrTemp.split('=');
            oData[trim(arrTemp[0])] = trim(arrTemp[1]);
        }
    }
    return oData;
})();
page.addCookie(oCookies);

page.onResourceError = function (resourceError) {
    if (resourceError.url == url) {
        console.log('发生异常！');
        phantom.exit();
    }
}

page.open(url, 'get', function (status) {
    if (status == 'success') {
        console.log(JSON.stringify(page.cookies));
    } else {
        console.log(url + ':首页加载失败！');
    }
    phantom.exit();
});