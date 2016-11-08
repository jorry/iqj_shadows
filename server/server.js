var express = require('express');
var app = express();
var fs = require("fs");

var bodyParser = require('body-parser');

var dbHelper = require('./models/serverDBhelper');

var user = {
    "user4": {
        "name": "jorry",
        "password": "password4",
        "profession": "teacher",
        "id": 4
    }
}

var hotPatch = {
    code: "",
    msg: "",
    "hotPatch": {
        pathchUrl: "",
        appState: "",
        code: "1",
        msg: "OK"
    }
}

var response = function () {
    this.code;
    this.msg;
}


// appVersion 版本
// 本地要存储一份 补丁的hashCode(也可以是版本号)，
// 如果补丁为空，走补丁流程，如果不为空，先要验证是否为需要回滚的版本，如果需要则回滚；不需要，进行其他补丁检测
// 
app.get('/getHotPatch', function (req, res) {
    var appVersion = req.query.appVersion;
    console.log(appVersion);

    dbHelper.selectPatchVersion(function (err, result) {
        if (err) {
            var obj = new response();
            obj.code = -3;
            obj.msg = "DB err";
            return res.end(JSON.stringify(obj));
        }
        if (!result) {
            var obj = new response();
            obj.code = -1;
            obj.msg = "err";
            return res.end(JSON.stringify(obj));
        }
        console.log(result.appVersion +'hotfixType = ' + result.hotfixType)
        if (result.hotfixType == 2) {  //1 = 全量修复;2 = 根据版本修复
            if (result.appVersion == appVersion) {
                result.code = 1;
                result.msg = 'ok';
                return res.end(JSON.stringify(result));
            } else {
                var obj = new response();
                obj.code = -2;
                obj.msg = "err";
                return res.end(JSON.stringify(obj));
            }
        }
        result.code = 1;
        result.msg = 'ok';
        return res.end(JSON.stringify(result));
        console.log('进入到hotFix 数据库查询后,返回的app 的内容是: result= ' + result + " / err = " + err);
    })


})


app.get('/appHotFixState', function (req, res) {
    var imei = req.query.imei;
    var appState = req.query.appState;
    var hotPushType = req.query.hotPushType;

    console.log('imei = ' + imei);

    dbHelper.appHotFixState(imei, appState, hotPushType, function (err) {
        if (err) {
            var obj = new response();
            obj.code = -3;
            obj.msg = "DB err";
            return res.end(JSON.stringify(obj));
        }
        var obj = new response();
        obj.code = 1;
        obj.msg = 'ok';
        return res.end(JSON.stringify(obj));
    })

});

/**
 * 用户单用户行为上传
 */
app.get('/addOneUserStep', function (req, res) {
    var imei = req.query.imei;
    var appVersion = req.query.appVersion;
    var osVersion = req.query.osVersion;
    var net = req.query.net;
    var step = req.query.step;

    console.log('addOneUserStep = ');

    dbHelper.addOneUserStep(imei,appVersion,osVersion,net,step,function(err){
       if (err){
           var obj = new response();
           obj.code = -3;
           obj.msg = "DB err";
           return res.send(JSON.stringify(obj));
       }
        var obj = new response();
        obj.code = 1;
        obj.msg = 'ok';

        return res.end(JSON.stringify(obj));
    });
});

app.get('/graySetting', function (req, res) {

    var us = req.query.us; //渠道
    var appVersion = req.query.appVersion;

    dbHelper.graySetting(us, appVersion, function (err, result) {
        console.log('graySetting--1'+err);

        if (err) {
            console.log('graySetting--1.1'+err);
            var obj = new response();
            obj.code = -3;
            obj.msg = "DB err";
            return res.send(JSON.stringify(obj));
        }

        if(result.length == 0){
            var obj = new response();
            obj.code = 0;
            obj.msg = "no data";
            return res.send(JSON.stringify(obj));
        }


        result.forEach(function (row) {
            console.log(row.appVersion+"appVersion = "+appVersion);
            console.log(row.us+"us = "+us);
            if (row.us == us && row.appVersion == appVersion) {
                result.code = 1;
                result.msg = 'ok';
                return res.send(JSON.stringify(result));
            }else{
                var obj = new response();
                obj.code = -1;
                obj.msg = "";
                return res.send(JSON.stringify(obj));
            }
        });

    });

});



app.get('/listUsers', function (req, res) {
    fs.readFile(__dirname + "/" + "users.json", 'utf8', function (err, data) {
        console.log(data);
        res.end(data);
    });
})

var server = app.listen(8081, function () {
    var host = server.address().address
    var port = server.address().port
    console.log("Example app listening at http://%s:%s", host, port)
})