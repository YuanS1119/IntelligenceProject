let util = require("../../utils/util.js");
Page({
	data: {
		year: 0,
		month: 0,
		lists: [],
		check_list: null,
		today: ''
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		let date = new Date();
		let year = date.getFullYear(), month = parseInt(date.getMonth() + 1);
		let today = [year, month, date.getDate()].map(function (n) {
			n = n.toString();
			return n[1] ? n : '0' + n
		}).join('-')
		this.setData({
			year: year,
			month: month,
			today: today
		});
		this.getData(year, month);
	},
	getData: function (year, month) {
		let startDate = new Date([year, month, 1].map(function (n) {
			n = n.toString();
			return n[1] ? n : '0' + n
		}).join('/'));
		let endDate = new Date(year, month, 0);
		let getData = {};
		getData.attendanceTimeStart = [year, month, 1].map(function (n) {
			n = n.toString();
			return n[1] ? n : '0' + n
		}).join('-');
		getData.attendanceTimeEnd = [endDate.getFullYear(), month, endDate.getDate()].map(function (n) {
			n = n.toString();
			return n[1] ? n : '0' + n
		}).join('-');
		let i;
		let lists = [];
		for (i = 0; i < startDate.getDay(); i++) {
			lists.push({
				day: '',
				date: 'last' + i,
				data: [],
				index: lists.length
			})
		}
		let date;
		for (i = 1; i <= endDate.getDate(); i++) {
			date = [year, month, i].map(function (n) {
				n = n.toString();
				return n[1] ? n : '0' + n
			}).join('-');
			lists.push({
				day: i < 10 ? '0' + i : i,
				date: date,
				data: [],
				index: lists.length,
				today: date == this.data.today ? 1 : 0,
				checked: date == this.data.today ? 1 : 0
			});
		}
		for (i = endDate.getDay(); i < 6; i++) {
			lists.push({
				day: '',
				date: 'next' + i,
				data: [],
				index: lists.length
			})
		}
		this.setData({
			lists: lists
		});
		let _this = this;
		util.getHttp('/v1/common/findAttendanceList', getData, function (res) {
			if (res.data.status == 0) {
				let items = res.data.items;
				let key,item, new_list = {};
				for (key in lists) {
					new_list[lists[key].date] = lists[key];
				}
				for (key in items) {
					item = items[key];
					let attendance_date = item.attendanceTime.split(' ')[0];
					if (new_list[attendance_date] != undefined) {
						new_list[attendance_date].data.push(item);
					}
				}
				lists = [];
				let check_list = null;
				for (key in new_list) {
					item = new_list[key];
					lists.push(item);
					if (item.checked) {
						check_list = item;
					}
				}
				console.log(check_list);
				_this.setData({
					lists: lists,
					check_list: check_list
				});
			}
		}, function () {
			wx.hideLoading();
		});
	},

	changeDate: function (e) {
		let arr = e.detail.value.split('-');
		let year = arr[0], month = arr[1];
		if (year == this.data.year && month == this.data.month) {
			return;
		}
		this.setData({
			year: year,
			month: month,
			check_list: null
		});
		this.getData(year, month);
	},
	click_item: function (e) {
		console.log(e.target.dataset.index);
		let check_item = this.data.lists[e.target.dataset.index];
		if (check_item.day != '' && this.data.check_list != check_item) {
			this.setData({
				check_list: check_item
			})
		}
	}
});