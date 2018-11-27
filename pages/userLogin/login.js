const app = getApp()

Page({
  data: {},

  onLoad: function(params) {
    var me = this;
    var redirectUrl = params.redirectUrl;
    // debugger;
    if (redirectUrl != null && redirectUrl != undefined && redirectUrl != '') {
      redirectUrl = redirectUrl.replace(/#/g, "?");
      redirectUrl = redirectUrl.replace(/@/g, "=");

      me.redirectUrl = redirectUrl;
    }
  },

  // 登录  
  doLogin: function(e) {
    var me = this;
    var formObject = e.detail.value;
    var username = formObject.username;
    var password = formObject.password;

    // 简单验证
    if (username.length == 0 || password.length == 0) {
      wx.showToast({
        title: '用户名或密码不能为空',
        icon: 'none',
        duration: 3000
      })
    } else {
      var serverUrl = app.serverUrl;
      wx.showLoading({
        title: '请稍等...'
      })

      // 调用后端
      wx.request({
        url: serverUrl + '/login',
        method: "POST",
        data: {
          username: username,
          password: password
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: function(result) {
          console.log(result.data);
          wx.hideLoading();
          if (result.data.status == 200) {
            // 登录成功跳转 
            wx.showToast({
              title: '登录成功',
              icon: 'success',
              duration: 2000
            });
            app.userInfo = result.data.data;
            //TODO 跳转页面
          } else if (result.data.status == 500) {
            // 失败弹出框
            wx.showToast({
              title: result.data.msg,
              icon: 'none',
              duration: 3000
            })
          }
        }
      })
    }
  },

  goRegisterPage: function() {
    wx.navigateTo({
      url: '../userRegister/register'
    })
  }
})