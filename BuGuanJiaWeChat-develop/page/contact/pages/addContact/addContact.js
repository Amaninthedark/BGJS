Page({

  /**
   * 页面的初始数据
   */
  data: {
    company: ['选择公司名字','绍兴文理学院元培学院'],
    source:['选择来源','展会','网络','电话','客户介绍','其他'],
    index1: 0,
    index3:0,
    region: ['浙江省', '绍兴市', '柯桥区'],
    customItem: '全部',
    flag:0,
    avatarUrl: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
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

  listenerPickerSelected1: function (e) {
    //改变index值，通过setData()方法重绘界面
    this.setData({
      index1: e.detail.value
    });
  }, 
  bindRegionChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      region: e.detail.value
    })
  },
  listenerPickerSelected3: function (e) {
    //改变index值，通过setData()方法重绘界面
    this.setData({
      index3: e.detail.value
    });
  }, 
  changeColor1: function () {
    var that = this;
    that.setData({
      flag: 1
    });
  },
  changeColor2: function () {
    var that = this;
    that.setData({
      flag: 2
    });
  },
  changeColor3: function () {
    var that = this;
    that.setData({
      flag: 3
    });
  },
  changeColor4: function () {
    var that = this;
    that.setData({
      flag: 4
    });
  },
  changeColor5: function () {
    var that = this;
    that.setData({
      flag: 5
    });
  },
  addpic:function(){
    var that = this;
    wx.chooseImage({
      // 设置最多可以选择的图片张数，默认9,如果我们设置了多张,那么接收时//就不在是单个变量了,
      count: 1,
      sizeType: ['original', 'compressed'], // original 原图，compressed 压缩图，默认二者都有
      sourceType: ['album', 'camera'], // album 从相册选图，camera 使用相机，默认二者都有
      success: function (res) {
        // 获取成功,将获取到的地址赋值给临时变量
        var tempFilePaths = res.tempFilePaths;
        
        var array = that.data.avatarUrl;
        console.log(array);
        array.push(tempFilePaths);
        console.log(array);
        that.setData({
          avatarUrl: array
        })
        
      },
      fail: function (res) {
        // fail
      },
      complete: function (res) {
        // complete
      }
    })
  },
  previewImage: function (e) {
    var that = this,
      //获取当前图片的下表
      index = e.currentTarget.dataset.index,
      //数据源
      avatarUrl = this.data.avatarUrl;
    var pic = avatarUrl[index];
    wx.previewImage({
      //当前显示下表
      current: avatarUrl[index],
      //数据源
      urls: pic
    })
  },
  saveback:function(){
    wx.showToast({
      title: '保存成功',
      icon: 'succes',
      duration: 1000,
      mask: true
    });
    wx.redirectTo({
      url: '../../contacts',
    })
  }

})