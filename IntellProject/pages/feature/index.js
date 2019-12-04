let util = require("../../utils/util.js");
Page({

    /**
     * 页面的初始数据
     */
    data: {
        functions: getApp().globalData.functions,
        message: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onShow: function (options) {
        util.show_loading('正在加载');
        let _this = this;
        let success = function (res) {
            wx.hideLoading();
            if (res.data.status != 0) {
                util.toast(res.data.statusMsg);
                return;
            }
            _this.setData({
                message: res.data.items.rows
            })
        };
        let fail = function (res) {wx.hideLoading();};
        util.getHttp('/v1/projectHomePage/loadRemindMessage', {
            queryType: 0,
            page: 1,
            pageSize: 2
        }, success, fail);
    },
    no_power: function () {
        util.toast('没有权限');
    },
    go_link: function (e) {
        wx.navigateTo({
            url: e.currentTarget.dataset.url
        });
    }
});