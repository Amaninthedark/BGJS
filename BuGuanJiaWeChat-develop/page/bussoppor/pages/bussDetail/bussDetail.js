Page({

  /**
   * 页面的初始数据
   */
  data: {
    bussDetail: null,
    status: ['', '进行中', '已完结', '已放弃'],
    record: ['报价', '寄样', '备注', '展会扫码选样', '展会拍照选样', '线下选样']
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    var bussDetail = JSON.parse(options.bussMes);
    for (var i = 0; i < bussDetail.dynamic.length; i++) {
      var obj = bussDetail.dynamic[i];
      var time = bussDetail.dynamic[i].createTime;
      var year = time.substring(0, 4);
      var moday = time.substring(5, time.length);
      obj['year'] = year;
      obj['moday'] = moday;
    }
    this.setData({
      bussDetail: bussDetail
    })
    // console.log(this.data.bussDetail)
   
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

  },
  //图片预览
  imgYu: function (e) {
    var that = this;
    // console.log(e);
    var index = e.currentTarget.dataset.index;
    var bigindex = e.currentTarget.dataset.bigindex;
    var img = e.currentTarget.dataset.img;
    var bigid = e.currentTarget.dataset.bizoppid;
    var bussMes = this.data.bussDetail;
    var pic = [];
    // console.log(bussMes)
    if (bigid == bussMes.bizOppId) {
      for (var j = 0; j < bussMes.bizOppPics.length; j++) {
        pic.push(bussMes.bizOppPics[j].bizOppPicKey);
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
  }
})