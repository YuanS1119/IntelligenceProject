// pages/sgjd/fenxi/daily.js
let util = require("../../../utils/util.js");
Page({

    /**
     * 页面的初始数据
     */
     data: {
        professional: [],
        check_professional: '',
        units: [],
        check_unit: [],
        lists: [],
        error: '',
        page: 1,
        show_search_box: 0, //显示搜索
        is_loading: 1,
        checked_index: -1,
        isHideLoadMore: true
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.getProfessional();
    },
    getProfessional: function () {
        let _this = this;
        // 加载专业集合
        util.getHttp('/v1/projectschedule/scheduleGetProfessional', {},
            function (res) {
                if (res.data == null) {
                    util.toast(res.errors[0].message);
                    _this.setData({
                        error: '您没有权限访问',
                        is_loading: 0
                    });
                } else if (res.data.status != 0) {
                    util.toast(res.data.statusMsg);
                    _this.setData({
                        error: '您没有权限访问',
                        is_loading: 0
                    });
                } else if (res.data.pitems == null) {
                    _this.setData({
                        error: '您没有权限访问',
                        is_loading: 0
                    });
                } else {
                    _this.setData({
                        professional: res.data.pitems,
                        is_loading: 0
                    });
                }
            },
            function () {
                _this.setData({
                    error: '您没有权限访问',
                    is_loading: 0
                });
            }
        );
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
            if (this.data.check_professional == '') {
                util.toast('请先选择专业');
                return;
            }
            let units = this.data.units;
            for (let key in units) {
                units[key].checked = this.data.check_unit.indexOf(units[key].code) >=0 ? 1 : 0;
            }
            data.units = units;
        }
        data.checked_index = checked_index;
        this.setData(data);
    },
    hide_search_info: function () {
        this.setData({
            show_search_box: 0,
            checked_index: -1,
        });
    },
    reset: function () {
        if (this.data.show_search_box == 1) {
            this.setData({
                checked_index: -1
            });
        } else {
            let units = this.data.units;
            for (let key in units) {
                units[key].checked = this.data.check_unit.indexOf(units[key].code) >=0 ? 1 : 0;
            }
            this.setData({
                units: units
            });
        }
    },

    check_item: function (e) {
        if (this.data.show_search_box == 1) {
            this.setData({
                checked_index: e.currentTarget.dataset.index
            });
        } else {
            let units = this.data.units;
            units[e.currentTarget.dataset.index].checked = units[e.currentTarget.dataset.index].checked == true ? false : true;
            this.setData({
                units: units
            });
        }

    },
    sure: function () {
        let show_search_box = this.data.show_search_box;
        let checked_index = this.data.checked_index;
        let data = {};
        if (show_search_box == 1) {
            if (checked_index == -1) {
                data = {
                    check_professional: '',
                    lists : '',
                    units: [],
                    check_unit: []
                };
            } else {
                let professional = this.data.professional;
                if (professional[checked_index] != this.data.check_professional) {
                    data = {
                        check_professional: professional[checked_index],
                        units: [],
                        check_unit: []
                    }
                    this.getUnits(professional[checked_index].code);
                }
            }
        } else {
            let check_unit = [];
            let units = this.data.units;
            for (let key in units) {
                if (units[key].checked == true) {
                    check_unit.push(units[key].code);
                }
            }
            data = {check_unit: check_unit};
        }
        data.show_search_box = 0;
        data.checked_index = -1;
        data.page = 1;
        data.lists = [];
        this.setData(data);
        this.getLists();
    },
    getUnits: function (professional) {
        let _this = this;
        // 加载专业集合
        let param = {
            majorCode: professional
        };
        util.getHttp('/v1/projectschedule/scheduleGetUnits', param,
            function (res) {
                if (res.data == null) {
                    util.toast(res.errors[0].message);
                } else {
                    _this.setData({
                        units: res.data.pitems,
                    });
                }
            },
            function () {

            }
        );
    },

    getLists: function () {
        let check_professional = this.data.check_professional;
        if (check_professional == '') return;
        let check_unit = this.data.check_unit;
        let param = {
            majorCode: check_professional.code,
            unitCodes: check_unit.join(','),
            pageIndex: this.data.page,
            pageSize: 10
        };
        let _this = this;
        if (this.data.page == 1) {
            wx.showLoading({
                title: '正在加载',
                mask: true
            });
        }
        util.getHttp('/v1/projectschedule/constructScheduleQuery', param,
            function (res) {
                wx.hideLoading();
                if (res.data == null) {
                    util.toast(res.errors[0].message);
                    _this.setData({
                        isHideLoadMore: true
                    });
                } else {
                    _this.setData({
                        lists: _this.data.lists.concat(res.data.items),
                        page : parseInt(_this.data.page) + 1,
                        isHideLoadMore: true,
                        total:res.data.total
                    });
                }
            },
            function () {
                wx.hideLoading();
                _this.setData({
                    isHideLoadMore: true
                });
            }
        );
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        let isHideLoadMore = this.data.isHideLoadMore;
        let page = parseInt(this.data.page);
        let total = parseInt(this.data.total);
        if (isHideLoadMore == false) return;
        if (total < page) {
            util.toast("已加载完成");
            return;
        }
        this.setData({
            isHideLoadMore: false
        });
        this.getLists();
    }
});