// pages/sgjd/shangbao/add.js
let util = require("../../../utils/util.js");
Page({

    /**
     * 页面的初始数据
     */
    data: {
        operations: [],
        check_operation: "",
        qjs: [],
        remark: '',
        error: '',
        type: 1,
        submit_state: 0,
        constructionDate: '',
        is_filling: 1
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let _this = this;
        let currentDate = this.currentDate();
        _this.setData({
            constructionDate: currentDate.split(' ')[0]
        });
        util.getHttp('/v1/projectschedule/findIsFilling', {}, function (res) {
            _this.setData({
                is_filling: res.data.status
            });
        }, function () {

        });

        // 加载作业队信息集合
        util.getHttp('/v1/projectschedule/scheduleGetOperationTeam', {}, function (res) {
            if (res.data == null) {
                util.toast(res.errors[0].message);
                _this.setData({
                    error: res.errors[0].message
                });
            } else if (res.data.status != 0) {
                if (res.data.items == null) {
                    _this.setData({
                        state: 0
                    });
                } else {
                    util.toast(res.data.statusMsg);
                    _this.setData({
                        error: res.data.statusMsg
                    });
                }
            } else {
                _this.setData({
                    operations: res.data.items,
                    // check_operation: res.data.items[0]
                });
                // _this.getQjs(0, res.data.items[0].sid);
            }
        }, function () {
        });
    },
    changeOperation: function (e) {
        let check_operation = this.data.operations[e.detail.value];
        let _this = this;
        this.getQjs(this.data.type, check_operation);
    },
    change_type: function() {
        let check_operation = this.data.check_operation;
        if (check_operation == '') {
            util.toast('请先选择作业队');
            return;
        }
        this.getQjs(1 - parseInt(this.data.type), check_operation);
    },
    getQjs: function (type, check_operation) {
        let sid = check_operation.sid;
        let _this = this;
        wx.showLoading({
            title: '正在加载',
            mask: true
        });
        let param = {type: type};
        if (sid != '') {
            param.operationTeamSid = sid;
        }
        util.getHttp('/v1/projectschedule/schedule', param, function (res) {
            wx.hideLoading();
            if (res.data == null) {
                util.toast(res.errors[0].message);
                // _this.setData({
                //     error: res.errors[0].message,
                //     type: type
                // });
            } else if (res.data.status != 0 && res.data.statusMsg != null) {
                util.toast(res.data.statusMsg);
                // _this.setData({
                //     error: res.data.statusMsg,
                //     type: type
                // });
            } else {
                let items = res.data.items;
                let k1,k2;
                for (k1 in items) {
                    items[k1].show = 0;
                    items[k1].display = 0;
                    for (k2 in items[k1].items) {
                        if (items[k1].items[k2].total != null) {
                            items[k1].display = 1;
                            items[k1].items[k2].left = _this.sub(items[k1].items[k2].total, items[k1].items[k2].value);
                        }
                    }
                }
                _this.setData({
                    check_operation: check_operation,
                    qjs: items,
                    type: type
                });
            }
        }, function () {
            wx.hideLoading();
        });
    },
    setRemark: function (e) {
        this.setData({
            remark: e.detail.value
        })
    },
    toggle_item: function (e) {
        let key = e.currentTarget.dataset.key;
        let qjs = this.data.qjs;
        qjs[key].show = qjs[key].show == 1 ? 0 : 1;
        this.setData({
            qjs: qjs
        })
    },
    setValue: function (e) {
        let value = e.detail.value;
        let key1 = e.currentTarget.dataset.key1;
        let key2 = e.currentTarget.dataset.key2;
        let qjs = this.data.qjs;
        let item = qjs[key1].items[key2];
        if (value == '') {

        } else if (isNaN(value)) {
            util.toast('只能为数字1！');
            return item.value;
        } else if (parseFloat(value) > parseFloat(item.left)) {
            util.toast('最大可完成数为' + item.left + '！');
            return item.value;
        } else {
            qjs[key1].items[key2].value = value;
        }
    },
    submit: function (e) {
        if (this.data.check_operation == '') {
            util.toast('请选择作业队');
            return;;
        }
        if (this.data.submit_state == 1) return;
        let dataStatus = e.currentTarget.dataset.status;
        let qjs = this.data.qjs;
        let items = [];
        let key1,key2,value;
        for (key1 in qjs) {
            for (key2 in qjs[key1].items) {
                value = qjs[key1].items[key2].value;
                value = value == null || value == '' ? 0 : qjs[key1].items[key2].value;
                if (dataStatus == 0 || value > 0) {
                    items.push({
                        'id'   : qjs[key1].items[key2].id,
                        'code' : qjs[key1].items[key2].code,
                        'value': qjs[key1].items[key2].value,
                    });
                }
            }
        }
        let time = this.currentDate().split(' ')[1];
        let postData = {
            type: dataStatus,
            constructionDate: this.data.constructionDate  + ' ' + time,
            desc: this.data.remark,
            operationTeamSid: this.data.check_operation.sid,
            items: items
        };
        let _this = this;
        _this.setSubmitState(1);
        util.show_loading('正在保存，请稍后');
        util.postHttp('/v1/projectschedule/schedule',postData,function (res) {
            wx.hideLoading();
            if (res.data.status == 0) {
                util.success('操作成功', function () {
                    wx.navigateBack();
                });
            } else {
                _this.setSubmitState(0);
                util.toast(res.data.statusMsg);
            }
        },function () {
            wx.hideLoading();
            _this.setSubmitState(0);
        });
    },

    currentDate: function () {
        var now = new Date();

        var year = now.getFullYear();       //年
        var month = now.getMonth() + 1;     //月
        var day = now.getDate();            //日
        var hh = now.getHours();            //时
        var mm = now.getMinutes();          //分
        var ss = now.getSeconds();          //分
        var clock = year + "-";

        if (month < 10)
            clock += "0";
        clock += month + "-";
        if (day < 10)
            clock += "0";
        clock += day +" ";
        if(hh < 10)
            clock += "0";

        clock += hh + ":";
        if (mm < 10)
            clock += '0';
        clock += mm + ":";

        if (ss < 10)
            clock += '0';
        clock += ss;
        return clock;
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
            },1000);
        }
    },
    shop_date_tip: function () {
        util.toast('您只能上报今日得进度！');
    },
    sub: function(a, b) {
        if (a==null || b==null){
            return 0;
        }
        let c = b.toString();
        let arr = c.split('.');
        let jd1 = arr.length == 1 ? 0 : arr[1].length;
        c =  a.toString();
        arr = c.split('.');
        let jd2 = arr.length == 1 ? 0 : arr[1].length;
        let jd = jd1 > jd2 ? jd1 : jd2;
        return (a - b).toFixed(jd);
    },
});