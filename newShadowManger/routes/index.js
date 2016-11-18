var express = require('express');
//引入multer模块
var multer = require('multer');

var crypto = require('crypto');//hashCode


var router = express.Router();
var path = require('path');

var hotFix = require('../models/hotFix');

var hotDB = require("../models/hotDB");

var AppUtil = require('../models/AppIdUtil');

var appInfoDB = require("../models/appInfoDB");

var User = require("../models/user");

var appVersionInfo = require('../models/versionDB');

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var fs = require("fs");


var createFolder = function (folder) {
    try {
        fs.accessSync(folder);
    } catch (e) {
        fs.mkdirSync(folder);
    }
    ;
}

//生成一个文件,但是没有后缀
var uploadFolder = '/Users/iqianjin-liujiawei/Desktop/shadowsManger/git/myFileServer/http-server';

//createFolder(uploadFolder);
//
//var upload = multer({dest: uploadFolder});


//指定apk名字
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadFolder);    // 保存的路径，备注：需要自己创建
    },
    filename: function (req, file, cb) {
        // 将保存文件名设置为 字段名 + 时间戳，比如 logo-1478521468943
        console.log('---' + file.filename);
        console.log('---' + file);

        cb(null, file.originalname);
    }
});

// 通过 storage 选项来对 上传行为 进行定制化
var upload = multer({storage: storage})


/* GET home page. */
router.get('/', function (req, res, nnext) {
    res.redirect('/login');
});

//更新补丁状态
router.get('/updatePatchStatus', ensureAuthenticated,function (req, res, next) {
    var hashCode = req.query.hashCode;
    var update = req.query.update;
    console.log(hashCode + "   " + update);
    console.log(update + 'publicManagerModel - hashCode = ' + hashCode);


    hotDB.managerHotFix(update, hashCode, function (err) {
        if (err) {
            return next(err);
        }
        var message = "";
        if (update == 0) {
            message = "删除补丁完成";
        } else if (update == 1) {
            message = "灰度补丁已发布";
        } else if (update == 2) {
            message = "已进行全量更新";
        } else if (update == 3) {
            message = "已停止灰度发布";
        } else if (update == 4) {
            message = "已停止全量发布";
        }
        res.end();
    });

});

var response = function () {
    this.code;
    this.msg;
};

router.get('/createVersion', ensureAuthenticated,function (req, res, next) {

    var appVersion = req.query.appUid;

    var versionName = req.query.versionName;

    appVersionInfo.insertVersionDB(appVersion, versionName, function (err) {  //TODO versionName.replace('.', '').replace('.', '')
        if (err) {
            var resonose = new response();
            resonose.code = 201;
            resonose.msg = '创建失败,可能存在相同的版本';
            res.end(JSON.stringify(resonose));

            //replacees.render('publicManagermodel', {
            //    title: '创建app版本',
            //    message: err
            //});
            return;
        } else {
            var resonose = new response();
            resonose.code = 200;
            res.send(JSON.stringify(resonose));
            //res.render('appDetail', {
            //    appUid: appVersion,
            //    message: versionName
            //});
        }
    });
});

//补丁上传
//注意上传界面中的 <input type="file" name="avatar"/>中的name必须是下面代码中指定的名称
router.post('/singleUpload', upload.single('file'), function (req, res, next) {

    var file = req.file;

    var hotPathFilePatch = uploadFolder + '/' + file.originalname;
    console.log('文件地址:' + hotPathFilePatch)

    var rs = fs.createReadStream(hotPathFilePatch);

    var hash = crypto.createHash('md5');
    rs.on('data', hash.update.bind(hash));

    rs.on('end', function () {
        var hashCode = hash.digest('hex');


        var hashCode = hashCode;
        var fileSize = file.size;
        var fileName = file.originalname;

        var description = req.body.description;
        var patch_type = req.body.patch_type;
        var appVersion;
        var appUid;

        var a,b;

        var abTestting = false;
        if (patch_type == 0) {
            var tempVersion = req.body.gray_appVersion;
            appVersion = tempVersion.substr(0, tempVersion.length - 1);
            var tempUid = req.body.gray_appUid;
            appUid = tempUid.substr(0, tempUid.length);
        } else if (patch_type == 1) {
            var tempVersion = req.body.appVersion;
            appVersion = tempVersion.substr(0, tempVersion.length - 1);
            var tempUid = req.body.appUid;
            appUid = tempUid.substr(0, tempUid.length);
        } else if (patch_type == 5) {    //修复H5 引擎
            console.log('-----patch_type == 1000 = ');
            appVersion = '1000';
            appUid = req.body.appUid;
        } else if (patch_type == 6) {    //全量更新
            console.log('-----patch_type == 6 = ')
            appVersion = '1000';
            appUid = req.body.gray_appUid;
        } else if (patch_type == 7) {    // A/B TESTTING
            console.log('-----patch_type == 1000 = ')
            appVersion = '1001';
            appUid = req.body.appUid;
            a = req.body.aTest;
            b = req.body.bTest;
            abTestting =true;
            console.log(a+"  patch_type == 7  "+b)
        } else if (patch_type == 1000) {    //全量更新
            console.log('-----patch_type == 1000 = ')
            appVersion = '1000';
            appUid = req.body.appUid;
        }

        var patch_status = 0;
        var tags = req.body.tags;

        console.log('appVersion========' + appVersion + '//////////appUid ======== ' + appUid);
        if (abTestting){
            var abtestting = a+'/'+b;
            hotDB.saveABsetting(appUid, appVersion, fileName, hashCode, fileName, fileSize, description, patch_status, patch_type, tags, abtestting,function (err) {
                console.log('err' + err);
                if (err) {
                    return next(err);
                }
                res.redirect('/appDetail?appUid=' + appUid);
            });
        }else{
            hotDB.save(appUid, appVersion, fileName, hashCode, fileName, fileSize, description, patch_status, patch_type, tags, function (err) {
                console.log('err' + err);
                if (err) {
                    return next(err);
                }
                res.redirect('/appDetail?appUid=' + appUid);
            });
        }




        console.log(req.file);
        console.log(req.body);

    });


});

