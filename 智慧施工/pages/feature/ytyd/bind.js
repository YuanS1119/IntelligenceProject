let util = require("../../../utils/util.js");
Page({

    /**
     * 页面的初始数据
     */
    data: {
        code: '',
        majors: [],
        check_major: '',
        units: [],
        check_unit: '',
        device_types: [],
        check_device_type: '',
        device_code: '',
        device_name: '',
        device_xh: ''
    }, 

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let _this = this;
        util.getHttp('/v1/platformShelvesCommon/findConstructionMajorByProjectSid', { platformSid: options.code}, function (res) {
            if (res.data.status == 0) {
                _this.setData({
                    title: options.name,
                    code: options.code,
                    majors: res.data.items
                });
            }
        }, function () { });
    },
    setDeviceCode: function (e) {
        this.setData({
            device_code: e.detail.value
        });
    },
    setDeviceName: function (e) {
        this.setData({
            device_name: e.detail.value
        });
    },
    setDeviceXh: function (e) {
        this.setData({
            device_xh: e.detail.value
        });
    },
    changeMajor: function (e) {
        let check_major = this.data.majors[e.detail.value];
        let _this = this;
        _this.setData({ check_major: check_major});
        util.getHttp('/v1/platformShelvesCommon/findEngineeringUnitList', { majorCode: check_major.majorCode }, function (res) {
            if (res.data.status == 0) {
                _this.setData({
                    check_unit: '',
                    units: res.data.items
                });
            } else {
                util.toast(res.data.statusMsg);
            }
        }, function () { });
        util.getHttp('/v1/platformShelvesCommon/findDeviceTypeList', { majorCode: check_major.majorCode }, function (res) {
            if (res.data.status == 0) {
                _this.setData({
                    check_device_type: '',
                    device_types: res.data.items
                });
            } else {
                util.toast(res.data.statusMsg);
            }
        }, function () { });
    },
    changeUnit: function (e) {
        let check_unit = this.data.units[e.detail.value];
        this.setData({
            check_unit: check_unit
        });
    },
    changeDeviceType: function (e) {
        let check_device_type = this.data.device_types[e.detail.value];
        this.setData({
            check_device_type: check_device_type
        });
    },
    submit: function () {
        let check_major = this.data.check_major;
        let check_unit = this.data.check_unit;
        let check_device_type = this.data.check_device_type;
        let device_code = this.data.device_code;
        let device_name = this.data.device_name;
        let device_xh = this.data.device_xh;
        if (check_major == '') {
            util.toast("请选择施工专业！");
        } else if (check_unit == '') {
            util.toast("请选择单位工程！");
        } else if (check_device_type == '') {
            util.toast("请选择设备类型！");
        } else if (device_code == '') {
            util.toast("请填写设备编号！");
        } else {
            let postData = {
                platformSid: this.data.code,
                majorCode: check_major.majorCode,
                unitSid: check_unit.unitSid,
                deviceTypeCode: check_device_type.deviceTypeCode,
                deviceCode: device_code,
                deviceName: device_name,
                deviceModel: device_xh
            };
            util.show_loading('正在保存，请稍后');
            util.postHttp('/v1/platformShelvesCommon/saveOrUpdatePlatformShelves', postData, function (res) {
                wx.hideLoading();
                if (res.data.status == 0) {
                    util.success('绑定成功', function () {
                        wx.navigateBack();
                    });
                } else {
                    let msg = res.errors.length > 0 ? res.errors[0].message : res.data.statusMsg
                    util.toast(msg);
                }
            }, function () {
                wx.hideLoading();
            });
        }
    }
})