let util = require("../../../utils/util.js");
Page({

    /**
     * 页面的初始数据
     */
    data: {
        lists: [],
        page: 0,
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
    },

    onShow: function () {
        this.setData({page: 0, lists: []});
        this.initPage(function () {
            wx.hideLoading();
        });
    },

    initPage: function (callback) {
        let _this = this;
        this.setData({loading: 1});
        util.getHttp('/v1/completecharts/findChartsCompletePage', {
            pageSize: 10, pageIndex: 1
        }, function (res) {
            _this.setData({loading: 0});
            if (res.data == null) {
                util.toast(res.errors[0].message);
            } else {
                let lists = res.data.pageList;

                _this.setData({
                    total: res.data.total,
                    lists: lists
                });
            }
            callback();
        }, function () {
        });
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        wx.stopPullDownRefresh();
        this.setData({lists: []});
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

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        let isHideLoadMore = this.data.isHideLoadMore;
        let page = parseInt(this.data.page);
        let total = parseInt(this.data.total);
        if (isHideLoadMore == false) return;
        if (total <= 1 + page) {
            util.toast("已加载完成")
            return;
        }
        this.setData({isHideLoadMore: false});
        let _this = this;
        util.getHttp('/v1/projectschedule/schedules', {
            pageSize: 10, pageIndex: 1 + page, dataStatus: 0
        }, function (res) {
            _this.setData({loading: 0, isHideLoadMore: true});
            if (res.data == null) {
                util.toast(res.errors[0].message);
            } else if (res.data.status != 0) {
                util.toast(res.data.statusMsg);
            } else {
                let lists = res.data.items;
                let data_lists = _this.data.pageList;
                data_lists = data_lists.concat(lists);
                _this.setData({
                    total: res.data.total,
                    lists: data_lists,
                    page: page + 1
                });
            }
        }, function () {
        });
    }
})