router.get('/hotfixAddDB', function (req, res, next) {
    res.render('revert_return', {
        title: '添加补丁完成',
        message: '请在补丁管理界面进行发布'
    });
})

//灰度设置提交调用,先更新灰度数据库,然后在更新总数据库(在代码回滚界面用到此数据库)
router.post('/graySettingPost',ensureAuthenticated, function (req, res, nnext) {
    var us = req.body.value;
    var hashCode = '123';
    var hotFixType = 3;
    console.log('-----revert_return');
    hotFix.graySetting(hashCode, '5.0.0', hotFixType, us, function (err) {
        console.log('errr' + err)
        if (err) {
            res.render('revert_return', {
                title: '灰度功能测试',
                message: err
            });
            return;
        }

        hotFix.addSaveHot(hashCode, hotFixType, 1, function (err, result) {
            console.log('addSaveHot', err);
            console.log('addSaveHot', result);
        });

        res.render('revert_return', {
            title: '已发布',
            message: '发布完成'
        });
    });


});

router.get('/hotfixEngine', ensureAuthenticated,function (req, res, next) {

    res.render('hotfixEngine', {
        title: '修复H5交互引擎',
        appUid: req.query.appId
    });
});


router.get('/hotfixResult', ensureAuthenticated,function (req, res, next) {

    res.render('hotfixResult', {
        title: '补丁完成查看'
    });
});

function addSaveHot(hashCode, hotFixType, revert) {
    hotFix.addSaveHot(hashCode, hotFixType, revert, function (err, result) {
        console.log('addSaveHot', err);
        console.log('addSaveHot', result);
    });
}

router.get('/hotfixUploadFinish', ensureAuthenticated,function (req, res, next) {
    addSaveHot('10002', 1, 1)
    console.log('----hotfixUploadFinish--跳转,进来了吗');


    res.render('hotfixUploadFinish', {
        title: '热修复发布完成'
    });
});

router.get('/login', function (req, res, next) {
    res.render('login', {
        title: '登录'
    });
});


//提交登录请求
router.post('/login', function (req, res, next) {
    var referer = req.body.referer;
    passport.authenticate('local', function (err, user, info) {
        console.log("login", 1)
        if (err) {
            return next(err);
        }
        console.log("login", user, 2);
        if (!user) {
            req.flash('error_msg', info.message);
            return res.redirect('/login');
        }
        console.log("login", user, 3);
        req.logIn(user, function (err) {//这里内部会调用passport.serializeUser()
            console.log("login", user, 4)
            if (err) {
                return next(err);
            }
            console.log("login", user, 5, referer)
            req.flash('success_msg', '登录成功...');
            if (referer != 'http://localhost:3001/login') {
                console.log("login", user, 6)
                return res.redirect('/app_list');
            }
            console.log("login", user, 7)
            return res.redirect('/app_list');
        });
    })(req, res, next);
});

passport.use(new LocalStrategy(
    function (username, password, done) {//username即数据库表中的readerId
        User.findUserByreaderId(username, function (err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                return done(null, false, {message: '找不到用户名'});
            }
            if (user.password != password) {
                return done(null, false, {message: '密码匹配有误!'});
            }
            return done(null, user);
        });
    })
);

// serializeUser 在用户登录验证成功以后将会把用户的数据存储到 session 中（在这里
// 存到 session 中的是用户的 username）。在这里的 user 应为我们之前在 new
// LocalStrategy (fution() { ... }) 中传递到回调函数 done 的参数 user 对象（从数据// 库中获取到的）
passport.serializeUser(function (user, done) {

    done(null, user.username);
});

