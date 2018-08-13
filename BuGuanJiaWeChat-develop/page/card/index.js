var app=getApp()
var url=require('../../config.js')
// var QR = require("../../util/qrcode.js");
// var Base64 = require('../../util/base64_decode.js') 
Page({
    data:{
        userinfo:{},       
        name:"",
        mobile:"",
        telephone:"",
        email:"",
        companyName:"",
        position:"",
        gender:"",
        address:"",
        showCardFront:"",
        showCardBack:"",
        cardFront:"",
        cardBack:"", 
        imagePath:'',
        qrUrl:'',
        cardKey:'',
        accessToken:'',
        hasCard:false,
        path:{
            path:'/page/sample/index',
            width:190,
            type:0
        }

    },

    onLoad(){

        var that=this 
        wx.showNavigationBarLoading()
        this.setData({
            userName:wx.getStorageSync('nickName'),
            avatar:wx.getStorageSync('avatar')
        })
        app.getMyCard(this,0)
       
   
    },
    //  onPullDownRefresh:function(){
    //     this.onLoad();
    //     wx.stopPullDownRefresh();
     
    // },
    toBig(){
        var img=this.data.qrUrl
        var urls=[]
        urls.push(img)
        wx.previewImage({
            current:img,
            urls:urls
        })
    },
//     onShareAppMessage: function () {
//         return {
//         title: wx.getStorageSync('nickName')+'的名片，请惠存',
//         path: '/page/card/index'
//         }
//   }

   
  
})