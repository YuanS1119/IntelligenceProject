let util = require("../../utils/util.js");
Page({

    /**
     * 页面的初始数据
     */
    data: {
        message: [],
        page: 1,
        total: 1,
        isHideLoadMore: true,
        loading: 1
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.getLists();
    },

    getLists: function () {
        let _this = this;
        let success = function (res) {
            if (res.data.status != 0) {
                util.toast(res.data.statusMsg);
                return;
            }
            _this.setData({
                message: _this.data.message.concat(res.data.items.rows),
                loading: 0,
                page: parseInt(_this.data.page) + 1,
                isHideLoadMore: true,
                total: res.data.items.total
            });
        };
        let fail = function (res) {
        };
        this.setData({loading: 1});
        util.getHttp('/v1/projectHomePage/loadRemindMessage', {
            queryType: 1,
            pageSize: 20,
            page: this.data.page
        }, success, fail);
    },

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
      this.getLists();
    }
});