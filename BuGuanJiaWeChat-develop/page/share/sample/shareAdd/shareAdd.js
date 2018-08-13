var url = require('../../../../config.js')
var sendAjax = require('../../../../util/sendAjax.js')
var app = getApp()
Page({
  data: {
    inputShowed: true,
    inputVal: "",
    samples:[],
    pageNum: 0,
    pageNo: 1
  },
  serachSample(e) {
     var that=this;
  
     this.setData({
        inputValue: e.detail.value.trim(),
        samples:[],
        pageNo:1
     })

     that.getSampleList();
  },
  getSampleList(){
    wx.showLoading({
      title: '加载中...',
    })
    var that = this;
    var companyId = wx.getStorageSync('companyId');

    var listOpt = {
      url: '/samples',
      type: 'GET',
      data: {
        companyId: companyId,
        searchType: 1,
        key: that.data.inputValue,
        pageSize: 15,
        pageNo: that.data.pageNo
      }
    }

    var listCb = {};

    listCb.success = (data) => {
      var list = that.data.samples;
      data.samples.forEach(item => {

        item.chooseType = 0;
        item.samplePicKey = item.samplePicKey ? `${item.samplePicKey}?x-oss-process=image/resize,m_fill,h_150,w_144` : '';
        list.push(item)
      })
      that.setData({
        samples: list,
        hidden: true,
        pageNum: data.pageCount,
        pageNo: data.pageNo
      });
    }
    listCb.complete = () => {
      wx.hideLoading()
    }
    sendAjax(listOpt, listCb)   
  },
  onReachBottom() {
    var that = this
    if (that.data.pageNo <= that.data.pageNum) {

      that.setData({
        pageNo: that.data.pageNo + 1
      })
      that.getSampleList();
    }
  },
  sample_add:function(e){
     var that=this;
     var sampleId = e.currentTarget.dataset.id;
     var index = e.currentTarget.dataset.index;
     var list = that.data.samples;
     var companyId = wx.getStorageSync('companyId');
     wx.request({
        url: url.sampleSelectUrl,
        method: 'POST',
        data: {
           companyId: companyId,
           sampleIds: sampleId
        },
        header: {
           'content-type': 'application/json',
           'authorization': wx.getStorageSync('authorization')
        },
        success(res) {
          list.splice(index, 1)
          that.setData({
             samples: list
          })
          wx.showToast({
             title: '添加成功',
             duration:300
          })
        },
        fail(res) {
           console.log(res.data)
        }
     })
  },
  showInput: function () {
     this.setData({
        inputShowed: true
     });
  },
  toSampleDetail:function(e){
     var sampleId = e.currentTarget.dataset.id;
     wx.navigateTo({
        url: "/page/share/sample/shareAddDetail/shareAddDetail?sampleId=" + sampleId
     })
  },
  hideInput: function () {
     this.setData({
        inputVal: "",
        inputShowed: false
     });
  }
})