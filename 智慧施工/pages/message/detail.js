let util = require("../../utils/util.js");
Page({
    data: {
        info: {},
        animationData: {},
        check_image: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let _this = this;
        let success = function (res) {
            if (res.data.status != 0) {
                util.toast(res.data.statusMsg);
                return;
            }
            _this.setData({
                info: res.data.item
            })
        };
        let fail = function (res) {};
        util.getHttp('/v1/projectHomePage/loadRemindMessageDetail', {msgSid: options.id}, success, fail);
        this.animation = wx.createAnimation({
            duration: 500,
            timingFunction: 'ease',
        });
    },

    show_image: function (e) {
        let _this = this;
        let image = this.data.info.msgPictureUrlList[e.currentTarget.dataset.index];
        this.animation.height('100%').top(0).step()
        this.setData({
            animationData: this.animation.export(),
            check_image: image
        })
    },
    hide_image: function () {
        this.animation.height('0').top('100%').step()
        this.setData({
            animationData: this.animation.export(),
            scroll_top: 0
        })
    },
});