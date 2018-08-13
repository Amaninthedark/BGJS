var url = require('../../config.js')
var util = require('../../util/util.js')
var app = getApp()
const sendAjax = require('../../util/sendAjax.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoading: false,
    pageNo: 1,
    hidden: false,
    bussMes: null,
    bussPic: null,
    status: ['', '进行中', '已完结', '已放弃'],
    bigpicid: null,
    inputName: '',
    contactUserId: '',
    startTime: '',
    endTime: '',
    bizOppStatus: ''

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // var that = this;
    // this.getBussMess();
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
   
    let pages = getCurrentPages();
    let currPage = pages[pages.length - 1];
    // console.log(currPage);
    this.setData({//将携带的参数赋值
      inputName: currPage.data.inputName,
      contactUserId: currPage.data.contactUserId,
      startTime: currPage.data.startTime,
      endTime: currPage.data.endTime,
      bizOppStatus: currPage.data.bizOppStatus,
      pageNo: 1
    });
    this.getBussMess();
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
    this.getBussMess();
    wx.stopPullDownRefresh();
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.setData({
      pageNo: this.data.pageNo + 1,
      hidden: true
    })
    this.getNewMes();
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  getBussMess: function () {
    var that = this;
    let infoOpt = {
      url: '/contact/bizOpp',
      type: 'GET',
      data: {
        companyId: wx.getStorageSync('companyId'),
        pageNo: 1,
        pageSize: 10,
        contactUserIds: this.data.contactUserId,
        startTime: this.data.startTime,
        endTime: this.data.endTime,
        bizOppStatus: this.data.bizOppStatus
      }
    }
    let infoCb = {}
    infoCb.success = function (data) {
      console.log(data.bizOpps);
      var array = [];
      for (var i = 0; i < data.bizOpps.length; i++) {
        var obj = data.bizOpps[i];
        obj['id'] = i;
        array.push(data.bizOpps[i]);
      }
      that.setData({
        bussMes: array.concat(data.bizOpps)
      })
      // console.log(that.data.bussMes);
    }
    infoCb.beforeSend = () => {
      wx.showToast({
        title: '正在加载...',
        icon: 'loading',
        duration: 1000
      })
      that.setData({
        isLoading: true
      })
    }
    infoCb.complete = () => {
      that.setData({
        hidden: false
      })
    }
    sendAjax(infoOpt, infoCb, () => {
      that.onLoad()
      wx.setStorageSync('G_needUploadIndex', true)
    });
  },

  //加载新数据
  getNewMes:function(){
    var that = this;
    let infoOpt = {
      url: '/contact/bizOpp',
      type: 'GET',
      data: {
        companyId: wx.getStorageSync('companyId'),
        pageNo: this.data.pageNo,
        pageSize: 10,
        contactUserIds: this.data.contactUserId,
        startTime: this.data.startTime,
        endTime: this.data.endTime,
        bizOppStatus: this.data.bizOppStatus
      }
    }
    let infoCb = {}
    infoCb.success = function (data) {
      var array = that.data.bussMes;
      if (data.bizOpps.length == 0) {
        wx.showToast({
          title: '已经没有更多的商机了~',
          icon: 'none',
          duration: 1000
        })
        that.setData({
          hidden: false
        })
      }
      for (var i = 0; i < data.bizOpps.length; i++) {
        var obj = data.bizOpps[i];
        obj['id'] = i;
        array.push(obj);
      }
      that.setData({
        bussMes: array
      })
      // console.log(that.data.bussMes);
    }
    infoCb.beforeSend = () => {
      wx.showToast({
        title: '正在加载...',
        icon: 'loading',
        duration: 1000
      })
      that.setData({
        isLoading: true
      })
    }
    infoCb.complete = () => {
      that.setData({
        hidden: false
      })
    }
    sendAjax(infoOpt, infoCb, () => {
      that.onLoad()
      wx.setStorageSync('G_needUploadIndex', true)
    });
  },
  immm: function (e) {
    // console.log(e);
    this.setData({
      bigpicid: e.currentTarget.dataset.index
    })
  },
  //图片预览
  imgYu: function (e) {
    var that = this;
    console.log(this.data.bussMes);
    var index = e.currentTarget.dataset.index;
    var bigindex = e.currentTarget.dataset.bigindex;
    var img = e.currentTarget.dataset.img;
    var bigid = e.currentTarget.dataset.bizoppid;
    var bussMes = this.data.bussMes;
    var pic = [];
    for (var i = 0; i < bussMes.length; i++) {
      // console.log(bigid + '****' + bussMes[i].bizOppId);
      if (bigid == bussMes[i].bizOppId) {
        for (var j = 0; j < bussMes[i].bizOppPics.length; j++) {
          pic.push(bussMes[i].bizOppPics[j].bizOppPicKey);
        }
      }
    }
    // console.log(pic);

    //图片处理

    wx.previewImage({
      current: pic[index],     //当前图片地址
      urls: pic,               //所有要预览的图片的地址集合 数组形式
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  toDetail: function (e) {
    console.log(e)
    var index = e.currentTarget.dataset.index;
    // console.log(index);
    var bussMes = JSON.stringify(this.data.bussMes[index]);
    console.log(bussMes);
    wx.navigateTo({
      url: 'pages/bussDetail/bussDetail?bussMes=' + bussMes,
    })
  },

  //跳转到商机搜索
  bindKeyInput: function () {
    var inputName = this.data.inputName;
    var contactUserId = this.data.contactUserId;
    var startTime = this.data.startTime;
    var endTime = this.data.endTime;
    var bizOppStatus = this.data.bizOppStatus;
    wx.navigateTo({
      url: 'pages/searchBuss/searchBuss?inputName=' + inputName + '&contactUserId=' + contactUserId + '&startTime=' + startTime + '&endTime=' + endTime + '&bizOppStatus=' + bizOppStatus,
    })
  }
})