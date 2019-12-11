// pages/home/home.js
let util = require("../../utils/util.js");
Page({

    /**
     * 页面的初始数据
     */
    data: {
        name: '',
        loginName: '',
        local_project: {},
        projects: [],
        banner:[],
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onShow: function () {
        let _this = this;
        wx.showLoading();
        util.getHttp('/v1/user/detail', {}, function (res) {
            wx.hideLoading();
            _this.setData({
                name: res.data.user.name,
                loginName: res.data.user.loginName,
            });
        }, function () { });
        util.getUserProject(function (res, local_project) {
            let projectList = res.data.projectList;
            for (let key in projectList) {
                if (projectList[key]['projectAbbreviation'] == null || projectList[key]['projectAbbreviation'] == '') {
                    projectList[key]['projectAbbreviation'] = projectList[key]['projectName'];
                }
            }
            _this.setData({
                local_project: local_project,
                projects: projectList
            });
        });
        util.getHttp('/v1/common/findPlayPictureList', {}, function (res) {
            wx.hideLoading();
            _this.setData({
                banner: res.data.adInfoDtoList
            });
        }, function () { });
    },

    changeProject: function(e) {
        let local_project = this.data.projects[e.detail.value];
        let _this = this;
        _this.setData({
            local_project: local_project
        });
        util.postHttp("/v1/common/switchProject",{projectSid:local_project.projectSid},function (res) {
            if (res.data.status == 0) {
                util.success('保存成功');
            } else {
                _this.setSubmitState(0);
                util.toast(res.data.statusMsg);
            }
        });

        wx.setStorageSync('local_project', JSON.stringify(local_project));
    },
    logout: function(){
        util.postHttp("/v1/user/logout",{},function (res) {
            wx.removeStorageSync('local_project');
            wx.reLaunch({url:'/pages/user/login'});
        });
    }
});