let util = require("../../../utils/util.js");
Page({

    /**
     * 页面的初始数据
     */
    data: {
        lists: [],
        page: 1,
        total: 1,
        loading: 1,
        isHideLoadMore: true
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        wx.showLoading({
            title: '正在加载',
            mask: true
        });
        this.initPage(function () {
            wx.hideLoading();
        });
    },

    initPage: function (callback) {
        let _this = this;
        this.setData({ loading: 1 });
        util.getHttp('/v1/projectschedule/schedules', {
            pageSize: 10, pageIndex: this.data.page, status: 1
        }, function (res) {
            _this.setData({ loading: 0 });
            if (res.data == null) {
                util.toast(res.errors[0].message);
            } else if (res.data.status != 0) {
                util.toast(res.data.statusMsg);
            } else {
                let lists = res.data.items;
                _this.setData({
                    total: res.data.total,
                    lists: lists
                });
            }
            callback();
        }, function () { });
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        wx.stopPullDownRefresh();
        this.setData({ lists: [] });
        wx.showLoading({
            title: '正在加载',
            mask: true
        });
        this.initPage(function () {
            wx.hideLoading();
            wx.hideNavigationBarLoading();
            wx.stopPullDownRefresh();
        });
    },
    currentDate: function () {
        var now = new Date();

        var year = now.getFullYear();       //年
        var month = now.getMonth() + 1;     //月
        var day = now.getDate();            //日
        var hh = now.getHours();            //时
        var mm = now.getMinutes();          //分
        var ss = now.getSeconds();          //分
        var clock = year + "-";

        if (month < 10)
            clock += "0";
        clock += month + "-";
        if (day < 10)
            clock += "0";
        clock += day +" ";
        if(hh < 10)
            clock += "0";

        clock += hh + ":";
        if (mm < 10)
            clock += '0';
        clock += mm + ":";

        if (ss < 10)
            clock += '0';
        clock += ss;
        return clock;
    },
    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        let isHideLoadMore = this.data.isHideLoadMore;
        let page = parseInt(this.data.page);
        let total = parseInt(this.data.total);
        if (isHideLoadMore == false) return;
        if (total < 1 + page) {
            util.toast("已加载完成")
            return;
        }
        this.setData({ isHideLoadMore: false });
        let _this = this;
        util.getHttp('/v1/projectschedule/schedules', {
            pageSize: 10, pageIndex: 1 + page, status: 1
        }, function (res) {
            _this.setData({ loading: 0,isHideLoadMore: true });
            if (res.data == null) {
                util.toast(res.errors[0].message);
            } else if (res.data.status != 0) {
                util.toast(res.data.statusMsg);
            } else {
                let lists = res.data.items;
                let data_lists = _this.data.lists;
                data_lists = data_lists.concat(lists);
                _this.setData({
                    total: res.data.total,
                    lists: data_lists,
                    page: page + 1
                });
            }
        }, function () { });
    }
})