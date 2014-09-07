
var http = require('http');
var oURL = require('url');
var Iconv = require('iconv-lite');
var Needle = require('needle')
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
            //'Accept-Language': 'zh-CN,zh;q=0.8,en;q=0.6,nl;q=0.4,zh-TW;q=0.2',
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
            return oHeaderData;
        }

    },
    _convertEncode: function (chunks, size, old_encode, to_encode) {
        var buffer = new Buffer(size), pos = 0;
        for (var i = 0, l = chunks.length; i < l; i++) {
            chunks[i].copy(buffer, pos);
            pos += chunks[i].length;
        }
        return Iconv.encode(buffer.toString(), old_encode);
    },
    _addResposeEvent: function (res, callback) {
        var chunks = [], size = 0, data = '';
        res.on('data', function (chunk) {
            chunks.push(chunk);
            size += chunk.length;
        });
        res.on("end", function () {
            var sCurrentEncode = (function () {
                var arrMatch = /charset=(.+)/.exec(res['headers']['content-type']); //[1] || 'GBK'
                if (arrMatch) {
                    return arrMatch[1] ? arrMatch[1].toUpperCase() : 'GBK';
                }
                return 'GBK';
            })();
            callback && callback(oCrawlManager._convertEncode(chunks, size, sCurrentEncode, 'UTF-8'));
        });
    },
    getDirectPageData: function (url, callback) {
        http.get(url, function (res) {
            oCrawlManager._addResposeEvent(res, callback);
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
            path: oURLData.pathname,
            method: method || 'get',
            headers: oHeader
        };
        var req = http.request(options, function (res) {
            oCrawlManager._addResposeEvent(res, callback);
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
            oCrawlManager._addResposeEvent(res, callback);
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
                            callback && callback(cookie, page, phantom);
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
    },
    getPageDataWithPage: function (page, phantom, url, method, data, coockies, callback, b_ajax) {
        if (data && typeof data == 'object') {
            data = querystring.stringify(data);
        }
        if (b_ajax) {
            page.setHeaders({ "X-Requested-With": "XMLHttpRequest" });
        }
        if (coockies) {
            page.setHeaders({ "Cookie": coockies });
        }
        page.set('settings.loadImages', false);
        page.set('settings.diskCache', false);
        page.open(url, method || 'get', data || null, function (status) {
            if (status == "success") {
                page.evaluate(function () { return document.documentElement.outerHTML; }, function (html) {
                    callback && callback(html, page, phantom);
                });
            } else {
                console.log('获取【' + url + '】失败！');
            }
        });
    },
    getPageFromPhantom: function (url, method, data, coockies, callback, b_ajax) {
        PhantomClass.create(function (phantom) {
            phantom.createPage(function (page) {
                oCrawlManager.getPageDataWithPage(page, phantom, url, method, data, coockies, callback, b_ajax);
            });
        });
    },
    getDirectPageDataFromPhantom: function (url, callback) {
        oCrawlManager.getPageFromPhantom(url, 'get', null, null, callback);
    },
    getDirectPageDataFromPhantomWithPage: function (page, phantom, url, callback) {
        oCrawlManager.getPageDataWithPage(page, phantom, url, 'get', null, null, callback);
    }
}

module.exports = oCrawlManager;

/*************测试****************/
//oCrawlManager.getAjaxLoginCookie('http://www.newsmth.net/nForum/user/ajax_login.json', { "id": 'wjzh', "passwd": 'bull51526', "CookieDate": '3', 'mode': '0' }, function (cookie, page) {
//    console.log(cookie);
//}, true);

//oCrawlManager.getDirectPageData('http://www.baidu.com', function (data) {
//    console.log(data);
//})

//var sCookies = 'main[UTMPUSERID]=wjzh; main[UTMPKEY]=80528423; main[UTMPNUM]=39408; main[PASSWORD]=a%2525%253E%257CSbr%2527RZMJ%2502%2560%253DN%255BE%2507O%250BQ%255B%255B';

//oCrawlManager.getDirectPageData('http://nodejs.lofter.com/post/3c14e_48aee', function (data) {
//    console.log(data);
//});
//oCrawlManager.getPageFromPhantom('http://www.so.com/s?ie=utf-8&src=hao_search&shb=1&q=so', 'get', null, null, function (html) {
//    console.log(html);
//});