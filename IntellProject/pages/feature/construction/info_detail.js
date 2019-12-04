let util = require("../../../utils/util.js");
Page({

    /**
     * 页面的初始数据
     */
    data: {
        info: {},
        wls: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let _this = this;
        wx.showLoading({
            title: '正在加载',
            mask: true
        }); 
        util.getHttp('/v1/installManageCommon/loadInstallManageById', { installInfoId: options.id }, function (res) {
            wx.hideLoading();
            if (res.data == null) {
                util.toast(res.errors[0].message);
            } else if (res.data.status != 0) {
                util.toast(res.date.statusMsg);
            } else {
                _this.setData({
                    info: res.data.item,
                    wls: res.data.item.installDetailVoList
                });
            }
        }, function () { });
    }
})