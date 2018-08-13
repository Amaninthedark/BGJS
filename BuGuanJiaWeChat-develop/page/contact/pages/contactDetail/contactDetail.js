var url = require('../../../../config.js')
var util = require('../../../../util/util.js')
var app = getApp()
const sendAjax = require('../../../../util/sendAjax.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id:'',
    starLevel:[],
    contactMes:null,
    contactPic:null,
    phoneNumber:'',
    // sourceType:['展会','网络','电话','客户介绍','其他']
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log(options)
    this.setData({
      id: options.id
    });
    console.log(this.data.id);
    
    this.getcontactdata();
  },
  /**
   * 获取联系人信息
   */
  getcontactdata(n) {
    let that = this;

    let infoOpt = {
      url: `/contact/user/${this.data.id}`,
      type: 'GET'
    }
    let infoCb = {}
    infoCb.success = function (data) {
      //获取并设置全部数据
      var array = [];
      var obj = data;
      array.push(obj);
      that.setData({
        contactMes:array
      })
      //获取并设置星级评价
      var star = [];
      var obj = {};
      for (var i = 0; i < array[0].starLevel; i++) {
        star.push(obj);
      }
      that.setData({
        starLevel: star
      });
      
      //获取设置用户pic
      var contactPic = [];  
      // console.log(array[0].cardPic)
      for(var i = 0 ; i < array[0].cardPic.length ; i ++){
        var obj = {};
        obj['pic'] = array[0].cardPic[i].key;
        contactPic.push(obj); 
      }
      
      that.setData({
        contactPic: contactPic
      });
      console.log(that.data.contactPic)
    }
    infoCb.beforeSend = () => {
      wx.showToast({
        title: '正在加载...',
        icon: 'loading',
        duration: 10000
      })
    }

    infoCb.complete = () => {
      wx.hideToast()
      that.setData({
        isLoading: false
      })
    }

    sendAjax(infoOpt, infoCb, () => {
      that.onLoad()
      wx.setStorageSync('G_needUploadIndex', true)
    });
  },

  /**
   * 图片放大操作
   */
  imgYu:function(e){
    // console.log(e);
    var index = e.currentTarget.dataset.index;
    var imgArr =  this.data.contactPic;
    var pic = [];
    console.log(imgArr[0])
    for(var i = 0 ; i < imgArr.length ; i ++){
      pic[i] = imgArr[i].pic.toString();
    }
    // console.log(pic)
    wx.previewImage({
      current: pic[index],     //当前图片地址
      urls: pic,               //所有要预览的图片的地址集合 数组形式
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  /**
 * 拨打电话
 */
  handleMakeCall: function (e) {
    // console.log(e)
    wx.makePhoneCall({
      phoneNumber: e.currentTarget.dataset.mobile
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