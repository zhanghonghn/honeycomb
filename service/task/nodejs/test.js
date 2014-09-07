var moment = require('moment');
var oRedis = require('redis');
var _config = require('config');
var redis_client = oRedis.createClient(_config.get('redis').port, _config.get('redis').host, { auth_pass: _config.get('redis').auth_pass });

redis_client.set('test', 'fdasfsadfsadfas', function (err, result) {
    console.log(err + "    " + result);
})