let QQMapWX = require('../../libs/qqmap/qqmap-wx-jssdk.js');
let qqmapsdk;
let util = require("../../utils/util.js");
let location = require("../../utils/location.js");
Page({
	data: {
		address: '',
		time: '',
		lastInfo: ''
	},
	onLoad: function (options) {
		qqmapsdk = new QQMapWX({
			key: '5XJBZ-LZSLO-CFSWA-SMZJW-VWR72-H3BB5'
		});
		this.getLocation();
	},

	getLocation: function () {
		let _this = this;
		location.location(function () {
			wx.getLocation({
				type: 'gcj02', //返回可以用于wx.openLocation的经纬度
				altitude: true,
				success: function (res) {
					console.log(res)
					qqmapsdk.reverseGeocoder({
						location: {
							latitude: res.latitude,
							longitude: res.longitude
						},
						success: function (res) {
							_this.setData({
								address: res.result.address
							});
						},
						fail: function (res) {
							util.toast('定位失败');
						}
					})
				},
				fail: function (res) {
					console.log(res);
					util.toast('定位失败');
				}
			});
		});
	},

	onShow: function () {
		let _this = this;
		_this.setData({
			time: _this.formatTime(new Date())
		});
		let timer = setInterval(function () {
			_this.setData({
				time: _this.formatTime(new Date())
			});
		}, 1000);
		this.getInfo();
	},

	getInfo: function () {
		let _this = this;
		util.getHttp('/v1/common/findLastAttendance', {}, function (res) {
			if (res.data.status == 0) {
				_this.setData({
					lastInfo: res.data.item
				});
			}

		}, function () {
			wx.hideLoading();
		});
	},

	formatTime: (date, type = 0) => {
		const year = date.getFullYear()
		const month = date.getMonth() + 1
		const day = date.getDate();
		const hour = date.getHours();
		const minute = date.getMinutes();
		const second = date.getSeconds();
		return (type == 0 ? '' : [year, month, day].map(function (n) {
			n = n.toString()
			return n[1] ? n : '0' + n
		}).join('-') + ' ') + [hour, minute, second].map(function (n) {
			n = n.toString()
			return n[1] ? n : '0' + n
		}).join(':')
	},

	do_dk: function (e) {
		util.show_loading('正在打卡，请稍后');

		let postData = {
			attendanceSite: this.data.address,
			attendanceTime: this.formatTime(new Date(), 1),
			attendanceType: e.target.dataset.type
		};
		util.postHttp('/v1/common/saveAttendance', postData, function (res) {
			wx.hideLoading();
			if (res.data.status == 0) {
				wx.navigateTo({
					url: '/pages/punch/success?address=' + postData.attendanceSite + '&time=' +
						postData.attendanceTime + '&type=' + postData.attendanceType
				})
			} else {
				util.toast(res.data.statusMsg);
			}
		}, function () {
			wx.hideLoading();
			_this.setSubmitState(0);
		});
	}
});