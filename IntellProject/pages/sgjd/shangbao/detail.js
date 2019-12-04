// pages/sgjd/shangbao/add.js
let util = require("../../../utils/util.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    operations: [],
    check_operation: "",
    qjs: [],
    remark: '',
    id: 0,
    is_loading: 1,
    constructionDate:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _this = this;
    wx.showLoading({
      title: '正在加载',
      mask: true
    });
    util.getHttp('/v1/projectschedule/schedule', {
      type: 1,
      id:  options.id
    }, function (res) {
      wx.hideLoading();
      if (res.data == null || res.errors.length > 0) {
        util.toast(res.errors[0].message);
      } else if (res.data.status != 0) {
        util.toast(res.data.statusMsg);
      } else if (res.data.items.length > 0) {
        let items = res.data.items;
        let k1,k2;
        for (k1 in items) {
          items[k1].show = 1;
          items[k1].display = 0;
          for (k2 in items[k1].items) {
            if (items[k1].items[k2].value > 0) {
              items[k1].items[k2].left = _this.sub(items[k1].items[k2].total, items[k1].items[k2].value);
              items[k1].display = 1;
            }
          }
        }
        _this.setData({
          qjs: items,
          id: options.id,
          check_operation: {
            name: res.data.operationName,
            sid:  res.data.operationSid
          },
          remark: res.data.desc,
          is_loading: 0,
          constructionDate: res.data.constructionDate
        });
      }
    }, function () {
      wx.hideLoading();
    });
  },

  sub: function(a, b) {
    if (a==null || b==null){
      return 0;
    }
    let c = b.toString();
    let arr = c.split('.');
    let jd1 = arr.length == 1 ? 0 : arr[1].length;
    c =  a.toString();
    arr = c.split('.');
    let jd2 = arr.length == 1 ? 0 : arr[1].length;
    let jd = jd1 > jd2 ? jd1 : jd2;
    return (a - b).toFixed(jd);
  },

  setRemark: function (e) {
    this.setData({
      remark: e.detail.value
    })
  },
  toggle_item: function (e) {
    let key = e.currentTarget.dataset.key;
    let qjs = this.data.qjs;
    qjs[key].show = qjs[key].show == 1 ? 0 : 1;
    this.setData({
      qjs: qjs
    })
  }
});