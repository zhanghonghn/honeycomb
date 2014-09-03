/*
* 搜狐聚焦页面抓取 
*/
var TZCrawlModalClass = require('../common/db/tz_crawl_result.js');
var oCrawlTool = require('../common/crawl_data.js');
var oCofing = require('config').get('sh_catch_config');
var Iconv = require('iconv').Iconv;
var oLoginConfig = oCofing.login;
var sLoginCookies = '';
var fs = require('fs');

oCrawlTool.getDirectPageDataFromPhantom(oCofing.home.url, function (html) {
    fs.writeFile('./test.html', html, 'utf-8');
});
