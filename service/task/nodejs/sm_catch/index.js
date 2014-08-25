//TODO使用Phantom进行登陆

var http = require('http');
var cheerio = require("cheerio");
var querystring = require('querystring');
var oFile = require('fs');
var oProcess = require('child_process');
var phantom = require('phantom');

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
    encodeCookies: function (cookies) {
        var data = JSON.parse(cookies || "[]");
        var iLen = data.length;
        var result_cookies = '';
        while (iLen--) {
            result_cookies += data[iLen]['name'] + "=" + data[iLen]['value'] + (iLen > 0 ? "; " : '');
        }
        return result_cookies;
    },
    getCookies: function (url, data, callback, no_login) {
        var _this = this;
        if (!no_login) {
            console.log('phantomjs catch_login_cookies.js "' + url + '" "' + JSON.stringify(data).replace(/\"/g, '\\"') + '"');
            oProcess.exec('phantomjs catch_login_cookies.js "' + url + '" "' + JSON.stringify(data).replace(/\"/g, '\\"') + '"', function (error, cookies, stderr) {
                if (error !== null) {
                    console.log('exec error: ' + error);
                } else {
                    callback && callback(_this.encodeCookies(cookies));
                }
            });
        } else {
            oProcess.exec('phantomjs catch_home_cookies.js "' + url + '" "' + data + '"', function (error, cookies, stderr) {
                if (error !== null) {
                    console.log('exec error: ' + error);
                } else {
                    callback && callback(_this.encodeCookies(cookies));
                }
            });
        }
    }
}

var oTest = new Request();
oTest.getCookies('http://www.newsmth.net/nForum/user/ajax_login.json', { "id": 'wjzh', "passwd": 'bull51526', "CookieDate": '3', 'mode': '2' }, function (cookies) {

    oTest.getCookies('http://m.newsmth.net/article/FamilyLife/1755452124', cookies, function (page_data) {
        oFile.writeFile('./test.html', page_data);
    }, true);
});