// deserializeUser 在每次请求的时候将会根据用户名读取 从 session 中读取用户的全部数据
// 的对象，并将其封装到 req.user
passport.deserializeUser(function (username, done) {
    User.findUserByreaderId(username, function (err, user) {
        done(err, user);
    });
});

router.get('/grayUserSetting',ensureAuthenticated, function (req, res, next) {
    console.log('----grayUserSetting--跳转,进来了吗');
    res.render('grayUserSetting', {
        title: '灰度设置'
    });
});


router.get('/absetting',ensureAuthenticated, function (req, res, next) {


    var appId = req.query.appId;

    console.log('----abSetting--跳转,进来了吗'+appId);

    appVersionInfo.selectAll(appId,function(err,rows){

        if (err) {
            console.error(err);
            return next(err);
        }

        console.log('----abSetting--长度  '+rows.length);

        res.render('abSetting', {
            title: '设置a/b用户',
            appUid:appId,
            abrows:rows
        });
    });




});


router.get('/appDetail', ensureAuthenticated,function (req, res, next) {

    var appUid = req.query.appUid;

    appVersionInfo.selectAll(appUid, function (err, rows) {
        if (err) {
            console.error(err);
            return next(err);
        }
        var versionArray = rows;
        versionArray.forEach(function (row) {
            console.log('日期='+row.created_at);
        });
        console.log('appId = ' + appUid)



        appInfoDB.getAppDetail(appUid, function (err, row) {
            console.log('appName = ' + row.appName);
            if (row.length == 1) {
                res.render('appDetail', {
                    title: 'appDetail',
                    app: row[0],
                    message: row[0].appName,
                    versionArray: versionArray
                });
            } else {
                console.log(appUid + "没有找到对应的app");
            }

        });
    });


});



router.get('/setABTestting',ensureAuthenticated, function (req, res, next) {
    var A = req.query.a;
    var B = req.query.b;

    var patch_type = 7;
    appInfoDB.insertAppInfo(appName, des, uid, platform, function (err) {
        if (err) {
            console.error(err);
            return next(err);
        }
        res.statusCode = 200;
        res.send();
    });
});


router.get('/createApp',ensureAuthenticated, function (req, res, next) {

    var appName = req.query.appname;
    var des = req.query.description;
    var platform = 'Android';
    var uid = AppUtil.appUid();

    console.log(uid);


    appInfoDB.insertAppInfo(appName, des, uid, platform, function (err) {
        if (err) {
            console.error(err);
            return next(err);
        }
        res.statusCode = 200;
        res.send();
    });
});

router.get('/patchManager', ensureAuthenticated,function (req, res, next) {

    var appVersion = req.query.versionName;
    var appUid = req.query.appVersion;

    console.log(appUid + "  index " + appVersion);

    var rand1 = Math.floor(Math.random() * 10 + 1);

    console.log("rand1 = " + rand1);
    hotFix.patchManager(appUid, appVersion, function (err, rows) {

        console.log('JSON', 'json = ' + rows);

        rows.forEach(function (row) {
            if (row.patch_type == 1) {
                row.patch_type = '版本更新';
            } else if (row.patch_type == 0) {
                row.patch_type = '灰度更新';
            } else if (row.patch_type == 4) {
                row.patch_type = '修复h5引擎';
            }

            if (row.patch_status == 0) {
                row.patch_status = '未发布';
            } else if (row.patch_status == 1) {
                row.patch_status = '已发布';
            }

        });

        res.render('index', {
            title: 'index',
            rows: rows,
            appUid: appUid,
            appVersion: appVersion

        });
    });

});

//app 全量更新通道
router.get('/emergency',ensureAuthenticated, function (req, res, next) {
    hotFix.getHotFixRowsEmergency(function (err, rows) {

        console.log('JSON', 'json = ' + rows);

        rows.forEach(function (row) {
            if (row.patch_type == 6) {
                row.patch_type = '修复h5引擎';
            } else if (row.patch_type == 5) {
                row.patch_type = '运营活动';
            } else if (row.patch_type == 7) {
                row.patch_type = 'A/B testting';
            }

            if (row.patch_status == 0) {
                row.patch_status = '未发布';
            } else if (row.patch_status == 1) {
                row.patch_status = '已发布';
            }

        });

        res.render('emergency', {
            title: '123',
            rows: rows,
            appUid: req.query.appId
        });
    });
});

