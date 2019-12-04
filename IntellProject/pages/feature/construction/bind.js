let util = require("../../../utils/util.js");
Page({

    /**
     * 页面的初始数据
     */
    data: {
        title: '',
        code: '',
        check_unit: '',
        units: [],
        check_pillar: '',
        pillars: [],
        info: {},
        material: {}
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        wx.setNavigationBarTitle({
            title: options.name
        });
        let _this = this;
        // 获取物料信息
        util.getHttp('/v1/poleQRcodeMsg/loadMaterialByPoleSid', { poleSid: options.code }, function (res) {
            if (res.data == null) {
                util.toast(res.errors[0].message);
            } else if (res.data.status != 0) {
                util.toast(res.date.statusMsg);
            } else {
                _this.setData({
                    material: res.data.item
                });
            }
            
        }, function () { });

        util.getHttp('/v1/installManageCommon/loadPoleQRCodemsg', { poleSid: options.code }, function (res) {
            _this.setData({
                info: res.data.item
            });
        }, function () { });

        util.getHttp('/v1/installManageCommon/loadUnitByProjectSid', {}, function (res) {
            if (res.data.status == 0) {
                _this.setData({
                    title: options.name,
                    code: options.code,
                    units: res.data.items
                });
            }
        }, function () { });
    },
    tipCheck: function () {
        util.toast("请先选择单位工程！");
    },
    changeUnit: function (e) {
        let check_unit = this.data.units[e.detail.value];
        let _this = this;
        util.getHttp('/v1/installManageCommon/loadPillarByUnitSid', {
            unitSid: check_unit.unitSid,
            dataStatus: 0
        }, function (res) {
            if (res.data.status == 0) {
                _this.setData({
                    check_unit: check_unit,
                    check_pillar: '',
                    pillars: res.data.items
                });
            }
        }, function () { });
    },
    changePillar: function (e) {
        this.setData({ check_pillar: this.data.pillars[e.detail.value] });
    },
    submit: function () {
        let check_unit = this.data.check_unit;
        let check_pillar = this.data.check_pillar;
        if (check_unit == '') {
            util.toast("请选择工程单位！");
        } else if (check_pillar == '') {
            util.toast("请选择支柱号！");
        } else {
            let postData = {
                poleSid: this.data.code,
                pillarSid: check_pillar.pillarSid,
                engineeringUnitSid: check_unit.unitSid,
                projectSid: ''
            };
            util.show_loading('正在保存，请稍后');
            util.postHttp("/v1/poleQRcodeMsg/savePoleQRcodeMsg", postData, function (res) {
                wx.hideLoading();
                if (res.data.status == 0) {
                    util.success('绑定成功', function () {
                        wx.navigateBack();
                    });
                } else {
                    util.toast(res.data.statusMsg);
                }
            }, function (res) {
                wx.hideLoading();
            });
        }
    }
})