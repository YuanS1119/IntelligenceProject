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
        submit_state: 0,
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
        this.loadMsgInfo(function () {
            _this.getProject();
            _this.getTypes();
            _this.initMap();
        });
    },
    onShow: function () {
        this.animation = wx.createAnimation({
            duration: 500,
            timingFunction: 'ease',
        });
    },
    loadMsgInfo: function (callback) {
        let _this = this;
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
                    local_project: {
                        projectSid: info.projectSid,
                        projectName: info.projectName
                    },
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
    input_value: function (e) {
        let data = {};
        data[e.currentTarget.dataset.key] = e.detail.value;
        this.setData(data);
    },
    regionchange(e) {
        let _this = this;
        if (e.type == 'end' && (e.causedBy == undefined || e.causedBy == 'drag')) {
            this.mapCtx.getCenterLocation({
                success: function (res) {
                    _this.mapCtx.translateMarker({
                        markerId: 'marker',
                        destination: {
                            latitude: res.latitude,
                            longitude: res.longitude,
                        },
                        duration: 10
                    })
                    _this.setData({
                        markers: [{
                            id: 'marker',
                            latitude: res.latitude,
                            longitude: res.longitude,
                            iconPath: "/images/xmkx/location.png",
                            width: 32,
                            height: 32
                        }]
                    });
                }
            })
        }
    },
    getProject() {
        let _this = this;
        util.getHttp('/v1/projectNewMsgCommon/loadProjectVoByUserId', {}, function (res) {
            let local_project = wx.getStorageSync('local_project');
            local_project = JSON.parse(local_project);
            let items = res.data.items;
            let item = items[0], key;
            for (key in items) {
                if (items[key].projectSid == local_project.projectSid) {
                    item = items[key];
                    break;
                }
            }
            let professional = [];
            for (key in item.majorMap) {
                professional.push({
                    key: key,
                    name: item.majorMap[key]
                })
            }
            _this.setData({
                professional: professional,
                local_project: local_project
            });
        }, function () {
        });
    },
    getTypes: function () {
        let _this = this;
        util.getHttp('/v1/projectNewMsgCommon/findProjectNewMsgTypeList', {}, function (res) {
            _this.setData({
                types: res.data.items
            });
        }, function () {
        });
    },
    change_type: function (e) {
        let _this = this;
        _this.setData({
            check_type: this.data.types[e.detail.value]
        });
    },
    change_professional: function (e) {
        let _this = this;
        _this.setData({
            check_professional: this.data.professional[e.detail.value]
        });
    },
    upload_image: function () {
        let _this = this;
        util.uploadPicture(function (res, path) {
            if (res.data.status != 0) {
                util.toast(res.data.statusMsg);
                return;
            }
            _this.setData({
                images: _this.data.images.concat({
                    id: res.data.item.fileSid,
                    path: path
                }),
            });
        });
    },
    delete_image: function (e) {
        let _this = this;
        wx.showModal({
            content: '是否删除图片？',
            showCancel: true,
            success: function (res) {
                if (res.confirm) {
                    let index = e.currentTarget.dataset.index;
                    let images = _this.data.images;
                    images.splice(index, 1);
                    _this.setData({
                        images: images
                    });
                }
            }
        });
    },

    submit: function (e) {
        if (this.data.submit_state == 1) return;
        if (this.data.title == '') {
            util.toast('请填写快讯标题');
        } else if (this.data.text == '') {
            util.toast('请填写快讯正文');
        } else if (this.data.check_type == '') {
            util.toast('请选择快讯类型');
        } else if (this.data.check_professional == '') {
            util.toast('请选择快讯专业');
        } else if (this.data.images.length == 0) {
            util.toast('请至少上传一张现场图片');
        } else {
            let imageSid = [];
            for (let key in this.data.images) {
                imageSid.push(this.data.images[key].id);
            }
            let postData = {
                msgSid: this.data.msgSid,
                projectSid: this.data.local_project.projectSid,
                projectName: this.data.local_project.projectName,
                newMessageTitle: this.data.title,
                newMessageText: this.data.text,
                type: this.data.check_type.typeCode,
                majorCode: this.data.check_professional.key,
                pictureSidList: imageSid,
                longitudeLatitude: this.data.markers[0].longitude + "," + this.data.markers[0].latitude,
                whetherRelease: e.currentTarget.dataset.status
            };

            let _this = this;
            this.setSubmitState(1);
            util.show_loading('正在保存，请稍后');
            util.postHttp('/v1/projectNewMsgCommon/saveOrUpdateProjectNewMsg', postData, function (res) {
                wx.hideLoading();
                if (res.data.status == 0) {
                    util.success('操作成功', function () {
                        wx.navigateBack();
                    });
                } else {
                    _this.setSubmitState(0);
                    util.toast(res.data.statusMsg);
                }
            }, function () {
                wx.hideLoading();
                _this.setSubmitState(0);
            });
        }
    },
    setSubmitState: function (value) {
        let _this = this;
        _this.setData({
            submit_state: value
        });
        if (value == 1) {
            setTimeout(function () {
                _this.setData({
                    submit_state: 0
                });
            }, 1000);
        }
    },
    deleteMsg: function () {
        let id = this.data.msgSid;
        wx.showModal({
            content: '是否删除快讯？',
            showCancel: true,
            success: function (res) {
                if (res.confirm) {
                    util.getHttp('/v1/projectNewMsgCommon/deleteProjectNewMsgByMsgId', {msgSid: id}, function (res) {
                        if (res.data.status != 0) {
                            util.toast(res.data.statusMsg);
                        } else {
                            util.success('删除成功');
                            wx.redirectTo({
                                url: "/pages/xmkx/my_list"
                            })
                        }
                    }, function () {
                    });
                }
            }
        });
    },
    revokeKx: function (e) {
        let id = this.data.msgSid;
        let _this = this;
        wx.showModal({
            content: '确认撤销上报？',
            showCancel: true,
            success: function (res) {
                if (res.confirm) {
                    util.getHttp('/v1/projectNewMsgCommon/revokeProjectNewMsgByMsgId', {msgSid: id}, function (res) {
                        if (res.data.status != 0) {
                            util.toast(res.data.statusMsg);
                        } else {
                            wx.redirectTo({
                                url: "/pages/xmkx/my_list"
                            })
                        }
                    }, function () {
                    });
                }
            }
        });
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