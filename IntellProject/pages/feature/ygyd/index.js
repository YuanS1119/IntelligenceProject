let util = require("../../../utils/util.js");
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		buttonClickState: false,
		title: ''
	},

	scanCode: function () {
		let _this = this;
		wx.scanCode({
			success(res) {
				let code = res.result;
				if (_this.data.buttonClickState) return;
				if (code.indexOf('poleId') === -1) {
					wx.showModal({
						content: '二维码错误!',
						showCancel: false
					});
				} else {
                    code = _this.getId(code);
					_this.setData({buttonClickState: true});
					util.getHttp('/v1/installManageCommon/loadPoleQRCodemsg', {poleSid: code}, function (res) {
						_this.setData({buttonClickState: false});
						if (res.data.status == 0) {
							wx.navigateTo({
								url: '/pages/feature/ygyd/info?code=' + code
							});
						} else {
							wx.navigateTo({
								url: '/pages/feature/ygyd/bind?code=' + code
							});
						}
					}, function () {
					});
				}
			}
		})
	},

	scanCodeWeb: function () {
        let _this = this;
		wx.scanCode({
			success(res) {
				let code = res.result;
				if (code.indexOf('poleId') === -1) {
					wx.showModal({
						content: '二维码错误!',
						showCancel: false
					});
				} else {
					wx.navigateTo({
						url: '/pages/feature/ygyd/detail?code=' + _this.getId(code)
					})
				}

			}
		})
	},

	getId: function (str) {
        let arr = str.split('poleId=');
        let code = arr[arr.length - 1];
        arr = code.split('&');
        code = arr[0].replace(/\$/g, "");
        return code;
	}
});