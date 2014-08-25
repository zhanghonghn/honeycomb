//TODO使用Phantom进行登陆

var http = require('http');
var cheerio = require("cheerio");
var querystring = require('querystring');
var oFile = require('fs');
var oProcess = require('child_process');
var PhantomClass = require('phantom');

function Spiders() {
    this.sCookies = null;
}
Spiders.prototype = {
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
    getPageData: function (url, cookies, callback, b_ajax) {
        var oURLData = this.parseURI(url);
        var oHeader = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/32.0.1700.76 Safari/537.36',
            'Cookie': cookies,
            'Connection': 'keep-alive',
            'Content-Type': 'text/html',
            'Content-Length': oURLData.search.slice(1).length
        }
        if (b_ajax) {
            oHeader['X-Requested-With'] = 'XMLHttpRequest';
        }

        var options = {
            hostname: oURLData.hostname,
            port: oURLData.port,
            path: oURLData.path,
            method: 'get',
            headers: oHeader
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
        req.write(oURLData.search.slice(1) + "\n");
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
    getRequestBody: function (json_data) {
        var arrData = [];
        if (json_data) {
            for (var sName in json_data) {
                arrData.push(sName + "=" + json_data[sName]);
            }
            return encodeURI(arrData.join('&'));
        }
        return null;
    },
    getCookie: function (url, method, data, callback, b_ajax) {
        var _this = this;
        PhantomClass.create(function (phantom) {
            phantom.createPage(function (page) {
                if (b_ajax) {
                    page.setHeaders({ "X-Requested-With": "XMLHttpRequest" });
                }
                page.set('settings.loadImages', false);
                page.set('settings.diskCache', false);
                page.open(url, method || 'get', _this.getRequestBody(data || null), function (status) {
                    if (status == "success") {
                        page.evaluate(function () { return document.cookie; }, function (cookie) {
                            callback && callback(cookie, page);
                        });
                    } else {
                        console.log('获取【' + url + '】失败！');
                    }
                });
            });
        });
    },
    getPage: function (page, url, callback) {
        page.setHeaders({ "X-Requested-With": "" });
        page.open(url, function (status) {
            if (status == "success") {
                page.render('./test_0.png');
                callback && callback(page);
            } else {
                console.log('获取【' + url + '】失败！');
            }
        });
    },
    ajaxGetPage: function (page, url, callback) {
        page.setHeaders({ "X-Requested-With": "XMLHttpRequest" });
        page.open(url, function (status) {
            if (status == "success") {
                callback && callback(page);
            } else {
                console.log('获取【' + url + '】失败！');
            }
        });
    }
}
module.exports = Spiders;

var oTest = new Spiders();
oTest.getCookie('http://www.newsmth.net/nForum/user/ajax_login.json', 'post', { "id": 'wjzh', "passwd": 'bull51526', "CookieDate": '3', 'mode': '0' }, function (cookie, page) {
    oTest.ajaxGetPage(page, 'http://www.newsmth.net/nForum/board/DecorationTrade?ajax', function (page) {
        oFile.writeFile('./test.html', page.getContent());
    }, true);
}, true);

