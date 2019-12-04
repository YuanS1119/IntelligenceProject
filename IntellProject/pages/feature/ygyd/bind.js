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
        all_pillars: [],
        pillars: [],
        info: {},
        picker_show: false,
        picker_value: [0]
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let _this = this;

        console.log(options)
        util.getHttp('/v1/installManageCommon/loadUnitByProjectSid', {}, function (res) {
            if (res.data.status == 0) {
                _this.setData({
                    title: options.name,
                    code:  options.code,
                    units: res.data.items
                });
            }
        }, function () { });
    },
    tipCheck: function() {
        util.toast("请先选择单位工程！");
    },
    changeUnit: function (e) {
        let check_unit = this.data.units[e.detail.value];
        let _this = this;
        util.getHttp('/v1/installManageCommon/loadPillarByUnitSid', { unitSid: check_unit.unitSid}, function (res) {
            if (res.data.status == 0) {
                _this.setData({
                    check_unit: check_unit,
                    check_pillar: '',
                    pillars: res.data.items,
                    all_pillars: res.data.items,
                });
            }
        }, function () { });
    },
    changePillar: function (e) {
        this.setData({ check_pillar: this.data.pillars[e.detail.value]});
    },
    submit:function() {
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
                projectSid: this.data.code
            };
            util.show_loading('正在保存，请稍后');
            util.postHttp("/v1/poleQRcodeMsg/savePoleQRcodeMsg",postData,function(res) {
                wx.hideLoading();
                if (res.data.status == 0) {
                    util.success('绑定成功',function() {
                        wx.navigateBack();
                    });
                } else {
                    util.toast(res.data.statusMsg);
                }
            },function (res) {
                wx.hideLoading();
            });
        }
    },

    picker_change: function (e) {
        const val = e.detail.value;
        let picker_value = [];
        picker_value.push(val[0]);
        this.setData({
            picker_value: picker_value
        });
    },

    show_picker: function () {
        let all_pillars = this.data.all_pillars;
        this.setData({
            pillars: all_pillars,
            picker_show : true
        });
    },

    cancel_picker: function () {
        this.setData({
            picker_show: false
        });
    },
    sure_picker: function () {
        let picker_valer = this.data.picker_value;
        let pillars = this.data.pillars;
        this.setData({
            check_pillar: pillars[picker_valer[0]],
            picker_show: false
        });
    },
    searchZzhs: function (e) {
        let value = e.detail.value;
        let zzhs = [];
        let all_zzh = this.data.all_pillars;
        for (let i in all_zzh) {
            if (all_zzh[i].pillarName.indexOf(value) != -1) {
                zzhs.push(all_zzh[i]);
            }
        }
        this.setData({ pillars: zzhs });
    }
})