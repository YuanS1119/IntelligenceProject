let util = require("../../../utils/util.js");
Page({

    /**
     * 页面的初始数据
     */
    data: {
        loading: 1,
        scrollY: true,
        scrollTop: 0,
        time: 0,
        startTap: 0,
        startIndex: 0,
        lastIndex: 0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        const eventChannel = this.getOpenerEventChannel();
        let _this = this;
        eventChannel.on('sendData', function (data) {
            data.loading = 0;
            if (data.poles == undefined) {
                let param = {
                    unitsEngineeringCode: data.unitsEngineeringCode,
                    modelCode: data.modelCode,
                    procedureCode: data.procedureCode
                };
                wx.showLoading({
                    title: '正在加载数据',
                    mask: true
                });
                let success = function (res) {
                    wx.hideLoading();
                    if (res.data == null) {
                        util.toast(res.errors[0].message);
                    } else if (res.data.status != 0) {
                        util.toast(res.data.statusMsg);
                    } else {
                        data.poles = res.data.chartsPoles;

                        _this.setData(data);
                        eventChannel.emit('sendData', {
                            key1: data.key1,
                            key2: data.key2,
                            poles: res.data.chartsPoles
                        });
                    }
                };
                util.getHttp('/v1/completecharts/getPoleList', param, success,
                    function () {

                    }
                );
            } else {
                _this.setData(data);
            }

        })
    },

    // 确认选择杆号
    sureCheck: function () {
        const eventChannel = this.getOpenerEventChannel();
        eventChannel.emit('sendData', {
            key1: this.data.key1,
            key2: this.data.key2,
            poles: this.data.poles
        });
        wx.navigateBack();
    },
    //取消选择杆号
    cancelCheck: function () {
        wx.navigateBack();
    },

    //杆号选择器 点击
    checkboxChange: function (e) {
        let poles = this.data.poles;
        let index = e.currentTarget.dataset.index;
        poles[index].checked = poles[index].checked == true ? false : true;
        this.setData({poles: poles});
    },

    scroll: function (e) {
        this.setData({
            scrollTop: e.detail.scrollTop
        })
    },

    touchstart: function (e) {
        this.setData({
            timeStamp: e.timeStamp,
            startIndex: e.target.dataset.index,
            lastIndex: e.target.dataset.index,
            startTap: 1
        });
        let _this = this;
        setTimeout(function () {
            if (_this.data.startTap) {
                let poles = _this.data.poles;
                poles[_this.data.startIndex].checked = true;
                _this.setData({
                    scrollY: false,
                    poles: poles
                });
                util.toast('滑动动多选');
            }
        },300);
    },

    touchmove: function (e) {
        if (this.data.startTap == 0) {
            return;
        }
        let index = parseInt((parseInt(e.changedTouches[0].pageY) + this.data.scrollTop) / 45) ;
        let lastIndex = this.data.lastIndex,startIndex = this.data.startIndex;
        if (this.data.scrollY) {
            this.setData({
                startTap: 0
            });
            return;
        }
        if (index == lastIndex) {
             return;
        }
        let poles = this.data.poles;
        if (index == startIndex) {
            poles[lastIndex].checked = false;
        } else if (index > startIndex) {
            if (lastIndex > index) {
                poles[lastIndex].checked = false;
            } else {
                poles[index].checked = true;
            }
        } else {
            if (lastIndex < index) {
                poles[lastIndex].checked = false;
            } else {
                poles[index].checked = true;
            }
        }
        this.setData({
            scrollY: false,
            poles: poles,
            lastIndex: index
        });
    },
    touchend: function (e) {
        this.setData({
            scrollY: true,
            startTap: 0
        });
    }
})