let util = require("../../../utils/util.js");
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		title: ''
	},

	scanCodeWeb: function () {
		wx.scanCode({
			success(res) {
                let code = res.result;
                if (code.indexOf('platformId') === -1) {
                    wx.showModal({
                        content: '二维码错误!',
                        showCancel: false
                    });
                } else {
                    let arr = code.split('platformId=');
                    code = arr[arr.length - 1];
                    arr = code.split('&');
                    code = arr[0].replace(/\$/g, "");
                    wx.navigateTo({
                        url: '/pages/feature/ytyd/detail?code=' + code
                    })
                }
			}
		})
	},

	scanCode: function () {
		let _this = this;
		wx.scanCode({
			success(res) {
				let code = res.result;
				if (code.indexOf('platformId') === -1) {
					wx.showModal({
						content: '二维码错误!',
						showCancel: false
					});
				} else {
					let arr = code.split('platformId=');
					code = arr[arr.length - 1];
					arr = code.split('&');
					code = arr[0].replace(/\$/g, "");
					util.getHttp('/v1/platformShelvesCommon/findPlatformShelvesBySid', {platformSid: code}, function (res) {
						if (res.data.status == 1) {
							util.toast(res.data.statusMsg);
						} else if (res.data.item.isOrNotBinding == '0') {
							wx.navigateTo({
								url: '/pages/feature/ytyd/bind?code=' + code
							});
						} else {
							wx.navigateTo({
								url: '/pages/feature/ytyd/info?code=' + code
							});
						}
					}, function () {
					});

				}
			}
		})
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		this.setData({title: options.name});
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () {

	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {

	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function () {

	},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function () {

	},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: function () {

	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function () {

	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () {

	}
})