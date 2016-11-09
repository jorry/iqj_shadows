var express = require('express');
//引入multer模块
var multer = require ('multer');

var router = express.Router();
var path = require('path');
var hotFix = require('../models/hotFix');

var hotDB = require("../models/hotDB");

var fs = require("fs");


var createFolder = function(folder){
    try{
        fs.accessSync(folder);
    }catch(e){
        fs.mkdirSync(folder);
    }
};

//生成一个文件,但是没有后缀
var uploadFolder = '/Users/iqianjin-liujiawei/Desktop/shadowsManger/newShadowManger/apks/';

createFolder(uploadFolder);

var upload = multer({ dest:  uploadFolder });


////指定apk名字
//var storage = multer.diskStorage({
//    destination: function (req, file, cb) {
//        cb(null, uploadFolder);    // 保存的路径，备注：需要自己创建
//    },
//    filename: function (req, file, cb) {
//        // 将保存文件名设置为 字段名 + 时间戳，比如 logo-1478521468943
//        console.log('---'+file.filename);
//        console.log('---'+file);
//
//        cb(null, file.originalname);
//    }
//});
//
//// 通过 storage 选项来对 上传行为 进行定制化
//var upload = multer({ storage: storage })


/* GET home page. */
router.get('/', function (req, res, nnext) {
    res.redirect('/login');
});


//单位件上传
//注意上传界面中的 <input type="file" name="avatar"/>中的name必须是下面代码中指定的名称
router.post('/singleUpload', upload.single('file'), function (req, res, next) {
    // req.file is the `avatar` file
    // req.body will hold the text fields, if there were any

    var file = req.file;

    var hashCode = file.filename;
    var fileSize = file.size;
    var fileName = file.originalname;

    var description = req.body.description;


    hotDB.save(hashCode,fileName,fileSize,description,function(err){
        console.log('err'+err);
        if (err){
            next(err);
        }
        res.end("ok");
    });

    console.log('文件类型：%s', file.mimetype);
    console.log('原始文件名：%s', file.originalname);
    console.log('新的文件名：%s', file.fieldname);

    console.log('文件大小：%s', file.size);
    console.log('文件保存路径：%s', file.path);
    console.log(req.file);
    console.log(req.body);


});


//灰度设置提交调用,先更新灰度数据库,然后在更新总数据库(在代码回滚界面用到此数据库)
router.post('/graySettingPost', function (req, res, nnext) {
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

//灰度代码回滚界面,点击列表item, 调用这里
router.post('/reverSettingResult', function (req, res,next) {
    var hashCode = req.body.hashCode;
    console.log('-----reverSettingResult');
    hotFix.graySettingReset(hashCode,2, function (err) {
        if (err) {
            return next(err);
        }

        res.render('revert_return', {
            title: '已设置',
            message: '设置完成'
        });
    });


});


router.get('/hotfixEngine', function (req, res, next) {
    //hotFix.save("4.5.1", "1", function (err) {
    //    if (err) {
    //        return next(err);
    //    }
    //
    //});
    res.render('hotfixEngine', {
        title: '修复H5交互引擎'
    });
});


router.get('/hotfixRevert', function (req, res, next) {
    hotFix.hotReverListView(function (err, rows) {
        if (err) {
            return next(err);
        }

        rows.forEach(function (row) {
            console.log('' + row.hotFixType);
            if (row.hotFixType == 1) {
                row.hotFixType = '热修复';
            } else if (row.hotFixType == 2) {
                row.hotFixType = 'a/b Testting';
            } else if (row.hotFixType == 5) {
                row.hotFixType == '单用户行为';
            } else if (row.hotFixType == 3) {
                row.hotFixType = '灰度功能设置';
            }

        });
        res.render('hotfixRevert', {
            title: '设置代码回滚',
            datas: rows
        });
    });
});


router.get('/hotfixResult', function (req, res, next) {
    //hotFix.save("4.5.1", "1", function (err) {
    //    if (err) {
    //        return next(err);
    //    }
    //
    //});
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

router.get('/hotfixUploadFinish', function (req, res, next) {
    addSaveHot('10002', 1, 1)
    console.log('----hotfixUploadFinish--跳转,进来了吗');
    //hotFix.save("4.5.1", "1", function (err) {
    //    if (err) {
    //        return next(err);
    //    }
    //
    //});
    res.render('hotfixUploadFinish', {
        title: '热修复发布完成'
    });
});

router.get('/login', function (req, res, next) {
    res.render('login', {
        title: '登录'
    });
});


router.get('/grayUserSetting', function (req, res, next) {
    console.log('----grayUserSetting--跳转,进来了吗');
    res.render('grayUserSetting', {
        title: '灰度设置'
    });
});


router.get('/abSetting', function (req, res, next) {
    console.log('----abSetting--跳转,进来了吗');
    res.render('abSetting', {
        title: '设置a/b用户',
        arr: [{sch: 'hotfix', ab: 'abs', lib: '', abt: '', log: ''}]
    });
});

router.get('/index', function (req, res, next) {
    hotFix.getHotFixRows(function(err,rows){
        res.render('index', {
            title: 'index',
            arr: [{sch: 'hotfix', ab: 'abs', lib: '', abt: '', log: ''}],
            rows:rows
        });
    });

});


router.get('/about', function (req, res, next) {
    res.render('about', {
        title: 'about',
        arr: [{sch: 'hotfix', ab: 'abs', lib: '', abt: '', log: ''}]
    });
});

router.get('/userpositon', function (req, res, next) {
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


router.post('/userpositon_detail', function (req, res, next) {
    console.log('----userpositon_detail--跳转,进来了吗');
    var imei = req.body.imei;
    console.log('imei = ' + imei);
    hotFix.getOneUserStep(imei, function (err, result) {
        if (err) {
            next(err);
        }
        res.render('userpositon_detail', {
            title: imei,
            arr: [{sch: 'hotfix', ab: 'abs', lib: '', abt: '', log: ''}],
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


module.exports = router;
