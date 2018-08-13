// pages/user/card/card.js
let Api = require('../../../../../config.js')
let Util = require('../../../../../util/util.js');
let sendAjax = require('../../../../../util/sendAjax.js');
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
    console.log(options)
    if (options && options.userKey) {
      this.setData({
        userKey: options.userKey
      })
    } else {
      wx.redirectTo({
        url: '/page/center/center',
      })
      return
    }
    var that = this;
    var infoOpt = {};
    var infoCb = {};

    infoOpt = {
      url: '/user/account/public',
      type: 'POST',
      data: {
        userKey: that.data.userKey
      }
    }

    infoCb.success = function (data) {
      that.setData({
        userinfo: data.user
      });
      wx.setNavigationBarTitle({
        title: `${data.user.userName}的名片`
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
  save_card: function() {
    var that = this;
    if (that.data.userinfo.mobile === undefined) {
      wx.showModal({
        title: '提示',
        content: '信息不足',
        showCancel: false
      })
    }
    else {
      wx.addPhoneContact({
        firstName: that.data.userinfo.userName,
        mobilePhoneNumber: that.data.userinfo.mobile
      })
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