//链接数据库的模块
//引入mysql模块
let mysql = require('mysql');

//链接数据库
let connection = mysql.createConnection({
  host : 'localhost',
  user : 'root',
  password : 'root',
  database : 'smms'
})

//打开数据库链接
connection.connect();

//暴露模块
module.exports = connection;