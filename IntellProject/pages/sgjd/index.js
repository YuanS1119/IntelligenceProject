// pages/sgjd/index.js
let util = require("../../utils/util.js");
Page({

    /**
     * 页面的初始数据
     */
    data: {

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

    },

    no_power: function () {
        util.toast('无访问权限');
    },
    go_url: function (e) {
        wx.navigateTo({
            url: e.currentTarget.dataset.url
        });
    }
});