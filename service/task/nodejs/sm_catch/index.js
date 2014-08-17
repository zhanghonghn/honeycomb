var http = require('http');
var cheerio = require("cheerio");
var querystring = require('querystring');
var oFile = require('fs');


function Request() {
    this.sCookies = null;
}
Request.prototype = {
    getPageData: function (url, callback) {
        http.get(url, function (res) {
            var data = "";
            res.on('data', function (chunk) {
                data += chunk;
            });
            res.on("end", function () {
                callback(data);
            });
        }).on("error", function () {
            callback(null);
        });
    },
    postPageData: function (url, r_data, callback) {
        var options = {
            hostname: hostname,
            port: 80,
            path: path,
            method: 'POST'
        };
        var post_data = '';
        if (data) {
            post_data = querystring.stringify(r_data);
            options.headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': post_data.length
            }
        }
        var req = http.request(options, function (res) {
            var data = "";
            res.on('data', function (chunk) {
                data += chunk;
            });
            res.on("end", function () {
                callback(data, res);
            });
        }).on('error', function (e) {
            callback(null);
        });
        req.write(post_data + "\n");
        req.end()
    },
    getCookies: function (url, data, callback) {
        var _this = this;
        this.postPageData(url, data, function (res_data, res) {
            debugger;
            callback && callback(res_data, res);
        });
    }
}

var oTest = new Request();

oTest.getCookies('http://www.newsmth.net/nForum/login', { "id": 'wjzh', "passwd": 'bull51526', "s-mode": '0', "CookieDate": '3' }, function (res_data, res) {
    debugger;
});

