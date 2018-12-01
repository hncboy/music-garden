var videoUtil = require('../../utils/videoUtil.js');

const app = getApp()

Page({
  data: {
    cover: 'cover',
    videoId: '',
    src: '',
    videoInfo: {},
    serverUrl: '',
    userLikeVideo: false
  },

  videoCtx: {},

  onLoad: function(params) {
    var me = this;
    me.videoCtx = wx.createVideoContext('myVideo', me); //获取视频的全局对象

    //获取上一个页面传入的参数
    var videoInfo = JSON.parse(params.videoInfo);

    var height = videoInfo.videoHeight;
    var width = videoInfo.videoWidth;
    var cover = 'cover';
    if (width >= height) {
      cover = '';
    }

    me.setData({
      videoId: videoInfo.id,
      src: app.serverUrl + videoInfo.videoPath,
      videoInfo: videoInfo
    })

    var user = app.getGlobalUserInfo();
    var serverUrl = app.serverUrl;
    var loginUserId = '';
    if (user != null && user != undefined && user != '') {
      loginUserId = user.id;
    }

    wx.request({
      url: serverUrl + '/user/queryPublisher?loginUserId=' + loginUserId + '&videoId=' + videoInfo.id + '&publishUserId=' + videoInfo.userId,
      method: 'POST',
      success: function(res) {
        var publisher = res.data.data.publisher;
        var userLikeVideo = res.data.data.userLikeVideo;

        me.setData({
          serverUrl: serverUrl,
          publisher: publisher,
          userLikeVideo: userLikeVideo
        })
      }
    })
  },

  onShow: function() {
    var me = this
    me.videoCtx.play(); //播放
  },

  onHide: function() {
    var me = this
    me.videoCtx.pause(); //暂停
  },

  //跳转到搜索页面
  showSearch: function() {
    wx.navigateTo({
      url: '../searchVideo/searchVideo',
    })
  },

  //查看发布人信息
  showPublisher: function() {
    var me = this;
    var user = app.getGlobalUserInfo();
    var videoInfo = me.data.videoInfo;
    var realUrl = '../mine/mine#publisherId@' + videoInfo.userId;

    if (user == null || user == undefined || user == '') {
      wx.navigateTo({
        url: '../userLogin/login?redirectUrl=' + realUrl,
      })
    } else {
      wx.navigateTo({
        url: '../mine/mine?publisherId=' + videoInfo.userId
      })
    }
  },

  upload: function() {
    var me = this;
    var user = app.getGlobalUserInfo();

    var videoInfo = JSON.stringify(me.data.videoInfo);
    var realUrl = '../videoinfo/videoinfo#videoInfo@' + videoInfo;

    if (user == null || user == undefined || user == '') {
      wx.navigateTo({
        url: '../userLogin/login?redirectUrl=' + realUrl,
      })
    } else {
      videoUtil.uploadVideo();
    }
  },

  //返回主页
  showIndex: function() {
    wx.redirectTo({
      url: '../index/index'
    })
  },

  //跳转到个人信息页面
  showMine: function() {
    var user = app.getGlobalUserInfo();
    if (user == null || user == undefined || user == '') {
      wx.navigateTo({
        url: '../userLogin/login',
      })
    } else {
      wx.navigateTo({
        url: '../mine/mine'
      })
    }
  },

  //点赞或取消点赞
  likeVideoOrNot: function() {
    var me = this;
    var videoInfo = me.data.videoInfo;
    var user = app.getGlobalUserInfo();

    if (user == null || user == undefined || user == '') {
      wx.navigateTo({
        url: '../userLogin/login',
      })
    } else {
      var userLikeVideo = me.data.userLikeVideo;
      var url = '/video/userLike?userId=' + user.id + '&videoId=' + videoInfo.id + '&videoCreatorId=' + videoInfo.userId;
      if (userLikeVideo) {
        url = '/video/userUnLike?userId=' + user.id + '&videoId=' + videoInfo.id + '&videoCreatorId=' + videoInfo.userId;
      }
      var serverUrl = app.serverUrl;
      wx.showLoading({
        title: '...',
      })
      wx.request({
        url: serverUrl + url,
        method: "POST",
        header: {
          'content-type': 'application/json', // 默认值
          'headerUserId': user.id,
          'headerUserToken': user.userToken
        },
        success: function(res) {
          wx.hideLoading();
          me.setData({
            userLikeVideo: !userLikeVideo
          })
        }
      })
    }
  }
})