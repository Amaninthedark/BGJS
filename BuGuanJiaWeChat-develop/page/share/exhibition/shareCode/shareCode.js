var url=require('../../../../config.js')
var QR = require("../../../../util/qrcode.js");
var app=getApp()


Page({
    data:{         
        shareCode:'',
        maskHidden:true,
        imagePath:'',
        placeholder:''//默认二维码生成文本

    },
   
    onReady(){
        
        var size = this.setCanvasSize();//动态设置画布大小
        var initUrl = this.data.placeholder;
        this.createQrCode(initUrl,"mycanvas",size.w,size.h);
        
       
    },
    onLoad(options){
       this.setData({
           shareCode:options.shareKey,
           placeholder:url.singalShareUrl+"?shareKey="+options.shareKey
       })
  
   
     
    },
  

  
  
    //二维码生成
    //适配不同屏幕大小的canvas
    setCanvasSize:function(){
        var size={};
        try {
            var res = wx.getSystemInfoSync();
            var scale = 750/686;//不同屏幕下canvas的适配比例；设计稿是750宽
            var width = res.windowWidth/scale;
            var height = width;//canvas画布为正方形
            size.w = width;
            size.h = height;
        } catch (e) {
            // Do something when catch error
            console.log("获取设备信息失败"+e);
        } 
        return size;
    } ,
    createQrCode:function(url,canvasId,cavW,cavH){
        //调用插件中的draw方法，绘制二维码图片
        QR.qrApi.draw(url,canvasId,cavW,cavH);

    },
    //获取临时缓存照片路径，存入data中
    canvasToTempImage:function(){
        var that = this;
        wx.canvasToTempFilePath({
        canvasId: 'mycanvas',
        success: function (res) {
            var tempFilePath = res.tempFilePath;
            console.log("********"+tempFilePath);
            that.setData({
                imagePath:tempFilePath,
            });
        },
        fail: function (res) {
            console.log(res);
        }
        });
    },
    //点击图片进行预览，长按保存分享图片
    previewImg:function(e){
        // this.canvasToTempImage()
        wx.canvasToTempFilePath({
        canvasId: 'mycanvas',
        success: function (res) {
            console.log(res.tempFilePath)
            var tempFilePath = res.tempFilePath;
            var urls=[]
            urls.push(tempFilePath)
                wx.previewImage({
                    current: tempFilePath, // 当前显示图片的http链接
                    urls: urls // 需要预览的图片http链接列表
                })
        },
        fail: function (res) {
            console.log(res);
        }
        });
        
    },
    showCode: function(e) {
        var that = this;
        var url = this.data.placeholder;
        that.setData({
        maskHidden:false,
        });
        wx.showToast({
        title: '生成中...',
        icon: 'loading',
        duration:2000
        });
        var st = setTimeout(function(){
        wx.hideToast()
        var size = that.setCanvasSize();
        //绘制二维码
        that.createQrCode(url,"mycanvas",size.w,size.h);
        that.setData({
            maskHidden:true
        });
        clearTimeout(st);
        },2000)
        
    },
//     hiddenShadow(){
//       this.setData({
//           canva:false
//       })
//   },
   onShareAppMessage() {
      
        return {
            title: wx.getStorageSync('nickName')+'分享给你的样品,请惠存',
            path: '/page/share/shareCode/shareCode?shareKey='+this.data.shareKey
        }
    }

    
})

