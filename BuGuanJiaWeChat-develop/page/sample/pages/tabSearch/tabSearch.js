var url = require('../../../../config.js')
var app = getApp()
Page({

   /**
    * 页面的初始数据
    */
   data: {
      tab_cloud: [],
      hasImage: '',
      inputVal: ''
   },

   onLoad: function (options) {
      //var that = this;
      //var companyId = wx.getStorageSync('companyId');
      // wx.request({
      //    url: url.cloudUrl,
      //    method: 'GET',
      //    data: {
      //       companyId: companyId,
      //    },
      //    header: {
      //       'content-type': 'application/json',
      //       'authorization': wx.getStorageSync('authorization')
      //    },
      //    success(res) {
      //       var tab_list = res.data.tags;
      //       for (var i = 0; i < tab_list.length; i++) {
      //          tab_list[i].choosed = false;
      //       }
      //       that.setData({
      //          tab_cloud: res.data.tags
      //       })
      //    }

      // })
   },
   onShow: function () {
    
   },
   serachSample(e) {
     this.setData({
       inputVal: e.detail.value.trim()
     })
   },
   handleSearch() {
     // 回退到列表页面
     wx.setStorageSync('searchKey', this.data.inputVal)
     wx.setStorageSync('isSearch', true)
     wx.navigateBack()
   },
   handleImgChoose(e){
     this.setData({
       hasImage: e.currentTarget.dataset.key
     });
   },
  //  chooseOrCancel: function (e) {
  //     var that = this;
  //     var tagId = e.currentTarget.dataset.id;
  //     var tags = that.data.tab_cloud;
  //     for (var i = 0; i < tags.length; i++) {
  //        if (tags[i].tagId == tagId) {
  //           tags[i].choosed = !tags[i].choosed;
  //        }
  //     }
  //     that.setData({
  //        tab_cloud: tags
  //     })
  //  },
   reset: function (e) {
      var that = this;
      // var tags = that.data.tab_cloud;
      // for (var i = 0; i < tags.length; i++) {
      //    tags[i].choosed = false;
      // }
   
      that.setData({
         hasImage: '',
         //tab_cloud: tags,
         inputVal: ''
      })

   },
   comfirm: function () {
      // var tagIds = "";
      // var TagIds=[];
      // var tags = that.data.tab_cloud;
      // for (var i = 0; i < tags.length; i++) {
      //    if (tags[i].choosed) {
      //       TagIds.push(tags[i].tagId)
      //       if (tagIds == "") {
      //          tagIds = tagIds + tags[i].tagId
      //       }
      //       else {
      //          tagIds = tagIds + "," + tags[i].tagId
      //       }
      //    }
      // }
      
      // 回退到列表页面
      wx.setStorageSync('searchKey', this.data.inputVal)
      wx.setStorageSync('havePics', this.data.hasImage)
      wx.setStorageSync('isSearch', true)
      wx.navigateBack()
   }
})