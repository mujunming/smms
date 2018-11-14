var express = require('express');
var router = express.Router();


//引入链接数据库的模块
let connection = require("./mysqlCon");

/* 添加商品的路由 */
router.post('/add', function (req, res) {
  //后端接收前端发过来的数据
  let {
    cg_id,
    barcode,
    goodsname,
    goodsprice,
    marketprice,
    saleprice,
    stockNum,
    weigth,
    unit,
    promotion,
    discount,
    goodsDetails
  } = req.body;

  //链接数据库，把数据库写入数据库
  //定义sql语句
  let sqlStr = "insert into goodsTable(cg_id,barcode,goodsname,goodsprice,marketprice,saleprice,stockNum,weigth,unit,promotion,discount,goodsDetails) values(?,?,?,?,?,?,?,?,?,?,?,?)"; //占位符
  let sqlParams = [cg_id, barcode, goodsname, goodsprice, marketprice, saleprice, stockNum, weigth, unit, promotion, discount, goodsDetails]; //参数数组
  connection.query(sqlStr, sqlParams, (error, result) => {
    if (error) throw error;
    if (result.affectedRows > 0) {
      res.send({
        "isOk": true,
        "message": "商品添加成功"
      })
    } else {
      res.send({
        "isOk": false,
        "message": "商品添加失败"
      })
    }
  })
});

//获取商品列表的路由(跟下面分数数据路由合并了)
router.get('/list',(req,res) => {
  //构造sql语句，查询数据库中的数据并按id的顺序，倒序排列
  let sqlStr="select t1.*,t2.cg_name from goodsTable as t1 left join categorygoods as t2 on t1.cg_id=t2.cg_id";
  //执行sql语句
  connection.query(sqlStr,(error,dataList) => {
    if(error) throw error;
    res.send(dataList)
  })
})

//获取商品分页加查询合并数据的路由
router.get('/listPagerSearch', (req, res) => {
  //接收页码，每页大小，分类，关键词
  let {
    currentPage,
    pageSize,
    category,
    keywords
  } = req.query;
  //构造sql语句，查询数据库中的数据并按id的顺序，倒序排列
  let sqlStr = "select t1.*,t2.cg_name from goodsTable as t1 left join categorygoods as t2 on t1.cg_id=t2.cg_id where 1=1";
  //执行sql语句,全表查询，获取总的数据条数和值
  connection.query(sqlStr, (error, goodsList) => {
    if (error) throw error;
    //定义一个变量保存总条数
    let total = goodsList.length;

    //以下为查询部分
    if (keywords.length > 0) {
      sqlStr += ` and (t1.barcode like '%${keywords}%' or t1.goodsname like '%${keywords}%')`;
      //sqlStr+=` and (t1.barcode like '%${keywords}%' or t1.goodsname like '%${keywords}%')`;
    }
    //分类sql语句拼接
    if (category.length > 0) {
      sqlStr += ` and t1.cg_id = ${category}`;
    }
    //执行sql语句
    if (keywords.length > 0 || category.length > 0) {
      connection.query(sqlStr, (error, searchList) => {
        if (error) throw error;
        //修改原来的总记录数为查询出来的记录条数
        total = searchList.length;
      })
    }
    //以下为分页部分
    //定义分页参数数组,前面一个值为跳过的条数，当前页码数减1，乘以每页要显示的大小，就是要跳过的条数
    let sqlParams = [(currentPage - 1) * pageSize, parseInt(pageSize)]
    sqlStr += " limit ?,?";

    //再次执行查询，获取当前页码应该显示的数据
    connection.query(sqlStr, sqlParams, (error, goodsPager) => {
      if (error) throw error;
      //向前端返回得到的数据的长度和值
      res.send({
        "total": total,
        "dataList": goodsPager
      })
    })

  })
})






// router.get("/listPagerSearch",(req,res)=>{
//   //接收页码\每页大小\关键词\分类id
//   let {currentPage,pageSize,keywords,category}=req.query;
  
//   //构造sql
//   let sqlStr="select t1.*,t2.cg_name from goodsTable as t1 left join categorygoods as t2 on t1.cg_id=t2.cg_id where 1=1";

