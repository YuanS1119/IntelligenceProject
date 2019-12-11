let util = require("../../utils/util.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    msgSid: '',
    local_project: {},
    check_professional: '',
    professional: [],
    check_type: '',
    types: [],
    title: '',
    text: '',
    images: [],
    latitude: 23.099994,
    longitude: 113.324520,
    markers: [],
    msgStatus: 0,
    check_image: '',
    animationData:  {},
    scroll_top: 0
  },

  onLoad: function (options) {
    this.setData({
      msgSid: options.id
    });
  },
  onReady: function (e) {
    let _this = this;
    this.loadMsgInfo();
  },
  onShow: function () {
    this.animation = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease',
    });
  },
  loadMsgInfo: function (callback) {
    let _this = this;
    let local_project = wx.getStorageSync('local_project');
    local_project = local_project == '' ? '' : JSON.parse(local_project);
    util.getHttp('/v1/projectNewMsgCommon/loadProjectNewMsgByMsgId', {msgSid: this.data.msgSid}, function (res) {
          if (res.data.status != 0) {
            util.toast(res.data.statusMsg);
            wx.redirectTo({
              url: "/pages/xmkx/my_list"
            })
            return;
          }
          let info = res.data.item;
          let images = [];
          for (let key in info.msgPictureUrlMap) {
            images.push({
              path: info.msgPictureUrlMap[key],
              id: key
            })
          }
          let longitudeLatitude = info.longitudeLatitude.split(',');

          _this.setData({
            msgStatus: info.msgStatus,
            local_project: local_project,
            check_professional: {
              key: info.majorCode,
              name: info.majorName
            },
            check_type: {
              typeCode: info.msgTypeCode,
              typeName: info.msgTypeName,
            },
            title: info.msgName,
            text: info.msgText,
            images: images,
            latitude: longitudeLatitude[1],
            longitude: longitudeLatitude[0],
            markers: [{
              id: 'marker',
              latitude: longitudeLatitude[1],
              longitude: longitudeLatitude[0],
              iconPath: "/images/xmkx/location.png",
              width: 32,
              height: 32
            }]
          });
          callback && callback();
        }, function () {

        }
    );
  },

  initMap: function () {
    let _this = this;
    _this.mapCtx = wx.createMapContext('myMap');
  },

  show_image: function (e) {
    let _this = this;
    let image = this.data.images[e.currentTarget.dataset.index];
    this.animation.height('100%').top(0).step()
    this.setData({
      animationData: this.animation.export(),
      check_image: image.path
    })
  },
  hide_image: function() {
    this.animation.height('0').top('100%').step()
    this.setData({
      animationData: this.animation.export(),
      scroll_top: 0
    })
  },
});