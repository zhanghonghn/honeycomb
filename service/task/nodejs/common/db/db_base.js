var oMysqlModel = require('mysql-model');
var oMysqlConfig = require('config').get('mysql_db');

module.exports = oMysqlModel.createConnection(oMysqlConfig);
