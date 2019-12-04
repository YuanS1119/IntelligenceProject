let util = require("../../../utils/util.js");
Page({

    /**
     * 页面的初始数据
     */
    data: {
        operations: [],
        check_operation: "",
        majors: [],
        check_major: "",
        units: [],
        check_unit: '',
        subitems: [],
        check_subitem: '',
        finishNum: '',
        leftnum: '',
        wls: [],
        check_pillarSid: '',
        check_wl: false,
        operation_wls: [],
        all_zzhs: [],
        zzhs: [],
        picker_show: false,
        picker_value: [0],
        submit_state: 0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let _this = this;
        // 加载作业队信息集合
        util.getHttp('/v1/installManageCommon/loadOperationByUserId', {}, function (res) {
            if (res.data == null) {
                util.toast(res.errors[0].message);
            } else if (res.data.status != 0) {
                util.toast(res.data.statusMsg);
            } else if (res.data.items.length > 0) {
                _this.setData({
                    operations: res.data.items,
                    check_operation: res.data.items[0]
                });
                _this.getMajorAndUnit(res.data.items[0].operationVoSid);
            }
        }, function () { });
    },

    tipCheck:function (e){
        let key = e.currentTarget.dataset.key;
        let msg = '';
        switch (key) {
            case 'major' : 
                msg = '作业队';
                break;
            case 'unit':
                msg = '专业';
                break;
            case 'subitem':
                msg = '单位工程';
                break;
            default:
                msg = '';
                break;
        }
        util.toast('请选择' + msg);
    },

    changeOperation: function(e) { 
        let check_operation = this.data.operations[e.detail.value];
        let _this = this;
        _this.setData({
            check_operation: check_operation,
            check_unit:  '',
            check_major: ''
        });
        this.getMajorAndUnit(check_operation.operationVoSid);
    },
    
    getMajorAndUnit: function (operationSid) {//加载作业队对应的专业和单位工程
        wx.showLoading({
            title: '正在加载',
            mask: true
        });
        let _this = this;
        util.getHttp('/v1/installManageCommon/findMajorAndUnitListByItemSid', { operationSid: operationSid}, function (res) {
            if (res.data == null) {
                util.toast(res.errors[0].message);
            } else if (res.data.status != 0) {
                util.toast(res.data.statusMsg);
            } else {
                _this.setData({ majors: res.data.items });
            }
            wx.hideLoading();
        }, function () { });
    },

    changeMajor: function (e) {
        let check_major = this.data.majors[e.detail.value];
        let _this = this;
        this.setData({
            check_major: check_major,
            check_unit: '',
            units: check_major.list
        });
        
    },

    changeUnit: function (e) {
        let _this = this;
        let check_item = this.data.units[e.detail.value];
        this.setData({
            check_unit: check_item
        });
        wx.showLoading({
            title: '正在加载',
            mask: true
        });
        util.getHttp('/v1/installManageCommon/findSubItemByUnitSid', { engineeringSid  : check_item.engineeringSid }, function (res) {
            if (res.data == null) {
                util.toast(res.errors[0].message);
            } else if (res.data.status != 0) {
                util.toast(res.data.statusMsg);
            } else {
                _this.setData({ subitems: res.data.items });
            }
            wx.hideLoading();
        }, function () { });
        let check_major = this.data.check_major;
        if (check_major.majorCode=='cjw') {
            util.getHttp('/v1/installManageCommon/loadPillarByUnitSid', { unitSid: check_item.engineeringSid, dataStatus: 1 }, function (res) {
                if (res.data == null) {
                    util.toast(res.errors[0].message);
                } else if (res.data.status != 0) {
                    util.toast(res.data.statusMsg);
                } else {
                    _this.setData({
                        all_zzhs: res.data.items,
                        zzhs: res.data.items,
                        check_pillarSid: ''
                    });
                }
                wx.hideLoading();
            }, function () { });
        }
    },

    changeSubitem: function (e) {
        let check_item = this.data.subitems[e.detail.value];
        let _this = this;
        this.setData({ check_subitem: check_item });
        util.getHttp('/v1/installManageCommon/findSubItemDesignNum', { 
            majorCode: _this.data.check_major.majorCode,
            subItemCode: check_item.subItemCode,
            subItemDesignNum: check_item.subItemDesignNum,
            subItemSid: check_item.subItemSid
        }, function (res) {
            if (res.data == null) {
                util.toast(res.errors[0].message);
            } else {
                _this.setData({ leftnum: res.data.item.surplusDesignNum });
            }
            wx.hideLoading();
        }, function () { });
    },

    setFinishNum: function (e) {
        this.setData({
            finishNum: e.detail.value
        });
    },

    scanAdd: function () {
        let _this = this;
        wx.scanCode({
            success(res) {
                let code = res.result;
                code = code.replace(/\$/g, "");
                let wls = _this.data.wls;
                for (let key in wls) {
                    if (code == wls[key].stockSid) {
                        return;
                    }
                }
                wx.showLoading({
                    title: '正在加载',
                    mask: true
                });
                util.getHttp('/v1/installManageCommon/loadMaterialByStockSid', { stockSid: code }, function (res) {
                    wx.hideLoading();
                    if (res.data == null) {
                        util.toast(res.errors[0].message);
                    } else {
                        let wl_item = res.data.item;
                        wl_item.num = '';
                        wls.push(wl_item);
                        _this.setData({ wls: wls });
                    }
                }, function () { });
            }
        });        
    },

    scanZzh: function () {
        let _this = this;
        wx.showActionSheet({
            itemList: ['扫描支柱上的二维码', '选择支柱号'],
            success(res) {
                if (res.tapIndex == 0) {
                    wx.scanCode({
                        success(res) {
                            let code = res.result;
                            if (code.indexOf('poleId') === -1) {
                                wx.showModal({
                                    content: '二维码错误!',
                                    showCancel: false
                                }); 
                            } else {
                                let arr = code.split('poleId=');
                                code = arr[arr.length - 1];
                                arr = code.split('&');
                                code = arr[0].replace(/\$/g, "");
                                util.getHttp('/v1/installManageCommon/loadPoleQRCodemsg', {
                                    poleSid: code
                                }, function (res) {
                                    wx.hideLoading();
                                    if (res.data == null) {
                                        util.toast(res.errors[0].message);
                                    } else if (res.data.status == 1) {
                                        util.toast('该支柱号未绑定，请先绑定支柱号！');
                                    } else if (res.data.item == 'null' || res.data.item == null) {
                                        util.toast('该支柱号不存在');
                                    } else {
                                        _this.setData({ check_pillarSid: {
                                            pillarName: res.data.item.pillarName,
                                            pillarSid: res.data.item.pillarSid
                                        }})
                                    }
                                }, function () { wx.hideLoading(); });
                            }
                        }
                    });
                } else {
                    let all_zzh = _this.data.all_zzhs;
                    _this.setData({ 
                        zzhs: all_zzh,
                        picker_show: true 
                    });
                }
            },
            fail(res) {
            }
        })
    },

    deleteWl: function (e) {
        let _this = this;
        wx.showModal({
            content: '是否删除物料信息？',
            showCancel: true,
            success: function (res) {
                if (res.confirm) {
                    let sid = e.currentTarget.dataset.sid;
                    let wls = _this.data.wls;
                    for (let key in wls) {
                        if (wls[key].stockSid == sid) {
                            wls.splice(key,1);break;
                        }
                    }
                    _this.setData({wls: wls});
                }
            }
        });

    },

    setWlNum: function (e) {

        let wls = this.data.wls;
        for (let key in wls) {
            if (wls[key].stockSid == sid) {
                wls[key]['num'] = e.detail.value; 
                break;
            }
        }
        this.setData({ wls: wls });
    },

    submit: function (e) {
        if (this.data.submit_state == 1) return;
        let dataStatus = e.currentTarget.dataset.status;
        let check_operation = this.data.check_operation;
        let check_major = this.data.check_major;
        let check_unit = this.data.check_unit;
        let check_subitem = this.data.check_subitem;
        let finishNum = this.data.finishNum;
        let wls = this.data.wls;
        let check_pillarSid = this.data.check_pillarSid;
        if (check_operation == '') {
            util.toast('请选择作业队！');
        } else if (check_major == '') {
            util.toast('请选择专业！');
        } else if (check_unit == '') {
            util.toast('请选择单位工程！');
        } else if (check_subitem == '') {
            util.toast('请选择分项工程！');
        } else if (finishNum == '') {
            util.toast('请填写本次完工数量！');
        } else if (wls.length == 0) {
            util.toast('请添加物料信息！');
        } else if (check_major.majorCode == 'cjw' && check_pillarSid == '') {
            util.toast('请选择支柱号！');
        } else {
            let detailVoList = [];
            for (let key in wls) {
                detailVoList.push({
                    stockSid: wls[key].stockSid,
                    consumNum: wls[key].num,
                    materialSid: wls[key].materialSid
                })
            }
            let postData = {
                operationSid: check_operation.operationVoSid,
                engineeringUnitSid: check_unit.engineeringSid,
                pillarSid: check_pillarSid == '' ? '' : check_pillarSid.pillarSid,
                majorCode: check_major.majorCode,
                majorName: check_major.majorName,
                majorSid: check_major.majorSid,
                subItemCode: check_subitem.subItemCode,
                subItemSid: check_subitem.subItemSid,
                finishNum: finishNum,
                dataStatus: dataStatus,
                detailVoList: detailVoList
            };

            this.setSubmitState(1);
            util.show_loading('正在保存，请稍后');
            let _this = this;
            util.postHttp('/v1/installManageCommon/saveOrUpdateInstallConsume',postData,function (res) {
                wx.hideLoading();
                if (res.data.status == 0) {
                    util.success('操作成功', function () {
                        wx.navigateBack();
                    });
                } else {
                    util.toast(res.data.statusMsg);
                }
                _this.setSubmitState(0);
            },function () {
                wx.hideLoading();
                _this.setSubmitState(0);
            });
        }
    },

    sgAdd: function () {
        wx.showLoading({
            title: '正在加载',
            mask: true
        });
        let _this = this;
        util.getHttp('/v1/installManageCommon/loadMaterialStockByOperation', {
            operationSid: this.data.check_operation.operationVoSid 
        }, function (res) {
            wx.hideLoading();
            if (res.data == null) {
                util.toast(res.errors[0].message);
            } else if (res.data.status != 0) {
                util.toast(res.data.statusMsg);
            } else {
                let operation_wls = res.data.items;
                let wls = _this.data.wls;
                let ids = [],key;
                for (key in wls) {
                    ids.push(wls[key].stockSid);
                }
                for (key in operation_wls) {
                    operation_wls[key].check_status = ids.indexOf(operation_wls[key].stockSid) >= 0 ? true : false;
                }
                _this.setData({ operation_wls: operation_wls, check_wl: true });
            }
        }, function () { wx.hideLoading();});
    },

    checkboxChange: function (e) {
        let _this = this;
        let operation_wls = _this.data.operation_wls;
        let wls = e.detail.value;
        for (let key in operation_wls) {
            operation_wls[key].check_status = wls.indexOf(operation_wls[key].stockSid) == -1 ? false : true;
        }
        this.setData({ operation_wls: operation_wls});
    },
    
    cancelCheck: function () {
        this.setData({ check_wl: false});
    },

    sureCheck: function () {
        let operation_wls = this.data.operation_wls;
        let wls = this.data.wls;
        let ids = [], key;
        for (key in wls) {
            ids.push(wls[key].stockSid);
        }
        for (key in operation_wls) {
            if (operation_wls[key].check_status && ids.indexOf(operation_wls[key].stockSid) == -1) {
                wls.push(operation_wls[key]);
            }
        }
        this.setData({ check_wl: false, wls: wls });
    },
    picker_change: function (e) {
        const val = e.detail.value;
        let picker_value = [];
        picker_value.push(val[0]);
        this.setData({
            picker_value: picker_value
        });
    },
    cancel_picker: function () {
        this.setData({
            picker_show: false
        });
    },
    sure_picker: function () {
        let picker_valer = this.data.picker_value;
        let zzhs = this.data.zzhs;
        this.setData({
            check_pillarSid: zzhs[picker_valer[0]],
            picker_show: false
        });
    },
    searchZzhs: function (e) {
        let value = e.detail.value;
        let zzhs = [];
        let all_zzh = this.data.all_zzhs;
        for (let i in all_zzh) {
            if (all_zzh[i].pillarName.indexOf(value) != -1) {
                zzhs.push(all_zzh[i]);
            }
        }
        this.setData({zzhs:zzhs});
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
})