const app = getApp()
let util = require("../../utils/util.js");
import * as echarts from '../../echart/echarts';

Page({
    data: {
        resource: [],
        total_value: {},
        value_by_month: [],
        option: {},
        ec: '',
        currentDate: '',
        width: 300,
        local_project: '',
        monthItems: []
    },
    onLoad: function () {

    },
    onShow: function () {
        let _this = this;
        this.checkLogin(function () {
            util.show_loading('正在加载');
            _this.loadResourceData();
            _this.loadTotalValue();
            _this.loadValueByMonth();
            _this.currentDate();
            let local_project = wx.getStorageSync('local_project');
            local_project = JSON.parse(local_project);
            _this.setData({
                local_project:local_project
            });
            console.log(local_project)
        });
    },
    checkLogin: function (callback) {
        let openid = wx.getStorageSync('openid');
        let loginStatus = wx.getStorageSync('loginStatus') == '' ? 0 : 1;
        if (openid == '') {
            wx.login({
                success: res => {
                    console.log(res.code)
                    // debugger;
                    util.getHttp('/v1/weChar/findWeChatInfoByJsCode', { 'jsCode': res.code},
                        function(res){
                            console.log(res)
                            wx.setStorageSync('openid', res.data.item.openId);
                            util.checkLogin(callback);
                        },function(){

                        });
                }
            });
        } else {
            util.checkLogin(callback);
        }
    },

    loadResourceData: function () {
        let _this = this;
        let success = function (res) {
            _this.setData({
                resource: res.items
            })
        };
        let fail = function (res) {};
        util.getHttp('/v1/projectHomePage/loadResourceData', {queryType: 1}, success, fail);
    },

    loadTotalValue: function () {
        let _this = this;
        let success = function (res) {
            let total_value = res.data.item;
            if ( parseFloat(total_value.totalFinishPercentage) > 95) {
                total_value.totalFinishStyle = 'right: 0';
            } else {
                total_value.totalFinishStyle = 'left: ' + total_value.totalFinishPercentage;
            }
            _this.setData({
                total_value: total_value
            });
            wx.hideLoading();
        };
        let fail = function (res) {};
        util.getHttp('/v1/projectHomePage/loadTotalValue', {}, success, fail);
    },

    loadValueByMonth: function () {
        let _this = this;
        let success = function (res) {
            let items = res.data.items;
            let xdata = [], planYData = [], actualValue = [], finishPercentage = [];
            // let max = 0;
            for (let key in items) {
                xdata.push(items[key].yearMonth);
                planYData.push(items[key].planValue);
                actualValue.push(items[key].actualValue);
                finishPercentage.push(items[key].finishPercentage);
                // max = max > items[key].planValue ? max : items[key].planValue;
                // max = max > items[key].actualValue ? max : items[key].actualValue;
            }
            let option = {
                color: ['#d1edff', '#008fff'],
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                        type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                    },
                    confine: true
                },
                legend: {
                    data: ['计划', '实际'],
                    bottom: 0,
                    left: 20,
                    show: false
                },
                grid: {
                    left: 5,
                    right: 5,
                    top: 25,
                    bottom: 0,
                    containLabel: true,
                    borderColor: '#ddd'
                },
                xAxis: [
                    {
                        type: 'category',
                        axisTick: { show: true },
                        data: xdata,
                        axisLabel: {
                            color: '#666',
                            fontSize: 10,
                            margin: 12,
                            align: 'center'
                        }
                    }
                ],

                yAxis: [
                    {
                        type: 'value',
                        axisLine: {
                            lineStyle: {
                                color: '#999'
                            }
                        },
                        axisLabel: {
                            color: '#666'
                        },
                        // max: max
                    }
                ],

                series: [
                    {
                        name: '计划',
                        type: 'bar',
                        barWidth: 18,
                        barGap: 0,
                        label: {
                            normal: {
                                show: true,
                                position:'top',
                                // align: 'left',
                                formatter: function(params) {
                                    //计算汇总值
                                    let name = params.name;
                                    let index;  //x轴序列顺序
                                    for (let i = 0, l = xdata.length; i < l; i++) {
                                        if (name == xdata[i]) {
                                            index = i;
                                            break;
                                        }
                                    }
                                    let pData = parseFloat(planYData[index]);
                                    let aData = parseFloat(actualValue[index]);
                                    return pData >= aData ? "实:" +aData+"\n计:"+ pData: ' ';
                                },
                                textStyle: {
                                    color: 'black'
                                },
                                offset: [15, 0]
                            }
                        },
                        data: planYData
                    },
                    {
                        name: '实际',
                        barWidth: 18,
                        barGap: 0,
                        type: 'bar',
                        stack: '总量',
                        label: {
                            show: true,
                            position:'top',
                            textStyle: {
                                color: 'black'
                            },
                            align: 'left',
                            offset: [-10, 0],
                            formatter: function(params) {
                                //计算汇总值
                                let name = params.name;
                                let index;  //x轴序列顺序
                                for (let i = 0, l = xdata.length; i < l; i++) {
                                    if (name == xdata[i]) {
                                        index = i;
                                        break;
                                    }
                                }
                                let pData = parseFloat(planYData[index]);
                                let aData = parseFloat(actualValue[index]);
                                // finishPercentage[index]
                                return aData > pData ? "实:" +aData+"\n计:"+ pData: '';
                            },
                        },
                        data: actualValue
                    }
                ]
            };
            let initChart = function (canvas, width, height) {
                const chart = echarts.init(canvas, null, {
                    width:   width,
                    height: height
                });
                canvas.setChart(chart);
                chart.setOption(option);
                return chart;
            }
            _this.setData({
                value_by_month: res.data.items,
                ec: {
                    onInit: initChart
                },
                width: 54 * items.length + 60
            })
        };
        let fail = function (res) {};
        util.getHttp('/v1/projectHomePage/loadValueByMonth', {}, success, fail);
    },


    currentDate: function () {
        let now = new Date();
        let _this = this;
        util.getHttp('/v1/projectHomePage/loadLastTimeByProSid', {}, function (res) {
            _this.setData({
                currentDate: res.data.lastTime
            });
        }, function () {
            _this.setData({
                currentDate: now.getFullYear() + "-" + (now.getMonth() + 1) + '-' + now.getDate()
            });
        });

    },
    go_week: function (e) {
        wx.navigateTo({
            url: e.currentTarget.dataset.url
        });
    }
});
