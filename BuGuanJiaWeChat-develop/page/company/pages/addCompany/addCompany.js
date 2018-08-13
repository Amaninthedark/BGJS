var url=require('../../../../config.js')
let Util = require('../../../../util/util.js');
var app=getApp()
Page({
    data:{
        user: {},
        imageSrc: '',
        imageKey: '',
        loadingSave:false,
        companySize: ['选择公司规模','1~10人', '10~20人', '20~50人', '50~100人','100人以上'],
        sizeIndex: 0,
        longitude: "",
        latitude: "",
        name:'',
        address: ''   
    },
    onLoad(){
        if(wx.getStorageSync('isBind')!=1){
            wx.showModal({
                title: '提示',
                content: '未绑定手机号，无操作权限', 
                confirmColor:"#56a4ff",
                success: function(res) {
                if (res.confirm) {

                  wx.navigateBack()
              
                  }
                }
            })
        }
         if(app.company_num>=5){
            wx.showModal({
                title: '提示',
                content: '创建样品间数量已达上限', 
                showCancel:false,
                confirmColor:"#56a4ff",
                success: function(res) {
                  if (res.confirm) {
                    wx.navigateBack()
              
                  }
                }
            })
        }
        var that = this
        app.getUserInfo(that)
    },
    handleChooseLoation: function (cb) {
      var that = this;
      wx.chooseLocation({
        success: function(data) {
          that.setData({
            latitude: data.latitude,
            longitude: data.longitude
          })
        }
      })
    },
    handleLookLocation: function() {
      
      wx.openLocation({
        name: this.data.name,
        address: this.data.address,
        latitude: this.data.latitude,
        longitude: this.data.longitude,
      })
    },
    handleBindName: function(e) {
      this.setData({
        name: e.detail.value
      })
    },
    handleBindAddress: function (e) { 
      this.setData({
        address: e.detail.value
      })
    },
    handleSizeSelect: function(e) {
      this.setData({
        sizeIndex:e.detail.value
      })
    },
    handleClearImg: function () {
      this.setData({
        imageSrc: '',
        imageKey: ''
      })
    },
    formSubmit(e){ 
        var addData = e.detail.value;

        if( !addData.name ) {
          wx.showModal({
            title: '提示',
            content: '请填写公司全称',
            showCancel: false
          })
          return;
        }

        if (addData.theodolite) {
          addData.theodolite = Util.gc_bd_str(addData.theodolite)
        }
        var that=this
        that.setData({
            loadingSave:true
        })
        wx.request({
            url:url.companysUrl,
            method:'POST',
            data: addData,
            header: {
               'content-type': 'application/json',
               'authorization':wx.getStorageSync('authorization')
            },
            success:function(res){
               if(res.data.code==200){
                  
                wx.setStorageSync('isUploadCompany', true)
                wx.navigateBack()
                
               }
               
                else{
                    wx.showModal({
                        title:'提示',
                        content:res.data.message,
                        showCancel:false
                    })
                }
               
            },
            fail:function(){
                wx.showModal({
                title: '提示',
                content: '服务器连接失败',
                showCancel:false
                });
            },
            complete:function(){
                that.setData({
                    loadingSave:false
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