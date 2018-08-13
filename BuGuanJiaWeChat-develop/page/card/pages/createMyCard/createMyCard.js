var app=getApp()
var url=require('../../../../config.js')
// const Promise = global.Promise = require('../../../../util/lib/es6-promise')
// const regeneratorRuntime  = require('../../../../util/lib/runtime')
// const co = require('../../../../util/lib/libs/co')
// var OSS = require('../../../../util/lib/aliyun-oss-sdk')
Page({
    data:{
        name:"",
        showCardFront:"",
        showCardBack:"",
        cardFront:"",
        cardBack:"",
        cardKey:"",        
        showActionsSheet:false,     
        loadingAdd:false
    },
    onLoad(){

    },
    nameBind(e){
        this.setData({
            name:e.detail.value
        })
    },
    remarkBind(e){
        this.setData({
            remark:e.detail.value
        })
    },
     chooseImage: function (roleType) {
      
        var that = this;
      
         
        wx.chooseImage({
            count:1,
            sizeType: ['compressed'], 
            sourceType: ['album', 'camera'],
            success: function (res) {
            
                var tempFiles=res.tempFilePaths
                var upload_pics=that.data.upload_pics
                pic_num+= res.tempFilePaths.length;
                upload_pics[roleType].showPath=upload_pics[roleType].showPath.concat(tempFiles)
                uploadImg(that,roleType,res.tempFilePaths)
            
            
           
           
                
            }
        })
    },
    chooseFrontImage(){
        var that=this
         wx.chooseImage({
            count:1,
            sizeType: ['compressed'], 
            sourceType: ['album', 'camera'],
            success: function (res) {
            
                var tempFiles=res.tempFilePaths 
                that.setData({
                    showCardFront:tempFiles[0]
                })
                that.uploadImg(tempFiles[0],0)
                
           
                
            }
        })
    },
    chooseBackImage(){
        var that = this;
         wx.chooseImage({
            count:1,
            sizeType: ['compressed'], 
            sourceType: ['album', 'camera'],
            success: function (res) {
            
                var tempFiles=res.tempFilePaths 
                that.setData({
                    showCardBack:tempFiles[0]
                })
                that.uploadImg(tempFiles[0],1)
           
                
            }
        })
    },
    uploadImg(file,surface){
        var that=this
        wx.showNavigationBarLoading()
      
        wx.uploadFile({
            url:url.expoUploadUrl,
            filePath:file,
            name: 'file', 
            formData: {
            
                expoId:wx.getStorageSync('exposId')
            },          
            header: {
            "Content-Type": "multipart/form-data",
            'authorization':wx.getStorageSync('authorization')
            },
            success:function(resp){
            
                var res= JSON.parse(resp.data)
                console.log(res) 
                
                if(res.code==200){
                    if(surface==0){
                        that.setData({
                            cardFront:res.picId
                        })
                    }
                    else{
                         that.setData({
                            cardBack:res.picId
                        })
                    }
                }
                else{
                    wx.showModal({
                        title: '提示',
                        content: res.message,
                        showCancel:false
                        });
                    }
            },
            fail:function(e){
                console.log(e)
                
                wx.showModal({
                    title: '提示',
                    content: e.errMsg,
                    showCancel:false
                });
            
            },
            complete(){
                wx.hideNavigationBarLoading()
            }
            
            
        })

    }, 
    createCard(){
          wx.request({
            url:url.mycardUrl,
            method:"POST",
            data:{
                name:this.data.name,                                  
                cardFront:this.data.cardFront,
                cardBack:this.data.cardBack              
            },
            header: {
               'content-type': 'application/json',
               'authorization':wx.getStorageSync('authorization')
            },
            success:function(res){
              
                if(res.data.code==200){
                    wx.navigateBack({
                        url:"/page/card/index",
                        success: function (e) {  
                            var page = getCurrentPages().pop();  
                            if (page == undefined || page == null) return;  
                                page.onLoad();  
        
                        }
                    })
                    
                }
                else if(res.data.code==401){
                    app.toSamplePage()
                }
                else{
                     wx.showModal({
                        title: '提示',
                        content: res.data.message,
                        showCancel:false
                    });
                }
               
            },
            fail:function(){
                 wx.showModal({
                    title: '提示',
                    content: '服务器链接失败',
                    showCancel:false
                });
            }
        })
    },
    addCard(){
        if(this.data.name==""&&this.data.showCardFront==""){
            wx.showModal({
                title:'提示',
                content:'姓名名片不能同时为空',
                showCancel:false
            })
           
        }
        else{
            this.setData({
                loadingAdd:true
            })
            var that=this
            clearTimeout(myTimeout);
            var myTimeout=setTimeout(function(){
                   that.createCard()
            },1500)
         
        }
        
    }

  
  
})