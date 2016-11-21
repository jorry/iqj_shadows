/**
 * Created by iqianjin-liujiawei on 16/11/1.
 */

var db = require('./dbhelper');
function hotPatch() {
    this.version;
}

module.exports = hotPatch;

hotPatch.selectPatchVersion = function (appId, callback) {

    var sql = "SELECT * FROM appHotFix WHERE patch_status = '1'  and app_id='" + appId + "' ORDER BY id ASC;";   // patch_type = 0 表示灰度,patch_status = 1 表示已发布

    db.query(sql, function (err, rows, fields) {
        if (err) {
            return callback(err)
        }
        callback(undefined, rows);
    });
}
hotPatch.getH5HotFix = function (callBack) {


    var sql = "SELECT hotUrl FROM appHotFix ORDER BY id DESC;";

    db.query(sql, function (err, rows, fields) {
        if (err) {
            return callback(err)
        }
        callBack(undefined, rows);
    });
}
// 存储app修复的状态  imei  appState  hotPushType
hotPatch.appHotFixState = function (imei, appState, hotPushType, callBack) {

    var sql = "INSERT INTO iqj_appHotFixState set imei='"+imei+"',appState='"+appState+"',hotPushType='"+hotPushType+"';";

    db.query(sql, function (err, rows, fields) {
        if (err) {
            return callback(err)
        }
        callBack();
    });
}

hotPatch.graySetting = function (callBack) {

    var sql = "SELECT * FROM appHotFix WHERE patch_type = '0' and patch_status = '1';";   // 0 表示灰度,1 表示已发布

    db.query(sql, function (err, rows, fields) {
        if (err) {
            return callback(err)
        }
        callBack(undefined, rows);
    });
}


// 存储单用户行为
hotPatch.insertAB = function (hashCode, atest, btest, description,callBack) {

    var sql = "INSERT INTO absetting (atest,btest,hashCode,description) VALUES ('" + atest + "','" + btest + "','" + hashCode + "','" + description + "')";

    //db.query(sql, function (err, rows, fields) {
    //    if (err) {
    //        return callback(err)
    //    }
    //    callBack();
    //});
}

// 存储单用户行为
hotPatch.addOneUserStep = function (imei, appVersion, osVersion, net, step, callBack) {

    var sql = "INSERT INTO addOneUserStep (imei,appVersion,osVersion,net,step) VALUES ('" + imei + "','" + appVersion + "','" + osVersion + "','" + net + "','" + step + "')";

    db.query(sql, function (err, rows, fields) {
        if (err) {
            return callback(err)
        }
        callBack();
    });
}