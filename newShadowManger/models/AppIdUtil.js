/**
 * Created by iqianjin-liujiawei on 16/11/15.
 */


var AppIdUtil = {};

module.exports = AppIdUtil;

AppIdUtil.appUid = function () {
    var x = (Math.random() * 9000) + 1000;
    var date = new Date().Format("yyyyMMdd");
    return date + "-" + (100001 + x);
}


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