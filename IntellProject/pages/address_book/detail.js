let util = require("../../utils/util.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
      id: '',
      info: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      this.setData({
         id: options.id
      })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
      let _this = this;
      let success = function (res) {
        if (res.data.status != 0) {
          util.toast(res.data.statusMsg);
          return;
        }
          wx.setNavigationBarTitle({
              title: res.data.user.name
          });
        _this.setData({
          info: res.data.user
        })
      };
      let fail = function (res) {};
      util.getHttp('/v1/addressBook/getUserOrgInfo', {userId: this.data.id}, success, fail);
  },

  call:function () {
    wx.makePhoneCall({
      phoneNumber: this.data.info.mobile
    })
  }
})