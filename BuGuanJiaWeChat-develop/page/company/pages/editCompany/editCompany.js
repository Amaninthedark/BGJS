var url = require('../../../../config.js')
let Util = require('../../../../util/util.js');
let sendAjax = require('../../../../util/sendAjax.js');
var app = getApp()
Page({
  data: {
    companyId: '',
    imageSrc: '',
    imageKey: '',
    loadingSave: false,
    companySize: ['选择公司规模', '1~10人', '10~20人', '20~50人', '50~100人', '100人以上'],
    sizeIndex: 0,
    longitude: "",
    latitude: "",
    name: '',
    address: '',
    scope: '',
    telephone: '',
    linkman: '',
    companyDesc: ''
  },
  onLoad(options) {
    wx.showNavigationBarLoading()

    var that = this
    this.setData({
      companyId: options.companyId
    })
    
    var detailOpt = {
      url: '/companys/' + options.companyId,
      type: 'GET'
    }

    var detailCb = {}

    detailCb.success = function(data) {
      var company = data.company
      var locationLL = ['','']

      if (company.theodolite) {
        locationLL = Util.bd_gc_arr(company.theodolite)
      }
      that.setData({
        imageSrc: company.photos[0] ? company.photos[0].picKey : '',
        imageKey: company.photos[0] ? company.photos[0].picId : '',
        sizeIndex: company.scale || 0,
        longitude: locationLL[0],
        latitude: locationLL[1],
        name: company.name,
        address: company.address,
        scope: company.scope,
        telephone: company.telephone,
        linkman: company.linkman,
        companyDesc: company.companyDesc
      })
    }
    detailCb.complete = function() {
      wx.hideNavigationBarLoading()
    }
    sendAjax(detailOpt, detailCb)
  },
  handleChooseLoation: function (cb) {
    var that = this;
    wx.chooseLocation({
      success: function (data) {
        that.setData({
          latitude: data.latitude,
          longitude: data.longitude
        })
      }
    })
  },
  handleLookLocation: function () {

    wx.openLocation({
      name: this.data.name,
      address: this.data.address,
      latitude: this.data.latitude,
      longitude: this.data.longitude,
    })
  },
  handleBindName: function (e) {
    this.setData({
      name: e.detail.value
    })
  },
  handleBindAddress: function (e) {
    this.setData({
      address: e.detail.value
    })
  },
  handleSizeSelect: function (e) {
    console.log(e.detail.value)
    this.setData({
      sizeIndex: e.detail.value
    })
  },
  handleClearImg: function() {
    this.setData({
      imageSrc: '',
      imageKey: ''
    })
  },
  formSubmit(e) {
    var addData = e.detail.value;


    if (addData.theodolite) {
      addData.theodolite = Util.gc_bd_str(addData.theodolite)
    }
    var that = this
    that.setData({
      loadingSave: true
    })
    wx.request({
      url: url.companysUrl + '/' + that.data.companyId,
      method: 'PUT',
      data: addData,
      header: {
        'content-type': 'application/json',
        'authorization': wx.getStorageSync('authorization')
      },
      success: function (res) {
        if (res.data.code == 200) {

          wx.setStorageSync('isUploadCompany', true)
          wx.navigateBack()

        }

        else {
          wx.showModal({
            title: '提示',
            content: res.data.message,
            showCancel: false
          })
        }

      },
      fail: function () {
        wx.showModal({
          title: '提示',
          content: '服务器连接失败',
          showCancel: false
        });
      },
      complete: function () {
        that.setData({
          loadingSave: false
        })
      }

    })
  },
  uploadImage: function (files) {
    var that = this;
    wx.showLoading({
      title: '上传中',
    })
    let file = files.pop();
    wx.uploadFile({
      url: url.host + '/upload/pic',
      filePath: file,
      name: 'files',
      formData: {
        bizType: 1
      },
      header: {
        "Content-Type": "multipart/form-data",
        'authorization': wx.getStorageSync('authorization')
      },
      success: function (res) {
        var data = JSON.parse(res.data)
        if (data.code == "200") {
          that.setData({
            imageSrc: file,
            imageKey: data.picIds[0],
          })
        } else {
          wx.showModal({
            title: '提示',
            content: data.message,
            showCancel: false
          })
        }
      },
      complete: function () {
        wx.hideLoading();
      }
    })
  },
  chooseImage: function (e) {
    var that = this;
    wx.chooseImage({
      count: 1,
      success: function (res) {
        that.uploadImage(res.tempFilePaths);
      },
    })
  },
  showActions(e) {
    wx.previewImage({
      urls: [e.currentTarget.dataset.src]
    })
  }
})