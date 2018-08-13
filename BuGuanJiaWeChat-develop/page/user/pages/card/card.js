// pages/user/card/card.js
let Api = require('../../../../config.js')
let Util = require('../../../../util/util.js');
let sendAjax = require('../../../../util/sendAjax.js');
let app = getApp();

Page({

   /**
    * 页面的初始数据
    */
   data: {
      userKey: '',
      userinfo: {},
      showmap: true,
      showsharemap: false,
      markers: [],
      latitude: "",
      longitude: "",
   },

   /**
    * 生命周期函数--监听页面加载
    */
   onLoad: function (options) {   

      this.setData({
        userKey: wx.getStorageSync('userKey')
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
     var that = this;
     var infoOpt = {};
     var infoCb = {};

     infoOpt = {
       url: '/user/account',
       type: 'GET'
     }

     infoCb.success = function (data) {
       console.log(infoOpt)
       console.log(data)
       that.setData({
         userinfo: data.user
       });

       setMap(data.user.theodolite);
     }

     sendAjax(infoOpt, infoCb)


     function setMap(latlon) {
       if (!latlon) {
         that.setData({
           showmap: false,
           showsharemap: false,
         })
       } else {
         let tmpaddressarray = Util.bd_gc(latlon.split(',')[0], latlon.split(',')[1]);
         console.log(tmpaddressarray)
         that.setData({
           showsharemap: true,
           longitude: tmpaddressarray[0],
           latitude: tmpaddressarray[1],

           markers: [{
             iconPath: "/image/marker.png",
             longitude: tmpaddressarray[0],
             latitude: tmpaddressarray[1]
           }]
         })
       }
     }
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
      var that = this;
      console.warn(that.data.userKey)
      return {
        title: this.data.userinfo.userName + '的名片',
        path: '/page/user/pages/card/sharecard/sharecard?userKey=' + that.data.userKey
      }
   },
   /**  
    * 打电话
    */
   handleCall: function () {
     wx.makePhoneCall({
       phoneNumber: this.data.userinfo.mobile
     })
   },
   /**
    * 小程序图片
    */
   cardminiimg_press: function () {

    wx.navigateTo({
      url: 'carddetail/carddetail',
    })
   },
   /**
    * 编辑名片
    */
   editbtn_press: function () {
      wx.navigateTo({
         url: '/page/user/pages/card/editcard/editcard',
      })
   },
   //打开地图
   showdetailmap1: function () {
      wx.openLocation({
         latitude: this.data.latitude,
         longitude: this.data.longitude,
         name: this.data.userinfo.companyName,
         address: this.data.userinfo.address
      })
   },
   showdetailmap2: function () {
      wx.openLocation({
         latitude: this.data.latitude,
         longitude: this.data.longitude,
         name: this.data.shareuserinfo.companyName,
         address: this.data.shareuserinfo.address
      })
   },

})