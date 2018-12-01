const app = getApp()

Page({
  data: {
    cover: 'cover'
  },

  videoCtx: {

  },

  onLoad: function() {
    var me = this;
    me.videoCtx = wx.createVideoContext('myVideo', this);
  },

  onShow: function() {
    var me = this
    me.videoCtx.play();
  },

  onHide: function() {
    var me = this
    me.videoCtx.pause();
  },

  showSearch: function() {
    wx.navigateTo({
      url: '../searchVideo/searchVideo',
    })
  }
})