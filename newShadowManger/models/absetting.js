/**
 * Created by iqianjin-liujiawei on 16/11/18.
 */
var fs=require('fs');
var querystring=require('querystring');
var db=require('./dbhelper');

function absetting(){
}

module.exports=absetting;



// 根据appUid 和app版本,找到对应的 补丁列表
absetting.insertABsetting = function (appId,appVersion,hotPathFilePatch,hashCode, fileName, fileSize, description, patch_status, patch_type, tags, a,b,callback) {
    db.getConnection(function(err,connection){
        if(err){
            return callback(err);
        }
        var sql;
        connection.beginTransaction(function(err){
            if(err){
                return callback(err);
            }
            sql="SELECT * FROM absetting a LEFT JOIN hotfix b ON b.hashCode = a.hashCode;";
            connection.query(sql,[],function(err,rows){
                if(err){
                    return connection.rollback(function(){
                        callback(err);
                    });
                }

                if (rows.length == 0){
                    return callback(-1);
                }
                var patchVersion ;
                sql = "SELECT id,patch_type,patch_status FROM hotFix GROUP BY id DESC";
                connection.query(sql,[],function(err,rows){
                    if (err){
                        return connection.rollback(function () {
                            callback(err);
                        });
                    }
                    rows.forEach(function(row){
                        console.log(patch_type+'---row.patch_type---'+row.patch_type)
                        if (row.patch_type == 1000){
                            return callback('只能存在一个全量更新的版本,请把多余的删除');
                        }
                    });
                    if (rows.length == 0){
                        patchVersion = 1;
                    }else{
                        patchVersion = rows[0].id+1;
                    }
                    var iqianjin = 'iqianjin';

                    var date = new Date().Format("yyyy-MM-dd");
                    sql = "INSERT INTO hotFix SET app_id ='"+appId+"',version_name='"+iqianjin+"',hashCode='"+hashCode+"',appVersion='"+appVersion+"',patch_size='"+fileSize+"',file_hash='"+fileName+"',create_date='"+date+"',description='"+description+"',hotUrl='"+hotPathFilePatch+"',patch_status='"+patch_status+"',patch_type='"+patch_type+"',tags='"+tags+"',patchVersion='"+patchVersion+"';";

                    console.log(sql);

                    connection.query(sql, [], function (err) {
                        if (err) {
                            return connection.rollback(function () {
                                callback(err);
                            });
                        }
                        connection.commit(function (err) {

                            if (err) {
                                return connection.rollback(function () {
                                    callback(err);
                                });
                            }
                            connection.end();
                            callback();

                        });
                    });
                })
            });
        });
    });
};