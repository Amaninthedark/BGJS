
var sendAjax = require('../../util/sendAjax.js')
var App = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    companyId: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    //App.getUserInfo(this)
    var that = this

    // 这个页面暂时不要提示
    wx.setStorageSync('noBindTip', true)
    if (wx.getStorageSync('isLogin') == 1) {
      var getDafualtOpt = {
        url: '/user/account/settings',
        type: 'GET',
        data: {
          _: Date.now()
        }
      }
      var getDafualtCb = {}
      getDafualtCb.success = function (data) {
        if (data.companyId !== 0) {

          wx.setStorageSync("companyId", data.companyId);
          wx.setStorageSync("companyName", data.companyName);
          wx.setNavigationBarTitle({
            title: data.companyName
          });
          that.setData({
            companyId: data.companyId
          })
        }

      }

      sendAjax(getDafualtOpt, getDafualtCb)
    } else {
       
       App.createAuth(this, 2)
    }
    
    // 登录
    // 获取默认
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this;
    var companyId = wx.getStorageSync("companyId");
    if (companyId && companyId !== 0) {
      wx.setNavigationBarTitle({
        title: wx.getStorageSync('companyName')
      });
      
    }
    that.setData({
      companyId: companyId || 0
    })
  },
  handleGoManage: function() {
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
  handleGoCenter() {
    wx.navigateTo({
        url: '/page/user/index'
    })
  },
  toMiniProgram1() {

    wx.showModal({
      title: '订单功能web专享',
      content: 'www.buguanjia.com',
      showCancel: false
    })

  },
  toMiniProgram2() {
   wx.showModal({
     title: '订单功能web专享',
     content: 'www.buguanjia.com',
     showCancel: false
   })
 
  },
  toMiniProgram3() {
      wx.navigateToMiniProgram({
          appId: 'wx23abc6189092f9df',
      })
  },
  toMiniProgram4() {
      wx.navigateToMiniProgram({
          appId: 'wx0e5e88823f2a3222',
      })
  },
  onPullDownRefresh() {
    this.onLoad()
    wx.stopPullDownRefresh();
  },
  handleClickExhibition(e) {
    // var tip = e.currentTarget.dataset.tip
 wx.navigateTo({
   url: '/page/order/order',
 })
  },
  handleClickExhibition_1(e) {
    // var tip = e.currentTarget.dataset.tip
    wx.showModal({
      // content: tip,
      title: '应收功能web专享',
      content: 'www.buguanjia.com',
      showCancel: false
    })
  },
  toContact:function(){
    wx.navigateTo({
      url: '../contact/contact',
    })
  },
  toCustomer:function(){
    wx.navigateTo({
      url: '../customer/customer',
    })
  },
  toBussiness:function(){
    wx.navigateTo({
      url: '../bussoppor/bussoppor',
    })
  },
  toSupplier:function(){
    wx.navigateTo({
      url: '../Supplier/Supplier',
  })}
})