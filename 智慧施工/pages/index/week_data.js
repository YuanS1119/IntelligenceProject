let util = require("../../utils/util.js");
Page({

    /**
     * 页面的初始数据
     */
    data: {
        type: '',
        items: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            type: options.type
        });
        wx.setNavigationBarTitle({
          title: options.title
        });
        this.loadDetail();
    },

    loadDetail: function () {
      let _this = this;
      let success = function (res) {
        _this.setData({
            items: res.items
        })
      };
      let fail = function (res) {};
      util.getHttp('/v1/projectHomePage/loadDetail', {forwardSignType: this.data.type}, success, fail);
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    }
})