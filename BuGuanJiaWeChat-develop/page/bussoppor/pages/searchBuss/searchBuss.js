Page({

  /**
   * 页面的初始数据
   */
  data: {
    data: '请选择',
    data2: '请选择',
    selectindex: 0,
    check1: false,
    check2: false,
    check3: false,
    inputName: '搜索联系人',
    contactUserId:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log(options)
    var inputName = options.inputName;
    var contactUserId = options.contactUserId;
    var data = options.startTime;
    var data2 = options.endTime;
    var bizOppStatus = options.bizOppStatus;
    if (inputName == ''){
      inputName = '搜索联系人';
    }
    if (data == ''){
      data = '请选择';
    }
    if (data2 == '') {
      data2 = '请选择';
    }
    if (bizOppStatus == ''){
      var check1 = false;
      var check2 = false;
      var check3 = false;
    }
    if (bizOppStatus == '1'){
      var check1 = true;
      var check2 = false;
      var check3 = false;
    }
    if (bizOppStatus == '2') {
      var check1 = false;
      var check2 = true;
      var check3 = false;
    }
    if (bizOppStatus == '3') {
      var check1 = false;
      var check2 = false;
      var check3 = true;
    }
    this.setData({
      inputName: inputName,
      contactUserId: contactUserId,
      data: data,
      data2: data2,
      check1: check1,
      check2: check2,
      check3: check3
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
    let pages = getCurrentPages();
    let currPage = pages[pages.length - 1];
    this.setData({//将携带的参数赋值
      inputName: currPage.data.inputName,
      contactUserId: currPage.data.contactUserId
    });
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
  //跳转搜索联系人
  toSearchContact: function () {
    wx.navigateTo({
      url: '../searchContact/searchContact',
    })
  },
  //清空输入框
  cleanInput:function(){
    this.setData({
      inputName: '搜索联系人',
      contactUserId:''
    })
  },
  // 时间段选择  
  bindDateChange(e) {
    let that = this;
    // console.log(e.detail.value)
    that.setData({
      data: e.detail.value,
    })
  },
  bindDateChange2(e) {
    let that = this;
    that.setData({
      data2: e.detail.value,
    })
  },
  stausTap: function (e) {
    // console.log(e);
    var index = e.currentTarget.dataset.index;
    var check1 = this.data.check1;
    var check2 = this.data.check2;
    var check3 = this.data.check3;
    if (index == 1) {
      if (check1) {
        this.setData({
          check1: !check1
        })
      } else {
        this.setData({
          check1: !check1,
          check2: false,
          check3: false
        })
      }
    }
    if (index == 2) {
      if (check2) {
        this.setData({
          check2: !check2
        })
      } else {
        this.setData({
          check1: false,
          check2: !check2,
          check3: false
        })
      }
    }
    if (index == 3) {
      if (check3) {
        this.setData({
          check3: !check3
        })
      } else {
        this.setData({
          check1: false,
          check2: false,
          check3: !check3
        })
      }
    }
  },
  //重置
  resetall:function(){
    this.setData({
      data: '请选择',
      data2: '请选择',
      check1: false,
      check2: false,
      check3: false,
      inputName: '搜索联系人',
      contactUserId: ''
    })
  },
  //确认
  confirm: function () {
    // console.log(this.data.inputName);
    var inputName = this.data.inputName;
    var contactUserId = this.data.contactUserId;
    var startTime = this.data.data;
    var endTime = this.data.data2;
    var check1 = this.data.check1;
    var check2 = this.data.check2;
    var check3 = this.data.check3;
    var bizOppStatus = '';
    if(check1){
      bizOppStatus = '1';
    }
    else if (check2) {
      bizOppStatus = '2';
    }
    else if (check3) {
      bizOppStatus = '3';
    }
    else{
      bizOppStatus = '';
    }

    let pages = getCurrentPages();//当前页面
    let prevPage = pages[pages.length - 2];//上一页面
    prevPage.setData({//直接给上移页面赋值
      inputName: inputName,
      contactUserId: contactUserId,
      startTime: startTime,
      endTime: endTime,
      bizOppStatus: bizOppStatus,
      pageNo:1
    });
    wx.navigateBack({//返回
      delta: 1
    })
  }

})