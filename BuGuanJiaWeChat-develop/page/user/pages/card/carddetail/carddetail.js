// pages/user/carddetail/carddetail.js
let Api = require('../../../../../config.js')
let app = getApp();

Page({

   /**
    * 页面的初始数据
    */
   data: {
      userinfo: {},
      codeurl: ''
   },

   /**
    * 生命周期函数--监听页面加载
    */
   onLoad: function (options) {
      var that = this;
      that.setData({
         userinfo: wx.getStorageSync("user")
      });
      wx.request({
         url: Api.codeUrl,
         method: 'POST',
         header: {
            authorization: wx.getStorageSync('authorization')
         },
         data: {
           scene: `/page/user/pages/card/card?userKey=${wx.getStorageSync("userKey")}`,
            type: 0
         },
         success: function (res) {
            console.log(res)
            if (res.data.code == '200') {
               that.setData({
                  codeurl: res.data.codeUrl
               })
            }
            else if (res.data.code == '401') {
               wx.showModal({
                  title: '提示',
                  content: '用户信息过期,点击重新获取',
                  showCancel: false,
                  success: function (res) {
                     if (res.confirm) {
                        app.toSampleIndex();
                     }
                  }
               });
            }
            else {
               wx.showModal({
                  title: '提示',
                  content: res.code.data,
                  showCancel: false
               })
            }
         }
      })
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

   },

   /**
    * 生命周期函数--监听页面隐藏
    */
   onHide: function () {

   },

   /**
    * 生命周期函数--监听页面卸载
    */
   onUnload: function () {

   },

   /**
    * 页面相关事件处理函数--监听用户下拉动作
    */
   onPullDownRefresh: function () {

   },

   /**
    * 页面上拉触底事件的处理函数
    */
   onReachBottom: function () {

   },

   /**
    * 用户点击右上角分享
    */
   onShareAppMessage: function () {

   }
})