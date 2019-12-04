let util = require("../../utils/util.js");

Page({

    /**
     * 页面的初始数据
     */
    data: {
        show_search_box: 0,
        check_professional: '',
        professional: [],
        check_type: '',
        types: [],
        lists: [],
        page: 0,
        local_project: {},
        isHideLoadMore: false,
        position: 0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.getProject();
        this.getTypes();
        this.getLists();
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
    show_search_box: function (e) {
        let item = e.currentTarget.dataset.item;
        let show_search_box = this.data.show_search_box == item ? 0 : item;
        let checked_index = -1;
        let data = {
            show_search_box: show_search_box,
        };
        if (show_search_box == 1 && this.data.check_professional != '') {
            let professional = this.data.professional;
            for (var key in professional) {
                if (professional[key] == this.data.check_professional) {
                    checked_index = key;
                    break;
                }
            }
        } else if (show_search_box == 2) {
            let types = this.data.types;
            for (let key in types) {
                if (types[key] == this.data.check_type) {
                    checked_index = key;
                    break;
                }
            }
        }
        data.checked_index = checked_index;
        this.setData(data);
    },

    check_item: function (e) {
        this.setData({
            checked_index: e.currentTarget.dataset.index
        });
    },
    sure: function () {
        let show_search_box = this.data.show_search_box;
        let checked_index = this.data.checked_index;
        let data = {};
        if (show_search_box == 1) {
            data = {
                check_professional: checked_index == -1 ? '' : this.data.professional[checked_index]
            }
        } else {
            data = {
                check_type: checked_index == -1 ? '' : this.data.types[checked_index]
            }
        }
        data.show_search_box = 0;
        data.checked_index = -1;
        data.page = 0;
        data.lists = [];
        this.setData(data);
        this.getLists();
    },
    getLists: function (callback) {
        let param = {
            projectSid: this.data.local_project.projectSid,
            pageSize: 10,
            page: this.data.page
        };
        if (this.data.check_professional != '') {
            param.majorCode = this.data.check_professional.key;
        }
        if (this.data.check_type != '') {
            param.type = this.data.check_type.typeCode;
        }
        if (this.data.page == 0) {
            wx.showLoading({
                title: '正在加载',
                mask: true
            });
        }
        let _this = this;
        util.getHttp('/v1/projectNewMsgCommon/findProjectNewMsgPageByUserId', param,
            function (res) {
                wx.hideLoading();
                callback && callback();
                if (res.data == null) {
                    util.toast(res.errors[0].message);
                    _this.setData({
                        isHideLoadMore: true
                    });
                } else if (res.data.status == 0) {
                    _this.setData({
                        lists: _this.data.lists.concat(res.data.item.rows),
                        page: parseInt(_this.data.page) + 1,
                        isHideLoadMore: true,
                        total: res.data.item.total
                    });
                }
            },
            function () {
                wx.hideLoading();
                callback && callback();
                _this.setData({
                    isHideLoadMore: true
                });
            }
        );
    },
    reset: function () {
        this.setData({
            checked_index: -1
        });
    },
    onReachBottom: function () {
        let isHideLoadMore = this.data.isHideLoadMore;
        let page = parseInt(this.data.page);
        let total = parseInt(this.data.total);
        if (isHideLoadMore == false) return;
        if (total <= page) {
            util.toast("已加载完成");
            return;
        }
        this.setData({
            isHideLoadMore: false
        });
        this.getLists();
    },
    onPullDownRefresh: function () {
        wx.showNavigationBarLoading(); //在标题栏中显示加载
        this.setData({
            show_search_box: 0,
            check_professional: '',
            check_type: '',
            lists: [],
            page: 0,
            local_project: {},
            isHideLoadMore: false
        });
        wx.showLoading({
            title: '正在加载',
            mask: true
        });
        this.getLists(function () {
            wx.stopPullDownRefresh();
            wx.hideNavigationBarLoading();
        });
    },
    hide_search_info: function () {
        this.setData({
            show_search_box: 0,
            checked_index: -1,
        });
    },
    deleteKx: function (e) {
        let id = e.currentTarget.dataset.id;
        let _this = this;
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
                            _this.setData({
                                show_search_box: 0,
                                check_professional: '',
                                check_type: '',
                                lists: [],
                                page: 0,
                                local_project: {},
                                isHideLoadMore: false
                            });
                            _this.getLists();
                        }
                    }, function () {
                    });
                }
            }
        });
    },
    revokeKx: function (e) {
        let id = e.currentTarget.dataset.id;
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
                            util.success('撤销成功');
                            _this.setData({
                                show_search_box: 0,
                                check_professional: '',
                                check_type: '',
                                lists: [],
                                page: 0,
                                local_project: {},
                                isHideLoadMore: false
                            });
                            _this.getLists();
                        }
                    }, function () {
                    });
                }
            }
        });
    },
    onPageScroll: function(e) {
        if(e.scrollTop > 0) {
            this.setData({position: 1})
        } else {
            this.setData({position: 0})
        }
    },
});