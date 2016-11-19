/**
 * Created by iqianjin-liujiawei on 16/11/11.
 */
var db = require('./dbhelper');

var versionDB = {};

module.exports = versionDB;


versionDB.selectAll = function(appUid,callback){

    var date = new Date().Format("yyyy-MM-dd");
    console.log('日期函数:'+date);

    var sql = "SELECT * FROM version_info WHERE app_uid= '"+appUid+"';";

    db.query(sql,function(err,rows,fields){
        if(err){
            return callback(err)
        }
        callback(undefined,rows);
    });
};

versionDB.insertVersionDB = function(appId,version_name,callback){
    var date = new Date().Format("yyyy-MM-dd");//
    var sql = "INSERT INTO version_info SET app_uid='"+appId+"',version_name='"+version_name+"',created_at='"+date+"';";

    db.query(sql,function(err,rows,fields){
        if(err){
            return callback(err)
        }
        callback(undefined,rows);
    });
};

//日期格式化函数
Date.prototype.Format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate() //日

    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};