let util = require("./utils/util.js");
App({
    onLaunch: function () {

    },
    globalData: {
        functions: [
            {
                title: '施工生产',
                lists: [
                    { img: '/images/icon_project_plan.png', name: '进度管理', url: '/pages/sgjd/index' },
                    { img: '/images/icon_construction_manage.png', name: '智能安装', url: '/pages/feature/construction/index' },
                    { img: '/images/yupei.png', name: '预配管理', url: '' },
                    { img: '/images/icon_construction_wz.png', name: '智能物资', url: '' },
                    { img: '/images/azgl.png', name: '安质管理', url: '/pages/azgl/index' },
                    { img: '/images/icon_record.png', name: '一杆一档', url: '/pages/feature/ygyd/index' },
                    { img: '/images/icon_tai.png', name: '一台一档', url: '/pages/feature/ytyd/index' },
                    { img: '/images/labor.png', name: '劳动力管理', url: '/pages/labor/index' },
                    { img: '/images/sgrz.png', name: '施工日志', url: '' },
                    { img: '/images/jsjd.png', name: '技术交底', url: '' },
                    { img: '/images/jsbz.png', name: '技术标准', url: '' },
                    { img: '/images/xcgl.png', name: '巡查管理', url: '' },
                ]
            },
            {
                title: '综合管理',
                lists: [
                    { img: '/images/icon_news.png', name: '项目快讯', url: '/pages/xmkx/function' },
                    { img: '/images/tab_addressbook_select.png', name: '通讯录', url: '/pages/address_book/index' },{}
                ]
            },

        ]
    }
});