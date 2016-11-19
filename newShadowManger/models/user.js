/**
 * Created by iqianjin-liujiawei on 16/11/18.
 */
var fs=require('fs');
var querystring=require('querystring');
var db=require('./dbhelper');

function User(){
    this.readerId;
    this.password;
}

module.exports=User;

//根据证件号查找用户
User.findUserByreaderId=function(readerId, callback){
    var sql="SELECT * FROM user WHERE username ='"+readerId+"';";
    db.query(sql,function(err,rows,fields){
        if(err){
            return callback(err);
        }
        //rows是一个对象数组
        callback(err,rows[0]);
    });
};
