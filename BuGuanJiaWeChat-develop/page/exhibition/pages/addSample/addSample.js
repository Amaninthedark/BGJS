var app=getApp()
var url=require('../../../../config.js')

Page({
    data:{
        itemNo:"",
        showLablePic:"",
        showSamplePicFront:"",       
        showSamplePicBack:"",
        lablePic:"",
        samplePicFront:"",       
        samplePicBack:"",
        remark:"",
        picNum:0,
        overNum:0,
        loadingContinue:false,
        loadingBack:false,
        disable:false
    },   
    itemNoBind(e){
        this.setData({
            itemNo:e.detail.value
        })
    },
    remarkBind(e){
        this.setData({
            remark:e.detail.value
        })
    },
     chooseImage: function (type) {
      
        var that=this
         wx.chooseImage({
            count:1,
            sizeType: ['compressed'], 
            sourceType: ['album', 'camera'],
            success: function (res) {
                var tempFiles=res.tempFilePaths 
                that.setData({
                    picNum:that.data.picNum+1
                })
                if(type==0){
                     that.setData({
                        showLablePic:tempFiles[0]
                    })
                
                }
                else if(type==1){
                     that.setData({
                        showSamplePicFront:tempFiles[0]                  
                    })
                   
                }
                else{
                     that.setData({
                        showSamplePicBack:tempFiles[0]
                        
                    })
                   
                }
            
               that.uploadImg(tempFiles[0],type)
                
            }
        })
    },
    chooseLabelImage(){
        this.chooseImage(0)
    },
    chooseFrontImage(){
        this.chooseImage(1)
    },
    chooseBackImage(){
        this.chooseImage(2)
    },
    uploadImg(file,type){  
         var that=this   
         wx.showNavigationBarLoading() 
     
        wx.uploadFile({
            url:url.expoSampleUploadUrl,
            filePath:file,
            name: 'file', 
            formData: {
            
                expoId:wx.getStorageSync('exposId'),
                contactId:wx.getStorageSync('contactId')
            },          
            header: {
                "Content-Type": "multipart/form-data",
                'authorization':wx.getStorageSync('authorization')
            },
            success:function(resp){
            
                var res= JSON.parse(resp.data)
                console.log(res) 
                
                if(res.code==200){
                    if(type==0){
                        that.setData({
                            lablePic:res.picId
                        })
                    }
                    else if(type==1){
                        that.setData({
                            samplePicFront:res.picId
                        })
                    }
                    else{
                         that.setData({
                            samplePicBack:res.picId
                        })
                    }
                }
                else if(res.code==401){
                    app.toSamplePage()
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
                that.setData({
                    overNum:that.data.overNum+1
                })
            }
            
            
        })

    },
    showActionsSheet(){
        this.setData({
            showActionsSheet:true
        })
    },
    hideActionsSheet(){
        this.setData({
            hideActionsSheet:true
        })
    },
   
    addSample(type){
        var that=this
          wx.request({
            url:url.exposUrl+"/"+wx.getStorageSync('exposId')+"/samples",
            method:"POST",
            data:{
                contactId:wx.getStorageSync('contactId'),
                itemNo:that.data.itemNo,
                lablePic:that.data.lablePic,
                samplePicFront:that.data.samplePicFront,
                samplePicBack:that.data.samplePicBack,
                remark:that.data.remark
               
            },
            header: {
               'content-type': 'application/json',
               'authorization':wx.getStorageSync('authorization')
            },
            success:function(res){
             
                if(res.data.code==200){
                    if(type==0){
                        var pages = getCurrentPages();
                        var currPage = pages[pages.length - 1];  
                        var prevPage = pages[pages.length - 2]; 
                        prevPage.onLoad()
                        wx.navigateBack()
                    }
                    else{
                        that.setData({
                            itemNo:"",
                            showLablePic:"",
                            showSamplePicFront:"",       
                            showSamplePicBack:"",
                            lablePic:"",
                            samplePicFront:"",       
                            samplePicBack:"",
                            remark:"",
                            picNum:0,        
                            overNum:0,
                            disable:false,
                            loadingContinue:false,
                            loadingBack:false
                        })
                        that.onLoad()
                    }
                   
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
            complete:function(){
                that.setData({
                    loadingContinue:false,
                    loadingBack:false,
                     disable:false
                })
            }
        })
    },
    
    addSampleAndToList(){
        
        if(this.data.itemNo==""&&this.data.lablePic==""&&this.data.showSamplePicFront==""){
            wx.showModal({
                title:'提示',
                content:'编号、标签和样品不能同时为空',
                showCancel:false
            })
            return;
        }      
        this.setData({
            loadingBack:true
        })
        var that=this
          clearTimeout(myTimeout);
        var myTimeout=setTimeout(function(){
            if(that.data.picNum<=that.data.overNum) that.addSample(0)
            else{
                wx.showModal({
                    title:'提示',
                    content:'网络延时，请重试',
                    showCancel:false
                })
                that.setData({
                    loadingContinue:false,
                    loadingBack:false,
                     disable:false
                })
            }
        },1500)
       
    },
    addSampleAndContinue(){
           if(this.data.itemNo==""&&this.data.lablePic==""&&this.data.showSamplePicFront==""){
            wx.showModal({
                title:'提示',
                content:'编号、标签和样品不能同时为空',
                showCancel:false
            })
            return;
        }  
         this.setData({
            loadingContinue:true
        })
        var that=this
       
        clearTimeout(myTimeout);
        var myTimeout=setTimeout(function(){
            if(that.data.picNum<=that.data.overNum) that.addSample(1)
            else{
                wx.showModal({
                    title:'提示',
                    content:'网络延时，请重试',
                    showCancel:false
                })
                that.setData({
                    loadingContinue:false,
                    loadingBack:false
                })
            }
        },1500)
      
        
    }
    
})