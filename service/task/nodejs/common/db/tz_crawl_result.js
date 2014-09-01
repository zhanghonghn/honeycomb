var oMysqlBaseModel = require('./db_base.js');

var oTZCrawlModal = oMysqlBaseModel.extend({
    tableName: "tz_crawl_result"
});
module.exports = oTZCrawlModal;

/*
var oMysqlTest = new oTZCrawlModal({
    board_id: '1',
    page_type: '2',
    page_url: '1',
    crawl_time: '1',
    crawl_status: '1',
    parse_status: '1',
    crawled_file_path: '1'
});
oMysqlTest.save(function (err, result) {
    if (err) {
        console.log(err);
    } else {
        console.log(result);    
    }
});*/