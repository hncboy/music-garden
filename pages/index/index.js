const app = getApp()

Page({
  data: {
    totalPage: 1, //总页数
    page: 1, //当前页数
    videoList: [],

    screenWidth: 350,
    serverUrl: '', //展示图片
    searchContent: ''
  },

  onLoad: function(params) {
    var me = this;
    var screenWidth = wx.getSystemInfoSync().screenWidth;
    me.setData({
      screenWidth: screenWidth,
    });

    var searchContent = params.search;
    var isSaveRecord = params.isSaveRecord;
    if (isSaveRecord == null || isSaveRecord == '' || isSaveRecord == undefined) {
      isSaveRecord = 0;
    }
    me.setData({
      searchContent: searchContent
    })

    //获取当前的分页数
    var page = me.data.page;
    me.getAllVideoList(page, isSaveRecord);
  },

  //获取当前页所有视频
  getAllVideoList: function(page, isSaveRecord) {
    var me = this;
    var serverUrl = app.serverUrl;
    wx.showLoading({
      title: '加载中...'
    })
    var searchContent = me.data.searchContent;

    wx.request({
      url: serverUrl + '/video/showAll?page=' + page + '&isSaveRecord=' + isSaveRecord,
      method: 'POST',
      data: {
        videoDesc: searchContent
      },
      success: function(res) {
        wx.hideLoading();
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();

        console.log(res.data);
        //判断当前页是否是第一页，如果是第一页，那么设置videoList为空
        if (page == 1) {
          me.setData({
            videoList: []
          })
        }

        var videoList = res.data.data.rows;
        var newVideoList = me.data.videoList;
        me.setData({
          videoList: newVideoList.concat(videoList),
          page: page,
          totalPage: res.data.data.total,
          serverUrl: serverUrl
        })
      }
    })
  },

  //下拉刷新
  onPullDownRefrech: function() {
    wx.showNavigationBarLoading();
    this.getAllVideoList(1, 0);
  },

  //上拉刷新
  onReachBottom: function() {
    var me = this;
    var currentPage = me.data.page;
    var totalPage = me.data.totalPage;

    //判断当前页数和总页数是否相等，如果相等则不用查询
    if (currentPage == totalPage) {
      wx.showToast({
        title: '已经是最后一页了',
        icon: 'none'
      })
      return;
    }

    var page = currentPage + 1;
    me.getAllVideoList(page, 0);
  },

  showVideoInfo: function(e) {
    var me = this;
    var videoList = me.data.videoList;
    var arrindex = e.target.dataset.arrindex;
    var videoInfo = JSON.stringify(videoList[arrindex]);

    wx.redirectTo({
      url: '../videoinfo/videoinfo?videoInfo=' + videoInfo
    })
  }
})