// pages/punch/success.js
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		address: '',
		time: '',
		type: 0
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		this.setData({
			address: decodeURIComponent(options.address),
			time: decodeURIComponent(options.time),
			type: options.type
		})
	},
	back: function () {
		wx.navigateBack();
	}
});