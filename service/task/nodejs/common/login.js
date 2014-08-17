﻿//TODO使用Phantom进行登陆

var http = require('http');
var cheerio = require("cheerio");
var querystring = require('querystring');
var oFile = require('fs');

function parseURI(url) {
    var m = String(url).replace(/^\s+|\s+$/g, '').match(/^([^:\/?#]+:)?(\/\/(?:[^:@]*(?::[^:@]*)?@)?(([^:\/?#]*)(?::(\d*))?))?([^?#]*)(\?[^#]*)?(#[\s\S]*)?/);
    return (m ? {
        href: m[0] || '',
        protocol: m[1] || '',
        authority: m[2] || '',
        host: m[3] || '',
        hostname: m[4] || '',
        port: m[5] || '80',
        pathname: m[6] || '',
        search: m[7] || '',
        hash: m[8] || ''
    } : null);
}

function Request() {
    this.sCookies = null;
}
Request.prototype = {
    parseURI: function (url) {
        var m = String(url).replace(/^\s+|\s+$/g, '').match(/^([^:\/?#]+:)?(\/\/(?:[^:@]*(?::[^:@]*)?@)?(([^:\/?#]*)(?::(\d*))?))?([^?#]*)(\?[^#]*)?(#[\s\S]*)?/);
        return (m ? {
            href: m[0] || '',
            protocol: m[1] || '',
            authority: m[2] || '',
            host: m[3] || '',
            hostname: m[4] || '',
            port: m[5] || '80',
            pathname: m[6] || '',
            search: m[7] || '',
            hash: m[8] || ''
        } : null);
    },
    getPageData: function (url, cookies, callback) {
        var oURLData = this.parseURI(url);
        var options = {
            hostname: oURLData.hostname,
            port: oURLData.port,
            path: oURLData.path,
            method: 'get',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/32.0.1700.76 Safari/537.36',
                'Cookie': cookies,
                'Accept': '/',
                'Connection': 'keep-alive'
            }
        };
        var req = http.request(options, function (res) {
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
        req.end();
    },
    postPageData: function (url, r_data, callback) {
        var oURLData = this.parseURI(url);
        var options = {
            hostname: oURLData.hostname,
            port: oURLData.port,
            path: oURLData.path,
            method: 'POST'
        };
        var post_data = '';
        if (r_data) {
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
        req.end();
    },
    getCookies: function (url, data, callback) {
        var _this = this;
        this.postPageData(url, data, function (res_data, res) {
            callback && callback(res.headers['set-cookie'].join(''));
        });
    }
}

var oTest = new Request();

//oTest.getCookies('http://www.newsmth.net/nForum/login', { "id": 'wjzh', "passwd": 'bull51526', "s-mode": '0', "CookieDate": '3' }, function (cookies) {
//    console.log(cookies);
//});

oTest.getCookies('http://s.club.sohu.com/login-form', { "email": '363077621@qq.com', "password": 'bull51526', "persistentcookie": '1' }, function (cookies) {
    oTest.getPageData('http://i.club.sohu.com/summary', cookies, function (data) {
        console.log(cookies);
        oFile.writeFile('./test.html', data);
        console.log('done');
    });
});
