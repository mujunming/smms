var express = require('express');
var router = express.Router();


//引入链接数据库的模块
let connection = require("./mysqlCon");

/* 添加商品分类的路由 */
router.post('/add', function(req, res) {
  //后端接收前端发过来的数据
  let {cg_fatherID,cg_name,cg_isLocked} = req.body;
  //把数据写入数据库
  let sqlStr = "insert into categoryGoods(cg_fatherID,cg_name,cg_isLocked) value(?,?,?)";
  let sqlParams = [cg_fatherID,cg_name,cg_isLocked];
  //执行sql语句
  connection.query(sqlStr,sqlParams,(error,result) => {
    if(error) throw error;
    if(result.affectedRows > 0){
      res.send({"isOk" : true,"message" : "商品分类添加成功"})
    }else{
      res.send({"isOk" : false,"message" : "商品分类添加失败"})
    }
  })
});

// 获取商品分类列表的路由
router.get('/list',(req,res) => {
  //构造sql语句，查询数据库中的数据并按id的顺序，倒序排列
  let sqlStr = "select * from categoryGoods order by cg_id DESC";
  //执行sql语句
  connection.query(sqlStr,(error,dataList) => {
    if(error) throw error;
    res.send(dataList)
  })
})

// //删除商品分类的路由
router.get("/del",(req,res) => {
  let cg_id = req.query.cg_id;
  //构造sql语句
  let sqlstr = "delete from categorygoods where cg_id=?";
  let sqlParams = [cg_id];
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

// //获取商品分类数据的路由
router.get("/getListByid",(req,res) => {
  //接收商品分类的id
  let cg_id = req.query.cg_id
  //构造sql语句
  let sqlStr = "select * from categorygoods where cg_id=?";
  let sqlParams = [cg_id];
  //执行sql语句
  connection.query(sqlStr,sqlParams,(error,result) => {
    if(error) throw error;
    res.send(result)
  })
})

// //接收新的数据并把新数据写入到数据库中的路由
router.post("/save",(req,res) => {
  //接收前端发过来的数据
  let {cg_name,cg_fatherID,cg_isLocked,cg_id} = req.body;
 
  //定义sql语句
  let sqlStr = "update categorygoods set cg_name=?,cg_fatherID=?,cg_isLocked=? where cg_id=?";
  let sqlParams = [cg_name,cg_fatherID,cg_isLocked,cg_id]
  //执行sql语句
  connection.query(sqlStr,sqlParams,(error,result) => {
    if(error) throw error;
    if(result.affectedRows > 0){
      res.send({"isOk" : true, "message" : "商品分类修改成功"})
    }else{
      res.send({"isOk" : false, "message" : "商品分类修改失败"})
    }
  })
})

module.exports = router;
