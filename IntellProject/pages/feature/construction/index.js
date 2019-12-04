let util = require("../../../utils/util.js");
Page({

    /**
     * 页面的初始数据
     */
    data: {
        buttonClickState: false,
        title: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

    },
    scanCode: function () {
        let _this = this;
        wx.scanCode({
            success(res) {
                let code = res.result;
                if (_this.data.buttonClickState) return;
                if (code.indexOf('poleId') === -1) {
                    wx.showModal({
                        content: '二维码错误!',
                        showCancel: false
                    });
                } else {
                    let arr = code.split('poleId=');
                    code = arr[arr.length - 1];
                    arr = code.split('&');
                    code = arr[0].replace(/\$/g, "");
                    _this.setData({ buttonClickState: true });
                    util.getHttp('/v1/installManageCommon/loadPoleQRCodemsg', { poleSid: code }, function (res) {
                        _this.setData({ buttonClickState: false });
                        if (res.data.status == 0) {
                            wx.navigateTo({
                                url: '/pages/feature/construction/info?code=' + code
                            });
                        } else {
                            wx.navigateTo({
                                url: '/pages/feature/construction/bind?code=' + code
                            });
                        }
                    }, function () { });

                }
            }
        })
    }
});