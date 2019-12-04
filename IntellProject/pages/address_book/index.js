let util = require("../../utils/util.js");
const itemHeight = 55;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        users: [],
        lists: [],
        keyword: '',
        now_code: '',
        toView: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

    },

    onReady: function () {
        this.getBooks();
    },

    getBooks: function () {
        let _this = this;
        let success = function (res) {
            if (res.data.status != 0) {
                util.toast(res.data.statusMsg);
                return;
            }
            let lists = res.data.userDetailInfos;
            let code, info, index;
            let users = [];
            for (let i = 0; i < 26; i++) {
                users.push({
                    code: String.fromCharCode(65 + i),
                    lists: [],
                    top: 0
                });
            }
            for (let key in lists) {
                info = lists[key];
                let index = info.code.substr(0, 1).toLocaleUpperCase().charCodeAt() - 65;
                users[index].lists.push({
                    id: info.id,
                    name: info.name,
                    py: info.code
                })
            }
            let top = 0;
            let format_user = _this.format_users(users);
            _this.setData({
                users: format_user.users,
                lists: format_user.users,
                now_code: format_user.now_code
            });
        };
        let fail = function (res) {};
        util.getHttp('/v1/addressBook/getAddressBookList', {}, success, fail);
    },

    setKeyword :function (e) {
        let users = [],lists = this.data.lists;
        let value = e.detail.value;
        if (value == '') {
            users = lists;
        } else {
            let item;
            for (let key in lists) {
                item = {
                    code: lists[key].code,
                    lists: [],
                    top: 0
                };
                for (let key1 in lists[key].lists) {
                    if (lists[key].lists[key1].py.indexOf(value) > -1 || lists[key].lists[key1].name.indexOf(value) > -1) {
                        item.lists.push(lists[key].lists[key1]);
                    }
                }
                users.push(item);
            }
        }
        let format_user = this.format_users(users);
        this.setData({
            users: format_user.users,
            now_code: format_user.now_code,
            toView: 'box' + format_user.now_code
        });
    },

    format_users: function (users) {
        let top = 0,now_code = '';
        for (let key in users) {
            users[key].top = top;
            if (users[key].lists.length > 0) {
                top += 30 + itemHeight * users[key].lists.length;
                if (now_code == '') {
                    now_code = users[key].code;
                }
            }
        }
        return {
            now_code: now_code,
            users: users
        }
    },

    scroll: function (e) {
        let top = parseInt(e.detail.scrollTop);
        let users = this.data.users;
        let user = '';
        for (let i = 0,l = users.length; i < l - 1;i++) {
            if (users[i].lists.length == 0) continue;
            if (users[i].top > top) {break}
            user = users[i];
        }
        this.setData({
            now_code: user.code
        });
    },

    check_item: function (e) {
        let index = e.currentTarget.dataset.index;
        let users = this.data.users;
        let user = users[index];
        if (user.lists.length == 0) {
            for (let i = index,l = users.length; i < l - 1;i++) {
                if (users[i].lists.length > 0) {
                    user = users[i];
                    break;
                }
            }
        }
        this.setData({
            toView: 'box' + user.code,
            now_code: user.code
        })
    }
});