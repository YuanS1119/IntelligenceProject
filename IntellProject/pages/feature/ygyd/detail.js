let util = require("../../../utils/util.js");
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		list: [],
		is_loading: 1,
		animationData:  {},
		scroll_top: 0,
		check_image: ''
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		let code = options.code;
		let _this = this;
		util.show_loading('正在加载');
		util.getHttp('/v1/installManageCommon/loadPoleData', {poleSid: code}, function (res) {
			wx.hideLoading();
			_this.setData({
				list: res.items == null || res.items == '' ? [] : res.items,
				is_loading: 0
			})
		})
	},

	onShow: function () {
		this.animation = wx.createAnimation({
			duration: 500,
			timingFunction: 'ease',
		});
	},

	show_image: function (e) {
		this.animation.height('100%').top(0).step()
		this.setData({
			animationData: this.animation.export(),
			check_image: e.currentTarget.dataset.url
		})
	},
	hide_image: function() {
		this.animation.height('0').top('100%').step()
		this.setData({
			animationData: this.animation.export(),
			scroll_top: 0
		})
	}
})