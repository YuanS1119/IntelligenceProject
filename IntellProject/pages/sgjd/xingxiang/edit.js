// pages/sgjd/xingxiang/add.js
var util = require("../../../utils/util.js");
Page({

    /**
     * 页面的初始数据
     */
    data: {
        id: '',
        operations: [],
        check_operation: "",
        units: [],
        check_unit: "",
        ChartsModelAndProcedures: [],
        'poles': [],
        show_poles: 0,
        key1: 0,
        key2: 0,
        num: 0,
        ccc: 123456
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var _this = this;
        this.setData({id: options.id});
        util.getHttp('/v1/completecharts/reportRequest', {id: options.id}, function (res) {
                if (res.data == null) {
                    util.toast(res.errors[0].message);
                } else {
                    var data = res.data;
                    var check_operation = {sid: data.operationSid, name: data.operationName};
                    _this.getUnitsEngineerings(data.operationSid, {
                        name: data.unitsEngineeringName,
                        code: data.unitsEngineeringCode
                    });
                    _this.getOperationTeam(check_operation);
                    _this.getReportRequest(data.unitsEngineeringCode, function (ChartsModelAndProcedures) {
                        var key1, key2, param;
                        var num = 0;
                        for (key1 in ChartsModelAndProcedures) {
                            num += ChartsModelAndProcedures[key1].procedureAndPoleList.length;
                        }
                        wx.showLoading({
                            title: '正在加载数据',
                            mask: true
                        });
                        _this.setData({
                            ChartsModelAndProcedures: ChartsModelAndProcedures,
                            num: num
                        });
                        for (key1 in ChartsModelAndProcedures) {
                            for (key2 in ChartsModelAndProcedures[key1].procedureAndPoleList) {
                                param = {
                                    unitsEngineeringCode: _this.data.check_unit.code,
                                    modelCode: ChartsModelAndProcedures[key1].modelCode,
                                    procedureCode: ChartsModelAndProcedures[key1].procedureAndPoleList[key2].procedureCode,
                                    reportStatus: 0,
                                    masterId: options.id
                                };
                                _this.getSubmitPoleList(param, key1, key2);
                            }
                        }
                    });
                }
            },
            function () {

            }
        );
    },

    getSubmitPoleList: function (param, key1, key2) {
        var _this = this;
        util.getHttp('/v1/completecharts/getPoleList', param, function (res) {
                var poles = [], checkedPoles = [];
                if (res.data != null && res.data.status == 0) {
                    poles = res.data.chartsPoles;
                }
                for (var k in poles) {
                    if (poles[k].status != null) {
                        checkedPoles.push(poles[k]);
                        poles[k].checked = true;
                    }
                }
                var ChartsModelAndProcedures = _this.data.ChartsModelAndProcedures;
                var num = _this.data.num;
                ChartsModelAndProcedures[key1].procedureAndPoleList[key2].poles = poles;
                ChartsModelAndProcedures[key1].procedureAndPoleList[key2].checkedPoles = checkedPoles;
                num--;
                _this.setData({
                    ChartsModelAndProcedures: ChartsModelAndProcedures,
                    num: num
                });
                if (_this.data.num == 0) {
                    wx.hideLoading();
                }
            },
            function () {

            }
        );
    },

    //获取作业队信息
    getOperationTeam: function (check_operation) {
        var _this = this;
        util.getHttp('/v1/projectschedule/scheduleGetOperationTeam', {}, function (res) {
                if (res.data == null) {
                    util.toast(res.errors[0].message);
                } else if (res.data.status != 0) {
                    util.toast(res.data.statusMsg);
                } else if (res.data.items.length > 0) {
                    _this.setData({
                        operations: res.data.items,
                        check_operation: check_operation
                    });
                }
            },
            function () {

            }
        );
    },

    //选择作业队
    checkOperationTeam: function (e) {
        var check_operation = this.data.operations[e.detail.value];
        if (check_operation != this.data.check_operation) {
            this.setData({
                check_operation: check_operation,
                units: [],
                check_unit: ""
            });
            this.getUnitsEngineerings(check_operation.sid);
        }
    },

    //根据作业队获取单位工程
    getUnitsEngineerings: function (operationTeamSid, check_unit = '') {
        var _this = this;
        var param = {operationTeamSid: operationTeamSid};
        util.getHttp('/v1/completecharts/getUnitsEngineerings', param, function (res) {
                if (res.data == null) {
                    util.toast(res.errors[0].message);
                } else if (res.data.status != 0) {
                    util.toast(res.data.statusMsg);
                } else {
                    _this.setData({
                        units: res.data.uitems,
                        check_unit: check_unit
                    });
                }
            },
            function () {

            }
        );

    },

    //选择单位工程
    checkUnit: function (e) {
        var check_unit = this.data.units[e.detail.value];
        var _this = this;
        if (check_unit != this.data.check_unit) {
            var param = {
                unitsEngineeringCode: check_unit.code,
                operationTeamSid: this.data.check_operation.sid,
                modelProcedurePoles: []
            };
            util.postHttp('/v1/completecharts/reportValidate', param, function (res) {
                    if (res.data == null) {
                        util.toast(res.errors[0].message);
                    } else if (res.data.status != 0) {
                        util.toast(res.data.statusMsg);
                    } else {
                        _this.setData({
                            check_unit: check_unit,
                        });
                        _this.getReportRequest(check_unit.code);
                    }
                },
                function () {

                }
            );
        }
    },

    //通过单位工程获取工序模型及工序
    getReportRequest: function (code, callback) {
        var _this = this;
        var param = {unitsEngineeringCode: code};
        util.getHttp('/v1/completecharts/getChartsModelAndProcedure', param, function (res) {
                if (res.data == null) {
                    util.toast(res.errors[0].message);
                } else {
                    if (callback != undefined) {
                        callback(res.data.modelProcedurePoles);
                    } else {
                        _this.setData({
                            ChartsModelAndProcedures: res.data.modelProcedurePoles
                        });
                    }
                }
            },
            function () {

            }
        );
    },

    goCheckPole: function (e) {
        let key1 = e.currentTarget.dataset.key1;
        let key2 = e.currentTarget.dataset.key2;
        let ChartsModelAndProcedures = this.data.ChartsModelAndProcedures;
        let data = ChartsModelAndProcedures[key1].procedureAndPoleList[key2];
        let _this = this;
        wx.navigateTo({
            url: 'check_pole',
            events: {
                sendData: function(data) {
                    let info = {};
                    let key1 = data.key1;
                    let key2 = data.key2;
                    let ChartsModelAndProcedures = _this.data.ChartsModelAndProcedures;
                    let poles = data.poles;
                    let checkedPoles = [];
                    for (let key in poles) {
                        if (poles[key].checked == true) {
                            checkedPoles.push(poles[key]);
                        }
                    }
                    ChartsModelAndProcedures[key1].procedureAndPoleList[key2].poles = poles;
                    ChartsModelAndProcedures[key1].procedureAndPoleList[key2].checkedPoles = checkedPoles;
                    _this.setData({
                        ChartsModelAndProcedures: ChartsModelAndProcedures
                    });
                }
            },
            success: function(res) {
                res.eventChannel.emit('sendData', {
                    key1: key1,
                    key2: key2,
                    poles: data.poles,
                    unitsEngineeringCode: _this.data.check_unit.code,
                    modelCode: ChartsModelAndProcedures[key1].modelCode,
                    procedureCode: data.procedureCode
                })
            }
        });
    },

    submit: function (e) {
        var dataStatus = e.currentTarget.dataset.status;
        var modelProcedurePoles = [];
        var ChartsModelAndProcedures = this.data.ChartsModelAndProcedures;
        var key1, key2, key3, procedure, detail, items;
        for (key1 in ChartsModelAndProcedures) {
            procedure = ChartsModelAndProcedures[key1];
            detail = [];
            for (key2 in procedure.procedureAndPoleList) {
                items = [];
                if (procedure.procedureAndPoleList[key2].checkedPoles != undefined) {
                    for (key3 in procedure.procedureAndPoleList[key2].checkedPoles) {
                        items.push({
                            poleCode: procedure.procedureAndPoleList[key2].checkedPoles[key3].poleCode
                        })
                    }
                }
                detail.push({
                    procedureCode: procedure.procedureAndPoleList[key2].procedureCode,
                    items: items
                })
            }
            modelProcedurePoles.push({
                modelCode: procedure.modelCode,
                detail: detail
            })
        }
        var postData = {
            id: this.data.id,
            reportStatus: dataStatus,
            unitsEngineeringCode: this.data.check_unit.code,
            operationTeamSid: this.data.check_operation.sid,
            // reportDate: this.currentDate(),
            modelProcedurePoles: modelProcedurePoles
        };
        util.show_loading('正在保存，请稍后');
        util.postHttp('/v1/completecharts/addChartsComplete', postData, function (res) {
            wx.hideLoading();
            if (res.data.status == 0) {
                util.success('操作成功', function () {
                    wx.navigateBack();
                });
            } else {
                util.toast(res.data.statusMsg);
            }
        }, function () {
            wx.hideLoading();
        });
    },
});