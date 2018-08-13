// pages/user/editcard/editcard.js
let Api = require('../../../../../config.js')
let sendAjax = require('../../../../../util/sendAjax.js');
let app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userName:'',
    avatar:'',
    email:'',
    position:'',
    telephone:'',
    code:'',
    code_message:"验证",
    isyz:false,
    showcode:true,
    fax:'',
    companyName:'',
    companyDesc:'',
    address:'',
    pics:[],
    isbind:false,
    disabled:false,
    userinfo:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    let tmpuserinfo = wx.getStorageSync("user");
    this.setData({
      userinfo: tmpuserinfo,
      isbind: app.globalData.isbind
    });
    
    let infoCb = {};
    infoCb.success = function(data) {
      that.setData({
        userName: data.user.userName,
        avatar: data.user.avatar,
        telephone: data.user.mobile,
        companyName: data.user.companyName,
        position: data.user.position,
        address: data.user.address,
        email: data.user.email,
        fax: data.user.fax
      }) 
    }
    sendAjax({
      url: '/user/account',
      type: 'GET'
    }, infoCb)

    if (this.data.userinfo.mobile != ""){
      this.setData({
        showcode:false,
        isyz:true
      })
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
  uploadHeadImage:function(files){
    var that = this;
    wx.showLoading({
      title: '上传中',
    })
    let file = files.pop();
    wx.uploadFile({
      url: Api.avatarurl,
      filePath: file,
      name: 'file',
      header:{
        "Content-Type": "multipart/form-data",
        'authorization': wx.getStorageSync('authorization')
      },
      success:function(res){
        console.log(res)
        var data = JSON.parse(res.data);
        if(data.code == "200"){
          that.setData({
            avatar: data.avatarUrl
          })
        }else{
          wx.showModal({
            title: '提示',
            content: data.message,
            showCancel:false
          })
        }
      },
      complete:function(){
        wx.hideLoading();
      }
    })
  },
  //头像
  chooseHeadImage:function(e){
    var that = this;
    wx.chooseImage({
      count:1,
      success: function(res) {
        that.uploadHeadImage(res.tempFilePaths);
      },
    })
  },
  
  //手机
  telephoneChange:function(e){
    this.setData({
      telephone:e.detail.value
    })
  },
  //验证码
  codeChange:function(e){
    var that = this;
    that.setData({
      code:e.detail.value
    })
    wx.request({
      url: Api.bindurl,
      method:'POST',
      data:{
        mobile: that.data.telephone,
        checkCode: that.data.code,
        unionId: app.globalData.unionId,
        nickName: that.data.userName,
        headimgurl: that.data.avatar
      },
      success:function(res){
        console.log(res.data);
        if(res.data.code == '200'){
          wx.setStorageSync('authorization', res.data.authorization)
          that.getuseraccountinfo(1);
          that.setData({
            isyz:true
          });
        }
        else if (res.data.code == '401') {
          wx.showModal({
            title: '提示',
            content: '用户信息过期,点击重新获取',
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                app.toSampleIndex();
              }
            }
          });
        }
        else{
          wx.showModal({
            title: '提示',
            content: '请输入正确的手机号和验证码',
            showCancel:false
          })
        }
      }
    })
  },
  //验证
  yzpress:function(e){
    // console.log('yz');
    if (!(/^1[3|4|5|7|8][0-9]{9}$/.test(this.data.telephone))) {
      wx.showModal({
        title: '提示',
        content: '请输入正确的手机号',
        showCancel:false
      })
    }else{
     
      var times = 60;
      var that = this;
      that.setData({
        disabled: true
      })
      var onCount = setInterval(function () {
        times--;
        if (times == 0) {
          clearInterval(onCount);
          that.setData({
            code_message: "验证",
            disabled: false
          })
        } else {
          that.setData({
            code_message: times + "s",
          })
        }
      }, 1000);

      wx.request({
        url: Api.checkcodeurl,
        method: 'POST',
        data: {
          mobile: that.data.telephone,
          businessType: 2
        },
        success: function (res) {
          // console.log(res);
          if (res.data.code == "200") {
           
          }
          else if (res.data.code == '401') {
            wx.showModal({
              title: '提示',
              content: '用户信息过期,点击重新获取',
              showCancel: false,
              success: function (res) {
                if (res.confirm) {
                  app.toSampleIndex();
                }
              }
            });
          }
          else{
            wx.showModal({
              title: '提示',
              content: res.data.message,
              showCancel:false
            })
          }
        }
      })
    } 
  },
  
  //form 提交
  bindFormSubmit:function(e){
    var that = this;
    that.setData({
      userName: e.detail.value.userName,
      email: e.detail.value.email,
      position: e.detail.value.position,
      fax: e.detail.value.fax,
      companyName: e.detail.value.companyName,
      companyDesc: e.detail.value.companyDesc,
      address: e.detail.value.address
    });
    if(that.data.isyz == false){
      wx.showModal({
        title: '提示',
        content: '请先验证手机号码',
        showCancel:false
      })
    }
    else if (that.data.userName == "" || that.data.telephone == "" || that.data.companyName == ""){
      wx.showModal({
        title: '提示',
        content: '请完善必要信息',
        showCancel:false
      })
    }
    else{
      wx.request({
         url: Api.userInfoUrl,
        method: 'PUT',
        data: {
          userName: that.data.userName,
          avatar: that.data.avatar,
          email: that.data.email,
          position: that.data.position,
          address: that.data.address,
          telephone: that.data.telephone,
          fax: that.data.fax,
          companyName: that.data.companyName
        },
        header: {
           authorization: wx.getStorageSync('authorization')
        },
        success: function (res) {
          if (res.data.code == '200') {
             var user = wx.getStorageSync("user");
             console.log(user)
             user.userName = that.data.userName;
             user.avatar = that.data.avatar;
             user.email = that.data.email;
             user.position = that.data.position;
             user.address = that.data.address;
             user.telephone = that.data.telephone;
             user.fax = that.data.fax;
             user.companyName = that.data.companyName;
             wx.setStorageSync("user", user)
             wx.setStorageSync('nickName', that.data.userName),
            wx.setStorageSync('avatar', that.data.avatar)
            that.getuseraccountinfo(2);
          }
          else if (res.data.code == '401') {
            wx.showModal({
              title: '提示',
              content: '用户信息过期,点击重新获取',
              showCancel: false,
              success: function (res) {
                if (res.confirm) {
                  app.toSampleIndex();
                }
              }
            });
          }
          else {
            wx.showModal({
              title: '提示',
              content: res.data.message,
              showCancel: false
            });
          }
        }
      })
    }
  
  },
  sync_userinfo:function(){
    var that = this;
    that.setData({
      companyName: that.data.userinfo.companyName,
      position: that.data.userinfo.position,
      address: that.data.userinfo.address,
      email: that.data.userinfo.email,
      fax: that.data.userinfo.fax
    })
  },

  getuseraccountinfo(status) {
    var that = this;
    wx.request({
       url: Api.userInfoUrl,
      header: {
         authorization: wx.getStorageSync('authorization')
      },
      success(res) {
        if (res.data.code == "200") {
          app.globalData.userinfo = res.data;
          if(status == 1){
            that.setData({
              userinfo: app.globalData.userinfo.user,
              isbind: true
            });
            // console.log(that.data.userinfo);
            
          }else if(status == 2){
            wx.navigateBack({});
          }
        }
        else if (res.data.code == '401') {
          wx.showModal({
            title: '提示',
            content: '用户信息过期,点击重新获取',
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                app.toSampleIndex();
              }
            }
          });
        }
        else {
          wx.showModal({
            title: '提示',
            content: res.data.message,
            showCancel: false
          })
        }
      }
    })
  },
  //
  /**
   * 公司图片
   */
  uploadcompanyimgs: function (files) {
    
    if(files.length > 0){
      var that = this;
      let file = files.pop();
      wx.uploadFile({
        url: Api.picurl,
        filePath: file,
        name: 'files',
        formData: {
          bizType: 23
        },
        header: {
          "Content-Type": "multipart/form-data",
          'authorization': wx.getStorageSync('authorization')
        },

        success: function (res) {
          console.log(res)
          var data = JSON.parse(res.data);
          if (data.code == "200") {
            console.log(data);
            // that.setData({
            //   pics: [data.picIds,...that.data.pics]
            // })
          } else {
            wx.showModal({
              title: '提示',
              content: data.message,
              showCancel: false
            })
          }
        },
        complete: function () {
          that.uploadcompanyimgs(files);
        }
      })
    }else{
      wx.hideLoading();
    }
   
  },

  chooseCompanyImage: function (e) {
    var that = this;
    wx.chooseImage({
      success: function (res) {
        wx.showLoading({
          title: '上传中',
        })
        that.uploadcompanyimgs(res.tempFilePaths);
      }
    })
  },
  previewImage: function (e) {
    wx.previewImage({
      current: e.currentTarget.id, // 当前显示图片的http链接
      urls: this.data.files // 需要预览的图片http链接列表
    })
  }
})