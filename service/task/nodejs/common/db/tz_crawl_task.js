var oMysqlBaseModel = require('./db_base.js');

var oTZCrawlTaskModal = oMysqlBaseModel.extend({
    tableName: "tz_crawl_task"
});
module.exports = oTZCrawlTaskModal;


//var oMysqlTest = new oTZCrawlTaskModal({
//    page_title: '【嘉宝莉漆杯】2014年装修日记明星大赛之放心涂装\n\n\n\n\n\n',
//    page_url: '/msgview/607/319806546.html',
//    page_type: 1,
//    crawl_time: '1410075767859',
//    crawl_status: 0,
//    board_id: 2
//});
//oMysqlTest.save(function (err, result) {
//    if (err) {
//        console.log(err);
//    } else {
//        console.log(result);
//    }
//});