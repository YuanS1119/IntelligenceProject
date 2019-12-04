// pages/sgjd/xingxiang/add.js
let util = require("../../../utils/util.js");
Page({

    /**
     * 页面的初始数据
     */
    data: {
        operations: [],
        check_operation: "",
        units: [],
        check_unit: "",
        ChartsModelAndProcedures: [],
        poles: [],
        show_poles: 0,
        key1: 0,
        key2: 0,
        submit_state: 0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.getOperationTeam();
    },
    //获取作业队信息
    getOperationTeam: function () {
        let _this = this;
        util.getHttp('/v1/projectschedule/scheduleGetOperationTeam', {}, function (res) {
                if (res.data == null) {
                    util.toast(res.errors[0].message);
                } else if (res.data.status != 0) {
                    util.toast(res.data.statusMsg);
                } else if (res.data.items.length > 0) {
                    _this.setData({
                        operations: res.data.items,
                        check_operation: res.data.items[0]
                    });
                    _this.getUnitsEngineerings(res.data.items[0].sid)
                }
            },
            function () {

            }
        );
    },
    //选择作业队
    checkOperationTeam: function (e) {
        let check_operation = this.data.operations[e.detail.value];
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
    getUnitsEngineerings: function (operationTeamSid) {
        let _this = this;
        let param = {operationTeamSid: operationTeamSid};
        util.getHttp('/v1/completecharts/getUnitsEngineerings', param, function (res) {
                if (res.data == null) {
                    util.toast(res.errors[0].message);
                } else if (res.data.status != 0) {
                    util.toast(res.data.statusMsg);
                } else {
                    _this.setData({
                        units: res.data.uitems
                    });
                }
            },
            function () {

            }
        );

    },

    checkUnit: function (e) {
        let check_unit = this.data.units[e.detail.value];
        let _this = this;
        if (check_unit != this.data.check_unit) {
            let param = {
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
    getReportRequest: function (code) {
        let _this = this;
        let param = {unitsEngineeringCode: code};
        util.getHttp('/v1/completecharts/getChartsModelAndProcedure', param, function (res) {
                if (res.data == null) {
                    util.toast(res.errors[0].message);
                } else {
                    _this.setData({
                        ChartsModelAndProcedures: res.data.modelProcedurePoles
                    });
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

        //
        //
        // let ChartsModelAndProcedures = this.data.ChartsModelAndProcedures;
        // let data = ChartsModelAndProcedures[key1].procedureAndPoleList[key2];
        // let _this = this;
        // if (data.poles == undefined) {
        //     let param = {
        //         unitsEngineeringCode: this.data.check_unit.code,
        //         modelCode: ChartsModelAndProcedures[key1].modelCode,
        //         procedureCode: data.procedureCode
        //     };
        //     wx.showLoading({
        //         title: '正在加载数据',
        //         mask: true
        //     });
        //     util.getHttp('/v1/completecharts/getPoleList', param, function (res) {
        //             wx.hideLoading();
        //             if (res.data == null) {
        //                 util.toast(res.errors[0].message);
        //             } else if (res.data.status != 0) {
        //                 util.toast(res.data.statusMsg);
        //             } else {
        //                 ChartsModelAndProcedures[key1].procedureAndPoleList[key2].poles = res.data.chartsPoles;
        //                 _this.setData({
        //                     ChartsModelAndProcedures: ChartsModelAndProcedures,
        //                     poles: res.data.chartsPoles,
        //                     show_poles: 1,
        //                     key1: key1,
        //                     key2: key2,
        //                 });
        //             }
        //         },
        //         function () {
        //
        //         }
        //     );
        // } else {
        //     _this.setData({
        //         poles: data.poles,
        //         show_poles: 1
        //     });
        // }
    },

    submit: function (e) {
        if (this.data.submit_state == 1) return;
        let dataStatus = e.currentTarget.dataset.status;
        let modelProcedurePoles = [];
        let ChartsModelAndProcedures = this.data.ChartsModelAndProcedures;
        let key1, key2, key3, procedure, detail, items;
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
        let postData = {
            reportStatus: dataStatus,
            unitsEngineeringCode: this.data.check_unit.code,
            operationTeamSid: this.data.check_operation.sid,
            modelProcedurePoles: modelProcedurePoles
        };
        let _this = this;
        _this.setSubmitState(1);
        util.show_loading('正在保存，请稍后');
        util.postHttp('/v1/completecharts/addChartsComplete', postData, function (res) {
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
    }

});