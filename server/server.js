var express = require('express');
var app = express();
var fs = require("fs");

var bodyParser = require('body-parser');

var dbHelper = require('./models/serverDBhelper');


var response = function () {
    this.code;
    this.msg;
};

function responseHotPatch(res,hotFix,status){
    if(status == 404){
        var obj = new response();
        obj.code = -1;
        obj.msg = "没有新补丁";
        return res.send(JSON.stringify(obj));
    }else {
        hotFix.code = 1;
        hotFix.msg = 'ok';
        return res.end(JSON.stringify(hotFix));
    }
}

function callBackDBErro(){
    var obj = new response();
    obj.code = -3;
    obj.msg = "DB err";
    return res.end(JSON.stringify(obj));
}

// appVersion 版本
// 本地要存储一份 补丁的hashCode(也可以是版本号)，
// 如果补丁为空，走补丁流程，如果不为空，先要验证是否为需要回滚的版本，如果需要则回滚；不需要，进行其他补丁检测
// 
app.get('/getHotPatch', function (req, res) {
    var appId = req.query.appId;
    var appVersion = req.query.appVersion;
    var patchVersion = req.query.patchVersion;

    var tags = req.query.tags;

    dbHelper.selectPatchVersion(appId,function (err, results) {
        if (err) {
           return callBackDBErro();
        }
        if (!results) {
            var obj = new response();
            obj.code = -1;
            obj.msg = "err";
            return res.end(JSON.stringify(obj));
        }


        var isHaveGray = false;
        var hotFix;
        console.log('size = '+results.length)

        //for(var i = 0;i < results.length;i ++){
        //    var result = results[i];
        //    if (tags && result.patchVersion > patchVersion && result.patch_type == 5 && result.patch_status == 1){
        //
        //    }
        //}

        results.forEach(function(result){
            if(result.patch_type == 6 && result.patch_status == 1 && result.patchVersion > patchVersion){  //全量更新
                isHaveGray = true;
                console.log('all');
                hotFix = result;
            }else  if(result.patch_type == 5 && result.patch_status == 1 && result.patchVersion > patchVersion){  //h5
                isHaveGray = true;
                console.log('gray');
                hotFix = result;

            }else  if(result.patch_type == 1 && result.patch_status == 1 && result.patchVersion > patchVersion){  //灰度
                isHaveGray = true;
                console.log('version');
                hotFix = result;

            }else  if(tags == 77 && result.patch_type == 0 && result.patch_status == 1 && result.patchVersion > patchVersion){  //灰度
                isHaveGray = true;
                console.log('gray');
                hotFix = result;

            }
        })

        console.log('hotFix = '+hotFix);

        if (hotFix){
            return responseHotPatch(res,hotFix,200)
        }else{
            return responseHotPatch(res,hotFix,404)
        }


    });


});

app.get('/appH5HotFix',function(req,res){
    var patchVersion = req.query.patchVersion;

    dbHelper.getH5HotFix(function(err,rows){
        if (err){
            var obj = new response();
            obj.code = -3;
            obj.msg = "DB err";
            return res.end(JSON.stringify(obj));
        }
        rows.forEach(function(row){
            console.log('-----appH5Hotfix'+row.hotUrl);
           if (patchVersion < row){
               row.code = 1;
               row.msg = 'ok';
               return res.end(JSON.stringify(row));
           }
        });
    });
});


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

//获取灰度测试接口
app.get('/graySetting', function (req, res) {
// /graySetting/?us=77;

    var appVersion = req.query.appVersion;

    var us = req.query.us;

    dbHelper.graySetting(function (err, result) {
        console.log('graySetting--1'+err);

        if (err) {
            console.log('graySetting--1.1'+err);
            var obj = new response();
            obj.code = -3;
            obj.msg = "DB err";
            return res.send(JSON.stringify(obj));
        }

        var isHaveGray = false;
        var hotFix;
        result.forEach(function (row) {
            console.log(row.appVersion+"......appVersion......"+appVersion);
            console.log(row.us+"......appVersion......"+us);
            if (row.appVersion > appVersion) {
                isHaveGray = true;
                hotFix = row;
            }else{
               isHaveGray = false;
            }
        });

        if (isHaveGray){
            result.code = 1;
            result.msg = 'ok';
            console.log(isHaveGray+'灰度接口 返回:'+result.hotUrl);
            return res.send(JSON.stringify(result));

        }else{
            var obj = new response();
            obj.code = -1;
            obj.msg = "没有新补丁";
            return res.send(JSON.stringify(obj));
        }

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