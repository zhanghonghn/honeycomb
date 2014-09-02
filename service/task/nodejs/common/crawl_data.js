//TODO使用Phantom进行登陆

var http = require('http');
var oURL = require('url');
var querystring = require('querystring');
var PhantomClass = require('phantom');

var oCrawlManager = {
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
    _getHeader: function (cookies, data, oURLData) {
        var oHeaderData = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/32.0.1700.76 Safari/537.36',
            'Connection': 'keep-alive',
            'Accept-Encoding': 'gzip,deflate,sdch',
            'Accept-Language': 'zh-CN,zh;q=0.8,en;q=0.6,nl;q=0.4,zh-TW;q=0.2',
            'Cache-Control': 'no-cache',
            'Host': oURLData.hostname,
            'Accept': '*/*'
        }
        if (cookies) {
            oHeaderData['Cookie'] = cookies;
        }
        if (data) {
            if (typeof data == 'object') {
                oHeaderData['Content-Length'] = querystring.stringify(data).length;
            } else {
                oHeaderData['Content-Length'] = data.length;
            }
        }
        return oHeaderData;
    },
    getDirectPageData: function (url, callback) {
        http.get(url, function (res) {
            var data = "";
            res.on('data', function (chunk) {
                data += chunk;
            });
            res.on("end", function () {
                callback(data);
            });
        }).on("error", function (err) {
            callback(null, err);
        });
    },
    getPageData: function (url, cookies, data, method, callback) {
        var oURLData = this.parseURI(url);
        var oRequestBody = oURLData.search ? oURLData.search.slice(1) : '';
        if (data) {
            if (typeof data == 'object') {
                oRequestBody = oRequestBody ? oRequestBody + '&' + querystring.stringify(data) : querystring.stringify(data);
            } else {
                oRequestBody = oRequestBody ? oRequestBody + '&' + data : data;
            }
        }
        var oHeader = oCrawlManager._getHeader(cookies, oRequestBody, oURLData);

        var options = {
            hostname: oURLData.hostname,
            port: oURLData.port,
            path: oURLData.path,
            method: method || 'get',
            headers: oHeader
        };
        var req = http.request(options, function (res) {
            var data = "";
            res.on('data', function (chunk) {
                data += chunk;
            });
            res.on("end", function () {
                callback && callback(data);
            });
        }).on("error", function () {
            callback && callback(null);
        });
        req.write(oRequestBody, 'utf-8');
        req.end();
        return req;
    },
    getAjaxPageData: function (url, cookies, data, method, callback) {//ajax默认带都cookies
        var oURLData = this.parseURI(url);
        var oHeader = oCrawlManager._getHeader(cookies, data, oURLData);

        oHeader['X-Requested-With'] = 'XMLHttpRequest';
        oHeader['Accept'] = 'Accept:application/json, text/javascript, */*';

        var options = {
            hostname: oURLData.hostname,
            port: oURLData.port,
            path: oURLData.path,
            method: method || 'get',
            headers: oHeader
        };
        var req = http.request(options, function (res) {
            var data = "";
            res.on('data', function (chunk) {
                data += chunk;
            });
            res.on("end", function () {
                callback && callback(data);
            });
        }).on("error", function () {
            callback(null);
        });
        req.write(querystring.stringify(data), 'utf-8');
        req.end();
        return req;
    },
    getLoginCookie: function (url, data, callback) {
        var req = oCrawlManager.getPageData(url, null, data, 'post');
        req.on('response', function (res) {
            callback && callback(res.header['cookie']);
            req = null;
        });
    },
    getAjaxLoginCookie: function (url, data, callback) {
        var req = oCrawlManager.getAjaxPageData(url, null, data, 'post');
        req.on('response', function (res) {
            console.log(res);
            callback && callback(res.headers['cookie']);
            req = null;
        });
    },
    getPageCookie: function (url, method, data, callback, b_ajax) {
        PhantomClass.create(function (phantom) {
            phantom.createPage(function (page) {
                if (data && typeof data == 'object') {
                    data = querystring.stringify(data);
                }
                if (b_ajax) {
                    page.setHeaders({ "X-Requested-With": "XMLHttpRequest" });
                }
                page.set('settings.loadImages', false);
                page.set('settings.diskCache', false);
                page.open(url, method || 'get', data || null, function (status) {
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
    getAjaxPageCookie: function (url, method, data, callback) {
        oCrawlManager.getPageCookie(url, method, data, callback, true);
    }
}

module.exports = oCrawlManager;

//oCrawlManager.getAjaxLoginCookie('http://www.newsmth.net/nForum/user/ajax_login.json', { "id": 'wjzh', "passwd": 'bull51526', "CookieDate": '3', 'mode': '0' }, function (cookie, page) {
//    console.log(cookie);
//}, true);

//oCrawlManager.getDirectPageData('http://www.baidu.com', function (data) {
//    console.log(data);
//})
