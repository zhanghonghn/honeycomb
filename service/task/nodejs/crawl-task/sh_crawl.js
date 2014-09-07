/*
* 搜狐聚焦页面抓取 
*/
var TZCrawlModalClass = require('../common/db/tz_crawl_task.js');
var oCrawlTool = require('../common/crawl_data.js');
var _config = require('config');
var oCofing = _config.get('sh_catch_config');
var Iconv = require('iconv-lite');
var cheerio = require("cheerio");
var oUnderscore = require('underscore');
var arrKeyWords = _config.get('keywords');
var oLoginConfig = oCofing.login;
var sLoginCookies = '';
var fs = require('fs');
var oRedis = require('redis');
var redis_client = oRedis.createClient(_config.get('redis').port, _config.get('redis').host, { auth_pass: _config.get('redis').auth_pass });

var oSHParseManager = {
    linkList: [],
    pageIndex: 1,
    pageTotal: 0,
    pageObj: null,
    phantomObj: null,
    formatDate: function (date,format_string) {
        if (!format_string) {
            format_string = "yyyy-MM-dd hh:mm:ss";
        }

        var o = {
            "M+": date.getMonth() + 1, // month
            "d+": date.getDate(), // day
            "h+": date.getHours(), // hour
            "m+": date.getMinutes(), // minute
            "s+": date.getSeconds(), // second
            "q+": Math.floor((date.getMonth() + 3) / 3), // quarter
            "S": date.getMilliseconds() // millisecond
        };

        if (/(y+)/.test(format_string)) {
            format_string = format_string.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
        }

        for (var k in o) {
            if (new RegExp("(" + k + ")").test(format_string)) {
                format_string = format_string.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
            }
        }
        return format_string;
    },
    parseDataToDom: function (html_data) {
        return cheerio.load(html_data);
    },
    getDetailData: function () {

    },
    parseData: function (sData) {
        var iLen = arrKeyWords.length;
        while (iLen--) {
            if (sData.indexOf(arrKeyWords[iLen]) > -1) {
                return true;
            }
        }
        return false;
    },
    pushList: function (oData) {
        var sTitle = oData.attribs['title'];
        var sHerf = '';
        var data = null;

        if (oSHParseManager.parseData(sTitle)) {
            sHerf = oData.attribs['href'];
            data = {
                page_title: oData.children[0].children[0].data.replace('/r/n', ' '),
                page_url: sHerf,
                page_type: 1,
                crawl_time: oSHParseManager.formatDate(new Date, 'yyyy-MM-dd hh:mm:ss'),
                crawl_status: 0,
                board_id: oCofing.board_id,
                post_time: /[0-9]{4}\-[0-9]{2}\-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}/.exec(sTitle)[0]
            }
            new TZCrawlModalClass(data).save();
        }
    },
    spidersData: function (html_data) {
        var $ = oSHParseManager.parseDataToDom(html_data);
        var bbsList = $('.bbsList div[id^="followImg"]>a[title]');
        oUnderscore.each(bbsList, function (obj, index) {
            oSHParseManager.pushList(obj);
        });
        return $;
    },
    getPageUrl: function (iPageIndex) {
        return oCofing.list_page_url + iPageIndex;
    },
    getNextPage: function () {
        var iPageIndex = ++oSHParseManager.pageIndex;
        if (iPageIndex <= oSHParseManager.pageTotal) {
            console.log('正在抓取页面' + iPageIndex + '……');
            this.getPageData(this.getPageUrl(iPageIndex), function (html) {
                oSHParseManager.spidersData(html);
                oSHParseManager.getNextPage();
            });
        } else {
            oSHParseManager.phantomObj.exit();
            oSHParseManager.pageObj = null;
            oSHParseManager.phantomObj = null;
            console.log(oCofing.home.url + '抓取完成，时间' + new Date);
        }
    },
    getPageData: function (url, callback) {
        oCrawlTool.getDirectPageDataFromPhantomWithPage(oSHParseManager.pageObj, oSHParseManager.phantomObj, oCofing.home.url, callback);
    },
    init: function () {
        oCrawlTool.getDirectPageDataFromPhantom(oCofing.home.url, function (html, page, phantom) {
            var $ = oSHParseManager.spidersData(html);
            oSHParseManager.pageObj = page;
            oSHParseManager.phantomObj = phantom;
            oSHParseManager.pageTotal = parseInt($('.page .left em')[0].children[0].data);
            oSHParseManager.getNextPage();
        });
    }
}


oSHParseManager.init();