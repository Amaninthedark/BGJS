var app = getApp()
var url = require('../../config.js')
// var QR = require("../../util/qrcode.js");
// var Base64 = require('../../util/base64_decode.js') 
Page({
  data: {
    userName: '知布布管家',
    avatar: '/image/person.png',
    flag: true

  },
  onLoad() {
    this.videoContext = wx.createVideoContext('myVideo');
    if (wx.getStorageSync('isLogin') != 1) {
      app.createAuth(this, 2)
    }
    if (wx.getStorageSync('nickName') || wx.getStorageSync('avatar')) {
      this.setData({
        userName: wx.getStorageSync('nickName'),
        avatar: wx.getStorageSync('avatar')
      })
    }
  },
  onShow() {
    this.setData({
      userName: wx.getStorageSync('nickName'),
      avatar: wx.getStorageSync('avatar')
    })
    console.log('头像:' + wx.getStorageSync('avatar'))
  },
  //  onPullDownRefresh:function(){
  //     this.onLoad();
  //     wx.stopPullDownRefresh();

  // },
  // toBig(){
  //     var img=this.data.qrUrl
  //     var urls=[]
  //     urls.push(img)
  //     wx.previewImage({
  //         current:img,
  //         urls:urls
  //     })
  // },
  //     onShareAppMessage: function () {
  //         return {
  //         title: wx.getStorageSync('nickName')+'的名片，请惠存',
  //         path: '/page/card/index'
  //         }
  //   }
  toMiniProgram1() {

    wx.navigateToMiniProgram({
      appId: 'wx0a4aff7f2a32dee3',
    })
  },
  toMiniProgram2() {
    wx.navigateToMiniProgram({
      appId: 'wx751090ebc13e9e10',
    })
  },
  toCard() {
    if (wx.getStorageSync("isBind") != 1) {
      wx.showModal({
        title: '绑定手机',
        content: '检测到您的账号还未绑定手机号,请绑定手机号',
        confirmText: '绑定手机',
        confirmColor: "#56a4ff",
        success: function(res) {
          if (res.confirm) {

            wx.navigateTo({
              url: '/page/user/pages/bindPhone/bindPhone'

            })

          }
        }
      })
      return
    }
    wx.navigateTo({
      url: '/page/user/pages/card/card'
    });
  },
  toCompany() {
    if (wx.getStorageSync("isBind") != 1) {
      wx.showModal({
        title: '绑定手机',
        content: '检测到您的账号还未绑定手机号,请绑定手机号',
        confirmText: '绑定手机',
        confirmColor: "#56a4ff",
        success: function(res) {
          if (res.confirm) {

            wx.navigateTo({
              url: '/page/user/pages/bindPhone/bindPhone'

            })

          }
        }
      })
      return
    }

    wx.redirectTo({
      url: '/page/sample/index'
    });
  },
  toShareToMe() {
    if (wx.getStorageSync("isBind") != 1) {
      wx.showModal({
        title: '绑定手机',
        content: '检测到您的账号还未绑定手机号,请绑定手机号',
        confirmText: '绑定手机',
        confirmColor: "#56a4ff",
        success: function(res) {
          if (res.confirm) {

            wx.navigateTo({
              url: '/page/user/pages/bindPhone/bindPhone'

            })

          }
        }
      })
      return
    }
    wx.navigateTo({
      url: '/page/share/sample/shareToMe/shareToMe'
    });
  },

  handleGoIndex: function() {
    wx.navigateBack()
  },
  handleGoManage: function () {
    var that = this
    if (wx.getStorageSync("isBind") != 1) {
      wx.showModal({
        title: '绑定手机',
        content: '检测到您的账号还未绑定手机号,请绑定手机号',
        confirmText: '绑定手机',
        confirmColor: "#56a4ff",
        success: function (res) {
          if (res.confirm) {

            wx.navigateTo({
              url: '/page/user/pages/bindPhone/bindPhone'

            })

          }
        }
      })
      return
    }
    if (that.data.companyId !== 0) {
      wx.navigateTo({
        url: '/page/sample/pages/sampleList/sampleList',
      })
    } else {
      wx.navigateTo({
        url: '/page/sample/index',
      })
    }
  },
  toMiniProgram1() {

    wx.showModal({
      title: '订单功能web专享',
      content: 'www.buguanjia.com',
      showCancel: false
    })

  },
  /**
   * 播放视频
   */
  handlePlayvideo: function() {
wx.navigateTo({
  url: '/page/goodwx/goodwx',
})

  },
  hideModel: function(e) {

    if (Number(e.target.dataset.close)) {
      this.setData({
        flag: true
      })

      this.videoContext.pause();
    }
  }
})