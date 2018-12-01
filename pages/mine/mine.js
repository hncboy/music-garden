var videoUtil = require('../../utils/videoUtil.js');

const app = getApp()

Page({
  data: {
    faceUrl: "../resource/images/noneface.png",
    isMe: true,
    isFollow: false,
    publisherId: ''
  },

  //初始化用户信息
  onLoad: function(params) {
    var me = this;
    var publisherId = params.publisherId;
    //var user = app.userInfo;
    //fixme 修改原有的全局对象为本地缓存
    var user = app.getGlobalUserInfo();
    var userId = user.id;
    var serverUrl = app.serverUrl;

    if (publisherId != null && publisherId != '' && publisherId != undefined) {
      //查询发布者信息
      userId = publisherId;
      me.setData({
        isMe: false,
        publisherId: publisherId
      })
    }

    wx.showLoading({
      title: '请稍等...'
    })
    //调用后端
    wx.request({
      url: serverUrl + '/user/query?userId=' + userId + '&fanId=' + user.id,
      method: "POST",
      header: {
        'content-type': 'application/json', // 默认值
        'headerUserId': user.id,
        'headerUserToken': user.userToken
      },
      success: function(res) {
        wx.hideLoading();
        if (res.data.status == 200) {
          var userInfo = res.data.data;
          var faceUrl = "../resource/images/noneface.png";
          if (userInfo.faceImage != null && userInfo.faceImage != '' && userInfo.faceImage != undefined) {
            faceUrl = serverUrl + userInfo.faceImage;
          }

          me.setData({
            faceUrl: faceUrl,
            fansCounts: userInfo.fansCounts,
            followCounts: userInfo.followCounts,
            receiveLikeCounts: userInfo.receiveLikeCounts,
            nickname: userInfo.nickname,
            isFollow: userInfo.follow
          })
        } else if (res.data.status == 502) {
          wx.showToast({
            title: res.data.msg,
            duration: 3000,
            icon: 'none',
            success: function() {
              wx.redirectTo({
                url: '../userLogin/login'
              })
            }
          })
        }
      }
    })
  },

  //关注或取消关注
  followMe: function(e) {
    var me = this;
    var user = app.getGlobalUserInfo();
    var userId = user.id;
    var publisherId = me.data.publisherId;

    var followType = e.currentTarget.dataset.followtype;
    //1：关注 0：取消关注
    var url = '';
    if (followType == '1') {
      url = '/user/beyourfans?userId=' + publisherId + '&fanId=' + userId;
    } else if (followType == '0') {
      url = '/user/dontbeyourfans?userId=' + publisherId + '&fanId=' + userId;
    }

    wx.showLoading()
    wx.request({
      url: app.serverUrl + url,
      method: 'POST',
      header: {
        'content-type': 'application/json', // 默认值
        'headerUserId': user.id,
        'headerUserToken': user.userToken
      },
      success: function() {
        wx.hideLoading();
        if (followType == '1') {
          me.setData({
            isFollow: true,
            fansCounts: ++me.data.fansCounts
          })
        } else if (followType == '0') {
          me.setData({
            isFollow: false,
            fansCounts: --me.data.fansCounts
          })
        }
      }
    })
  },

  //注销
  logout: function() {
    //var user = app.userInfo;
    var user = app.getGlobalUserInfo();
    var serverUrl = app.serverUrl;
    wx.showLoading({
      title: '请稍等...'
    })
    //调用后端
    wx.request({
      url: serverUrl + '/logout?userId=' + user.id,
      method: "POST",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function(res) {
        wx.hideLoading();
        if (res.data.status == 200) {
          wx.showToast({
            title: '注销成功',
            icon: 'success',
            duration: 2000
          });
          // app.userInfo = null;
          //fixme 注销以后，清空缓存
          wx.removeStorageSync('userInfo');

          //页面跳转
          wx.navigateTo({
            url: '../userLogin/login'
          })
        }
      }
    })
  },

  //修改头像
  changeFace: function() {
    var me = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album'], //从相册选择
      success(res) {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths;
        wx.showLoading({
          title: '上传中...'
        })
        var serverUrl = app.serverUrl;
        //fixme 修改原有的全局对象为本地缓存
        var userInfo = app.getGlobalUserInfo();
        //上传头像
        wx.uploadFile({
          url: serverUrl + '/user/uploadFace?userId=' + userInfo.id, //app.userInfo.id
          filePath: tempFilePaths[0],
          name: 'file',
          header: {
            'content-type': 'application/json', // 默认值
            'headerUserId': userInfo.id,
            'headerUserToken': userInfo.userToken
          },
          success(res) {
            const data = JSON.parse(res.data);
            wx.hideLoading();
            if (data.status == 200) {
              wx.showToast({
                title: '上传成功',
                icon: 'success'
              })

              var imageUrl = data.data;
              me.setData({
                faceUrl: serverUrl + imageUrl
              })
            } else if (data.status == 500) {
              wx.showToast({
                title: data.msg
              })
            }
          }
        })
      }
    })
  },

  //上传作品
  uploadVideo: function() {
    //videoUtil.uploadVideo();
    var me = this;
    wx.chooseVideo({
      sourceType: ['album'],
      success(res) {
        var duration = res.duration;
        var tmpHeight = res.height;
        var tmpWidth = res.width;
        var tmpVideoUrl = res.tempFilePath;
        var tmpCoverUrl = res.thumbTempFilePath;

        if (duration > 11) {
          wx.showToast({
            title: '视频长度不能超过10秒',
            icon: 'none',
            duration: 2500
          })
        } else if (duration < 1) {
          wx.showToast({
            title: '视频长度不能小于1秒',
            icon: 'none',
            duration: 2500
          })
        } else {
          //打开选择bgm的页面
          wx.navigateTo({
            url: '../chooseBgm/chooseBgm?duration=' + duration +
              "&tmpHeight=" + tmpHeight +
              "&tmpWidth=" + tmpWidth +
              "&tmpVideoUrl=" + tmpVideoUrl +
              "&tmpCoverUrl=" + tmpCoverUrl
          })
        }
      }
    })
  }
})