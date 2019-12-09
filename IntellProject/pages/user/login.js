let util = require("../../utils/util.js");
Page({
    /**
     * 页面的初始数据
     */
    data: {
        username: '',
        pwd: ''
    },
    
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

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
    setUsername: function (e) {
        this.setData({
            username: e.detail.value
        });
    },
    setPwd: function (e) {
        this.setData({
            pwd: e.detail.value
        });
    },
    clearInput: function (e) {
        if (e.currentTarget.dataset.key == 'pwd') {
            this.setData({
                pwd: ''
            });
        } else {
            this.setData({
                username: ''
            });
        }
    },
    doLogin: function () {
        if (this.data.username == '') {
            wx.showModal({
                content: '请输入用户名/手机号!',
                showCancel: false
            });
        } else if (this.data.pwd == '') {
            wx.showModal({
                content: '请输入密码!',
                showCancel: false
            });
        } else {
            util.postHttp('/v1/user/login', {
                loginName: this.data.username, 
                userPwd: this.data.pwd, 
                openId: '$$WX$$' + wx.getStorageSync('openid')
            },
                function (res) {
                    // console.log(res.retCode)
                    if (res.retCode != '0' || res.data.status != '0') {
                        wx.showModal({
                            content: res.errors[0].message,
                            showCancel: false
                        });
                    } else {
                        wx.switchTab({
                            url: '/pages/index/index'
                        })
                    }
                
                }, function () {

                }
            );
        }
    }
})