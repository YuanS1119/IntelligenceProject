let baseUrls = {
    'ty': 'https://pe.smartcloudbiz.com:10095/api/webapi',//体验环境
    'prod': 'https://api.smartcloudbiz.com:32003/api/webapi',//正式
    'dev': 'http://123.127.162.33:9092/api/webapi' //测试
};
let env = 'ty';
// let env = 'prod';
let noProjectIdUrl = [
    baseUrls[env] + '/v1/user/login',
    baseUrls[env] + '/v1/installManageCommon/saveOrUpdateInstallConsume'
];
function getUserProject(callback) {
    getHttp('/v1/common/findProjectListByUserId', {}, function (res) {
        let local_project = wx.getStorageSync('local_project');
        local_project = local_project == '' ? '' : JSON.parse(local_project);
        let projectList = res.data.projectList;
        let isValid = false;
        let default_project = projectList[0];
        for (let key in projectList) {
            if (local_project != '' && projectList[key].projectSid == local_project.projectSid) {
                isValid = true;
                break;
            }
            if (projectList[key].isDefault == 0) {
                default_project = projectList[key];
            }
        }
        if (local_project == '' || isValid == false) {
            local_project = default_project;
        }
        if (local_project.projectAbbreviation == '' || local_project.projectAbbreviation == null) {
            local_project.projectAbbreviation = local_project.projectName;
        }
        // debugger
        wx.setStorageSync('local_project', JSON.stringify(local_project));
        if (callback != undefined) {
            callback(res, local_project);
        }
    }, function () {

    });
}

function helpHttp(method, url, pam, callback, failback) {
    url = baseUrls[env] + url;
    let header = {
        'content-type' : 'application/json'
    };
    if (wx.getStorageSync('openid') != '') {
        header.userToken = '$$WX$$' + wx.getStorageSync('openid');
    }
    if (wx.getStorageSync('local_project') != '' && noProjectIdUrl.indexOf(url) == -1) {
        let local_project = JSON.parse(wx.getStorageSync('local_project'));
        if (method == 'GET' && pam.projectSid == undefined) {
            pam.projectSid = local_project.projectSid;
        } else if (method == 'POST' && pam.data.projectSid == undefined) {
            pam.data.projectSid = local_project.projectSid;
        }
    }
    if (pam.hasOwnProperty('jsCode')) {
        header.jsCode = pam.jsCode;
    }
    wx.request({
        url: url,
        data: pam,
        method: method,
        header: header,
        success: function (res) {
            // debugger;
            if (res.data.retCode != 0) {
                toast('接口请求失败');
                return;
            }
            callback && callback(res.data);
        },
        fail: function (res) {

        }
    });
}

//get请求
function getHttp(url, pam, callback, failback) {
    helpHttp('GET', url, pam, callback, failback)
}

//post请求
function postHttp(url, pam, callback, failback) {
    helpHttp('POST', url, { data: pam }, callback, failback)
}

function checkLogin(callback) {
    getHttp('/v1/user/findBindingStatusByOpenId', {},
        function (res) {
            // debugger;
            console.log(res)
            if (res.retCode != 0 || res.data.bindingStatus != 0) {
                wx.reLaunch({
                    url: '/pages/user/login'
                })
            } else {
                // debugger
                getUserProject(callback);
            }
        }, function () {

        }
    );
}

function toast(txt) {
    wx.showToast({
        icon: 'none',
        title: txt
    });
    setTimeout(function () {
        wx.hideToast();
    }, 1500);
}

function success(txt,callback) {
    wx.showToast({
        title: txt
    });
    setTimeout(function () {
        if (callback != undefined) {
            callback();
        } else {
            wx.hideToast();
        }
    }, 1000);
}

/** 
 * 时间戳转化为年 月 日 时 分 秒 
 * number: 传入时间戳 
 * format：返回格式，支持自定义，但参数必须与formateArr里保持一致 
*/
function formatTime(number, format) {
    var formateArr = ['Y', 'm', 'd', 'H', 'i', 's'];
    var returnArr = [];
    var date = new Date(number);
    returnArr.push(date.getFullYear());
    returnArr.push(formatNumber(date.getMonth() + 1));
    returnArr.push(formatNumber(date.getDate()));

    returnArr.push(formatNumber(date.getHours()));
    returnArr.push(formatNumber(date.getMinutes()));
    returnArr.push(formatNumber(date.getSeconds()));

    for (var i in returnArr) {
        format = format.replace(formateArr[i], returnArr[i]);
    }
    return format;
}

function show_loading(msg) {
    wx.showLoading({
        title: msg,
        mask: true
    });
}

function formatNumber(n) {
    n = n.toString()
    return n[1] ? n : '0' + n
}

function uploadPicture(callback) {
    let local_project = wx.getStorageSync('local_project');
    let projectSid = '';
    if (local_project != '') {
        local_project = JSON.parse(local_project);
        projectSid = local_project.projectSid;
    }
    let url = baseUrls[env] + '/v1/projectNewMsgCommon/uploadPicture';
    wx.chooseImage({
        count: 1,
        success (res) {
            const tempFilePaths = res.tempFilePaths;
            wx.uploadFile({
                url: url, //仅为示例，非真实的接口地址
                filePath: tempFilePaths[0],
                name: 'file',
                header: {
                    userToken: '$$WX$$' + wx.getStorageSync('openid')
                },
                formData: {
                    'projectSid': projectSid
                },
                success (res){
                    let data = JSON.parse(res.data);
                    if (data.retCode != 0) {
                        toast('接口请求失败');
                        return;
                    }
                    callback && callback(data,tempFilePaths[0]);
                }
            })
        }
    })
}
module.exports = {
    getHttp: getHttp,
    postHttp: postHttp,
    checkLogin: checkLogin,
    toast: toast,
    success: success,
    formatTime: formatTime,
    getUserProject: getUserProject,
    uploadPicture: uploadPicture,
    show_loading: show_loading
};