//   //----------------------------------全表----------------------------------------
//   //执行全表sql查询：获取总的记录条数
//   connection.query(sqlStr,(err,goodsList)=>{
//      if(err) throw err;
//      let total=goodsList.length; //总条数
//     //----------------------------------查询----------------------------------------
//     //关键词
//     if(keywords.length>0){
//       sqlStr+=` and (t1.barcode like '%${keywords}%' or t1.goodsname like '%${keywords}%')`;
//     }
//     //分类
//     if(category.length>0){
//       sqlStr+=` and cg_id=${category}`;
//     }

//     //执行查询的sql结果
//     if(keywords.length>0 || category.length>0){
//       connection.query(sqlStr,(err,searchList)=>{
//           if(err) throw err;
//           //res.send(searchList); //查询的结果
//           //修改原来的总记录为查询后的记录数
//           total=searchList.length;
//       });
//     }
//      //----------------------------------分页----------------------------------------
//      //定义分页参数数组
//      let skip=(currentPage - 1)*pageSize; //跳过的条数
//      let sqlParams=[skip,parseInt(pageSize)];
//      sqlStr+=" limit ?,?";

//      //执行查询当前页码应该显示的分页数据
//      connection.query(sqlStr,sqlParams,(err,goodsPager)=>{
//         if(err) throw err;
//         res.send({"total":total,"datalist":goodsPager});
//      });
//   });
// });

// 根据查询的关键词和分类返回结果的路由(跟上面获取商品分页数据的理由合并)
// router.get('/listSearch',(req,res) => {

//   //构造sql语句，查询数据库中的数据并按id的顺序，倒序排列
//   let sqlStr="select t1.*,t2.cg_name from goodsTable as t1 left join categorygoods as t2 on t1.cg_id=t2.cg_id where 1=1";
//   //接收关键词和分类
//   let {category,keywords} = req.query
//   //判断，如果分类和关键词没有选择就执行上面的全表查询，如果有（长度大于0），则拼接下面的sql语句然后执行
//   //关键词的sql语句拼接
//   if(keywords.length > 0){
//     sqlStr+=` and (t1.barcode like '%${keywords}%' or t1.goodsname like '%${keywords}%')`;
//     //sqlStr+=` and (t1.barcode like '%${keywords}%' or t1.goodsname like '%${keywords}%')`;
//   }
//   //分类sql语句拼接
//   if(category.length > 0){
//     sqlStr+=`and cg_id = ${category}`;
//   }
//   //执行sql语句
//   connection.query(sqlStr,(error,dataList) => {
//     if(error) throw error;
//     res.send(dataList)  //将查询的结果返回的前端
//   })
// })


// //删除商品的路由
router.get("/del", (req, res) => {
  let cg_id = req.query.cg_id;
  //构造sql语句
  let sqlstr = "delete from categorygoods where cg_id=?";
  let sqlParams = [cg_id];
  //执行sql语句
  connection.query(sqlstr, sqlParams, (error, result) => {
    if (error) throw error;
    if (result.affectedRows > 0) {
      res.send({
        "isOk": true,
        "msg": "删除成功"
      })
    } else {
      res.send({
        "isOk": true,
        "msg": "删除失败"
      })
    }
  })
})

// //获取商品数据的路由
router.get("/getListByid", (req, res) => {
  //接收商品分类的id
  let cg_id = req.query.cg_id
  //构造sql语句
  let sqlStr = "select * from categorygoods where cg_id=?";
  //let sqlStr = "SELECT t1.*,t2.cg_name as father_name FROM categorygoods as t1 LEFT JOIN categorygoods as t2 on t1.cg_fatherID=t2.cg_id;";
  let sqlParams = [cg_id];
  //执行sql语句
  connection.query(sqlStr, sqlParams, (error, result) => {
    if (error) throw error;
    res.send(result)
  })
})

// //接收新的数据并把新数据写入到数据库中的路由
router.post("/save", (req, res) => {
  //接收前端发过来的数据
  let {
    cg_name,
    cg_fatherID,
    cg_isLocked,
    cg_id
  } = req.body;

  //定义sql语句
  let sqlStr = "update categorygoods set cg_name=?,cg_fatherID=?,cg_isLocked=? where cg_id=?";
  let sqlParams = [cg_name, cg_fatherID, cg_isLocked, cg_id]
  //执行sql语句
  connection.query(sqlStr, sqlParams, (error, result) => {
    if (error) throw error;
    if (result.affectedRows > 0) {
      res.send({
        "isOk": true,
        "message": "商品分类修改成功"
      })
    } else {
      res.send({
        "isOk": false,
        "message": "商品分类修改失败"
      })
    }
  })
})

module.exports = router;