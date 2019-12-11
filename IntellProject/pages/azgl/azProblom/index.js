let util = require('../../../utils/util')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageSize:10,
    page:1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let userToken = wx.getStorageSync("openid");
    let local_project =  JSON.parse(wx.getStorageSync("local_project"));
    let projectSid = local_project.projectSid;
    util.getHttp('/v1/securityCheck/loadCheckListByProSid',{
      userToken,
      projectSid,
      companyOrgId:'',
      pageSize:this.data.pageSize,
      page:this.data.page
     
    },function(res){
      console.log(res)
    })
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

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})