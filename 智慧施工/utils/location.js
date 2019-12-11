function location(callback) {
	wx.getSetting({
		success: function (res) {
			let location_state = res.authSetting['scope.userLocation'];
			if (location_state == false) {
				wx.showModal({
					title: '是否授权当前位置',
					content: '需要获取您的地理位置，请确认授权，否则无法获取您所需数据',
					success: function (res) {
						if (res.cancel) {
							wx.showToast({
								title: '授权失败',
								icon: 'success',
								duration: 1000
							})
						} else if (res.confirm) {
							wx.openSetting({
								success: function (dataAu) {
									if (dataAu.authSetting["scope.userLocation"] == true) {
										if (typeof callback == 'function') {
											callback();
										}
									} else {
										wx.showToast({
											title: '授权失败',
											icon: 'success',
											duration: 1000
										})
									}
								}
							})
						}
					}
				});
			} else {
				if (typeof callback == 'function') {
					callback();
				}
			}
		}
	})
}

module.exports = {
	location: location
};