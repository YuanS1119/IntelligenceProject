let util = require('../../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // select
    selectArray: [{
      "id": "10",
      "text": "会计类"
  }, {
      "id": "21",
      "text": "工程类"
  }],
    pageSize:10,
    page:1
  },
  getProblem:function(){
    let userToken = wx.getStorageSync("openid");
    let local_project = JSON.parse(wx.getStorageSync("local_project"));
    let projectSid = local_project.projectSid;
    console.log(userToken)
    console.log(local_project)
    console.log(projectSid)
    util.getHttp('/v1/security/loadCheckList',
    {
      'userToken': userToken,
      'projectSid':projectSid,
      'companyOrgId':'',
      'pageSize':this.data.pageSize,
      'page':this.data.page
    },
    function(res){
      console.log(res)
    },function(){

    });
  },
  onLoad: function () {
   
  },
 
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getProblem();
  }
})
