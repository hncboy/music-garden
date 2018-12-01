const app = getApp()

Page({
  data: {
    faceUrl: "../resource/images/noneface.png",
  },

  //初始化用户信息
  onLoad: function() {
    var me = this;
    //var user = app.userInfo;
    //fixme 修改原有的全局对象为本地缓存
    var user = app.getGlobalUserInfo();
    var serverUrl = app.serverUrl;
    wx.showLoading({
      title: '请稍等...'
    })
    //调用后端
    wx.request({
      url: serverUrl + '/user/query?userId=' + user.id,
      method: "POST",
      header: {
        'content-type': 'application/json' // 默认值
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
            nickname: userInfo.nickname
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
            'content-type': 'application/json' // 默认值
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