let util = require("../../../utils/util.js");
Page({

    /**
     * 页面的初始数据
     */
    data: {
        code: '',
        info: {}
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let _this = this;
        this.setData({code: options.code});
        util.getHttp('/v1/platformShelvesCommon/findPlatformShelvesBySid', {
            platformSid: options.code }, function (res) {
            if (res.data.status == 1) {
                util.toast(res.data.statusMsg);
            } else {
                _this.setData({code: options.code, info: res.data.item});
            }
        }, function () { });
    },
    
})