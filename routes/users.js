var express = require('express');
var router = express.Router();

//引入MD5加密模块
let md5 = require('crypto');

//引入链接数据库的模块
let connection = require("./mysqlCon");

/* 账号添加路由 */
router.post('/add', function(req, res) {
  //后端接收前端发过来的数据
  let {username,pass,region} = req.body;
  //创建加密实例
//let md5 = crypto.createHash('md5');
//加密明文密码
//md5.update("111111");
//返回16进制加密的密文
//md5.digest('hex')
//对上面几步链式操作
pass = md5.createHash('md5').update(pass).digest('hex')
  //链接数据库，把数据写入数据库
  //let sqlstr = `insert into userTable(username,userPwd,userGroup) values( '${username}','${pass}','${region}')`
  let sqlstr = "insert into userTable(username,userPwd,userGroup) value(?,?,?)";
  let sqlParams = [username,pass,region];
  //执行sql语句
  connection.query(sqlstr,sqlParams,(error,result) => {
    if(error) throw error;
    if(result.affectedRows >= 0){
      res.send({"isok" : true,"message" : "账号添加成功"})
    }else{
      res.send({"isok" : false,"message" : "账号添加失败"})
    }
  })
});

// 获取用户列表的路由
router.get('/list',(req,res) => {
  //构造sql语句，查询数据库中的数据并按id的顺序，倒序排列
  let sqlstr = "select * from usertable order by u_id DESC";
  //执行sql语句
  connection.query(sqlstr,(error,userList) => {
    if(error) throw error;
    res.send(userList)
  })
})

//删除用户的路由
router.get("/del",(req,res) => {
  let id = req.query.id;
  //构造sql语句
  let sqlstr = "delete from usertable where u_id=?";
  let sqlParams = [id];
  //执行sql语句
  connection.query(sqlstr,sqlParams,(error,result) => {
    if(error) throw error;
    if(result.affectedRows > 0){
      res.send({"isOk": true, "msg" : "删除成功"})
    }else{
      res.send({"isOk": true, "msg" : "删除失败"})
    }
  })
})

//获取用户数据的路由
router.get("/getUserData",(req,res) => {
  //接收用户的id
  let id = req.query.id
  //构造sql语句
  let sqlstr = "select * from userTable where u_id=?";
  let sqlParams = [id];
  //执行sql语句
  connection.query(sqlstr,sqlParams,(error,result) => {
    if(error) throw error;
    res.send(result)
  })
})

//接收新的数据并把新数据写入到数据库中的路由
router.post("/save",(req,res) => {
  //接收前端发过来的数据
  let {pass,username,region,oldPwd,u_id} = req.body;
  //就旧密码进行比较，如果不相等，即密码进行过修改，就再次加密
  if(pass != oldPwd){
    pass = md5.createHash('md5').update(pass).digest('hex');
  }
  //定义sql语句
  let sqlStr = "update userTable set userName=?,userPwd=?,userGroup=? where u_id=?";
  let sqlParams = [username,pass,region,u_id]

  // let sqlStr="update userTable set userName=?,userPwd=?,userGroup=? where u_id=?"; //占位符
  // let sqlParams=[username,pass,region,u_id]; //参数数组
  //执行sql语句
  connection.query(sqlStr,sqlParams,(error,result) => {
    if(error) throw error;
    if(result.affectedRows > 0){
      res.send({"isOk" : true, "message" : "账号修改成功"})
    }else{
      res.send({"isOk" : false, "message" : "账号修改失败"})
    }
  })
})

//验证登录的路由
router.post("/checkLogin",(req,res) => {
  //接收前端发过来的数据
  let {username,checkPass} = req.body;
  // //根据前端发过来的数据，到数据库中查询，先构造sql语句
  let sqlStr = "select u_id from userTable where userName=? and userPwd=?";
  // //对发送过来的密码进行加密，因为数据库中的密码都是加密的，否则会查询不到 
  checkPass = md5.createHash('md5').update(checkPass).digest('hex');
  let sqlParams = [username,checkPass];
  //执行sql语句
  connection.query(sqlStr,sqlParams,(error,result) => {
    if(error) throw error;
    if(result.length > 0){
       //登录成功后写入cookie
      res.cookie("username",username);
      res.cookie("u_id",result[0].u_id);
      res.send({isOk: true,"msg" : "登录成功"})   
    }else{
      res.send({isOk: false,"msg" : "用户名或密码错误，请重新登录"})
    }
  }) 
})

//退出登录的路由,并同时销毁cookie
router.get("/signOut",(req,res) => {
  res.clearCookie("username");
  res.clearCookie("u_id");
  res.redirect("/login.html")
})

//验证身份的合法性，有cookie就合法，没有就不合法
router.get("/checkState",(req,res) => {
  //读取cookie
  let username = req.cookies.username;
  if(!username){
    res.send("alert('没有权限，请登录');location.href='login.html';")
  }else{
    res.send("");  //验证成功，也需要返回一个空的字符串，否则路由会一直挂起
  }
})
module.exports = router;
