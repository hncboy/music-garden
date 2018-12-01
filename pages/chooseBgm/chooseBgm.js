const app = getApp()

Page({
  data: {
    bgmList: [],
    serverUrl: '',
    videoParams: {}
  },

  onLoad: function(params) {
    var me = this;
    var serverUrl = app.serverUrl;
    me.setData({
      videoParams: params
    })

    wx.showLoading({
      title: '请稍等...'
    })
    //调用后端
    wx.request({
      url: serverUrl + '/bgm/list',
      method: "POST",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function(res) {
        wx.hideLoading();
        if (res.data.status == 200) {
          var bgmList = res.data.data;
          console.log(bgmList);
          me.setData({
            bgmList: bgmList,
            serverUrl: serverUrl
          })
        }
      }
    })
  },

  //上传视频
  upload: function(e) {
    var me = this;
    var bgmId = e.detail.value.bgmId;
    var desc = e.detail.value.desc;
    var duration = me.data.videoParams.duration;
    var tmpHeight = me.data.videoParams.tmpHeight;
    var tmpWidth = me.data.videoParams.tmpWidth;
    var tmpVideoUrl = me.data.videoParams.tmpVideoUrl;
    var tmpCoverUrl = me.data.videoParams.tmpCoverUrl;

    wx.showLoading({
      title: '上传中...'
    })
    var serverUrl = app.serverUrl;
    //fixme 修改原有的全局对象为本地缓存
    var userInfo = app.getGlobalUserInfo();
    //上传短视频
    wx.uploadFile({
      url: serverUrl + '/video/upload',
      formData: {
        userId: userInfo.id, //fixme 原来的 app.userInfo.id
        bgmId: bgmId,
        desc: desc,
        videoSeconds: duration,
        videoHeight: tmpHeight,
        videoWidth: tmpWidth
      },
      filePath: tmpVideoUrl,
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
          //返回到上个页面
          wx.navigateBack({
            delta: 1,
          })
          // 在手机上失效
          // var videoId = data.data;
          // wx.showLoading({
          //   title: '上传中...'
          // })
          // //上传封面
          // wx.uploadFile({
          //   url: serverUrl + '/video/uploadCover',
          //   formData: {
          //     userId: app.userInfo.id,
          //     videoId: videoId
          //   },
          //   filePath: tmpCoverUrl,
          //   name: 'file',
          //   header: {
          //     'content-type': 'application/json' // 默认值
          //   },
          //   success(res) {
          //     const data = JSON.parse(res.data);
          //     wx.hideLoading();
          //     if (data.status == 200) {
          //       wx.showToast({
          //         title: '上传成功',
          //         icon: 'success'
          //       })
          //       //返回到上个页面
          //       wx.navigateBack({
          //         delta: 1,
          //       })
          //     } else {
          //       wx.showToast({
          //         title: '上传失败',
          //         icon: 'success'
          //       })
          //     }
          //   }
          // })
        } else {
          wx.showToast({
            title: '上传失败',
            icon: 'success'
          })
        }
      }
    })
  }
})