////补丁列表
//router.get('/index', function (req, res, next) {
//
//
//    var rand1 = Math.floor(Math.random() * 10 + 1);
//    hotFix.getHotFixRows(function (err, rows) {
//
//        console.log('JSON', 'json = ' + rows);
//
//        rows.forEach(function (row) {
//            if (row.patch_type == 1) {
//                row.patch_type = '版本更新';
//            } else if (row.patch_type == 0) {
//                row.patch_type = '灰度更新';
//            } else if (row.patch_type == 4) {
//                row.patch_type = '修复h5引擎';
//            }
//
//            if (row.patch_status == 0) {
//                row.patch_status = '未发布';
//            } else if (row.patch_status == 1) {
//                row.patch_status = '已发布';
//            }
//
//        });
//
//        res.render('index', {
//            title: '123',
//            rows: rows
//        });
//    });
//
//});

router.get('/app_list', ensureAuthenticated, function (req, res, next) {

    console.log('----app_list--跳转,进来了吗');

    appInfoDB.selectAll(function (err, rows) {
        if (err) {
            return next(err);
        }
        console.log('----应用列表 ' + rows);
        res.render('app_list', {
            title: 'app应用列表',
            arr: [{sch: 'app_list', ab: 'abs', lib: '', abt: '', log: '', log: ''}],
            rows: rows
        });
    });
});


router.get('/app', function (req, res, next) {

    console.log('----app_list--跳转,进来了吗');
    res.render('app', {
        title: 'app应用列表',
    });
});


// 补丁详情,用于补丁的发布操作
router.get('/patch', function (req, res, next) {
    var hashCode = req.query.hashCode;
    var appId = req.query.appId;
    console.log(appId+'hashCode = ' + hashCode);
    hotDB.getHotFixRow(hashCode, function (err, row) {
        if (err) {
            return next(err);
        }
        if (!row) {
            return next('没有找到相关数据');
        }

        var status = row.patch_status;

        console.log(row.patch_status + 'row = ' + row.patch_type);

        if (status == 0) {   //未发布
            status = 'status';
        } else {
            status = '';
        }

        var type = row.patch_type;


        if (type == 0) {    //灰度
            type = '';
        } else {
            type = 'type';
        }// 灰度

        console.log(status + 'type = ' + type);

        res.render('patch', {
            title: '发布补丁',
            status: status,
            type: type,
            row: row
        });
    })

});


// 补丁详情,用于补丁的发布操作
router.post('/publicManagerModel', function (req, res, next) {


    var hashCode = req.body.hashCode;
    var update = req.body.update;

    console.log(update + 'publicManagerModel - hashCode = ' + hashCode);


    hotDB.managerHotFix(update, hashCode, function (err) {
        if (err) {
            return next(err);
        }
        var message = "";
        if (update == 0) {
            message = "删除补丁完成";
        } else if (update == 1) {
            message = "灰度补丁已发布";
        } else if (update == 2) {
            message = "已进行全量更新";
        } else if (update == 3) {
            message = "已停止灰度发布";
        } else if (update == 4) {
            message = "已停止全量发布";
        }
        res.render('publicManagerModel', {
            title: '补丁管理平台',
            message: message
        });
    });
});


router.get('/about', function (req, res, next) {
    res.render('about', {
        title: 'about',
        arr: [{sch: 'hotfix', ab: 'abs', lib: '', abt: '', log: ''}]
    });
});

router.get('/userpositon', ensureAuthenticated, function (req, res, next) {
    hotFix.addOneUserStep(function (err, result) {
        if (err) {
            next(err);
        }
        res.render('userpositon', {
            title: '单点用户行为',
            arr: [{sch: 'hotfix', ab: 'abs', lib: '', abt: '', log: ''}],
            oneUser: result
        });
    })

});


router.post('/oneUserDetail', function (req, res, next) {
    console.log('----userpositon_detail--跳转,进来了吗');
    var id = req.body.id;
    console.log('id = ' + id);
    hotFix.getOneUserStep(id, function (err, result) {
        if (err) {
            next(err);
        }
        res.render('oneUserDetail', {
            title: id,
            message: result
        });
    })

});


router.get('/abuser', function (req, res, next) {
    res.render('abuser', {
        title: 'index',
        arr: [{sch: 'hotfix', ab: 'abs', lib: '', abt: '', log: ''}],
        abuser: [{
            id: 1,
            pageId: '登录',
            buttonId: '获取验证码',
            Apage: 110,
            Bpage: 10
        }, {
            id: 2,
            pageId: '支付',
            buttonId: '获取验证码',
            Apage: 110,
            Bpage: 10
        }, {
            id: 3,
            pageId: '购买充值',
            buttonId: '获取验证码',
            Apage: 110,
            Bpage: 10
        }, {
            id: 4,
            pageId: '提现',
            buttonId: '获取验证码',
            Apage: 110,
            Bpage: 10
        }, {
            id: 5,
            pageId: '注册',
            buttonId: '获取验证码',
            Apage: 110,
            Bpage: 10
        }]
    });
});

//登录验证
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.flash('error_msg', 'You are not logged in');
        res.redirect('/login');
    }
}


module.exports = router;
