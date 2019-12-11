// pages/feature/construction/info.js
let util = require("../../../utils/util.js");
Page({

    /**
     * 页面的初始数据
     */
    data: {
        title: '',
        code: '',
        info: {},
        material: {}
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        wx.setNavigationBarTitle({
            title: options.name
        });
        let _this = this;
        // 获取物料信息
        util.getHttp('/v1/poleQRcodeMsg/loadMaterialByPoleSid', { poleSid: options.code }, function (res) {
            if (res.data == null) {
                util.toast(res.errors[0].message);
            } else if (res.data.status != 0) {
                util.toast(res.date.statusMsg);
            } else {
                _this.setData({
                    material: res.data.item
                });
            }

        }, function () { });

        util.getHttp('/v1/installManageCommon/loadPoleQRCodemsg', { poleSid: options.code }, function (res) {
            _this.setData({
                info: res.data.item,
                code: options.code,
            });
        }, function () { });
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})