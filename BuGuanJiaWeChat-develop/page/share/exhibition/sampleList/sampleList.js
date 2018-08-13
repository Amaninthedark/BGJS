var url=require('../../../../config.js')
var app=getApp()
var searchType=0;
var key='';
var pageSize=10;


Page({
    data: {
        inputShowed: false,
        inputVal: "",
        contact:{},
        samples:[],
        pageNum:0,
        pageNo:1,
        hidden:false,
        showActionsSheet:false,
        touch_start:"",
        touch_end:""
         
    },
    onLoad:function(){
        
      this.setData({
          hidden:true         
      })
      app.getShareContent(this)
     
    },
//-------------------------------------------------------------------
    onPullDownRefresh:function(){
        key="";
        this.setData({
            samples:[],
            pageNo:1
        });
        this.getSampleList();
        wx.stopPullDownRefresh();
    },
    onReachBottom:function(){
        if(this.data.pageNo<=this.data.pageNum){
            
            this.getSampleList();
        }
      
    },
    getCode(){
         wx.request({
            url:url.qrUrl,
            method:'POST',
            data:{
                path:"/path"
            },
            header: {
                'content-type': 'application/json',
                'authorization':wx.getStorageSync('authorization')
            },
            success(resp){
                if(resp.data.code==200){
                    qrUrl=resp.data.qrUrl
                    page.setData({
                        qrUrl:qrUrl
                    })
                }
                else{
                    wx.showModal({
                        title:'提示',
                        content:res.data.message,
                        showCancel:false
                    })
                }
                
            }
        })
    },
    getSampleDetail(){
         wx.request({
            url:url.exposUrl+"/"+wx.getStorageSync('exposId')+"/samples/"+wx.getStorageSync('sampleId'),
            method:'GET',         
            header: {
               'content-type': 'application/json',
               'authorization':wx.getStorageSync('authorization')
            },
            success:function(res){
                // console.log(res.data);
                if(res.data.code==200){
                     var urls=[]
                    var current=""
                    var sample=res.data.sample
                    if(sample.samplePicFront!=""){
                        current=sample.samplePicFront
                        urls.push(sample.samplePicFront)
                    }
                
                     if(sample.samplePicBack!=""){
                        if(current=="")current=sample.samplePicBack
                        urls.push(sample.samplePicBack)
                    }
                    if(sample.lablePic!=""){
                        if(current=="") current=sample.lablePic
                        urls.push(sample.lablePic)
                    }
                    if(current!=""){
                        wx.previewImage({
                            current:current,
                            urls:urls
                        })
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
            fail:function(){
                wx.showModal({
                title: '提示',
                content: '服务器连接失败',
                showCancel:false
                });
            }

        })
    },
     showLoading(){
        this.setData({
            hidden:true
        })
    },
    hideLoading(){
        this.setData({
            hidden:false
        })
    },
    getSampleList:function(){
        // console.log(pageNo);
        var that=this;
         var contactId=wx.getStorageSync('contactId');
          
        wx.request({
            url:url.exposUrl+"/"+wx.getStorageSync('exposId')+"/samples",
            method:'GET',
            data:{
                contactId:contactId,
                pageNo:that.data.pageNo,
                pageSize:pageSize,
               
            },
            header: {
               'content-type': 'application/json',
               'authorization':wx.getStorageSync('authorization')
            },
            success:function(res){
                // console.log(res.data);
                if(res.data.code==200){
                    var list = that.data.samples;
                    for(var i = 0; i < res.data.samples.length; i++){
                        list.push(res.data.samples[i]);
                    }
                    
                
                    that.setData({
                        samples : list,
                        hidden:true,
                        pageNum:res.data.pageCount,
                        pageNo:that.data.pageNo+1
                    });
                    that.hideInput();
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
                content: '服务器连接失败',
                showCancel:false
                });
            },
            complete:function(){
                that.setData({
                    hidden:false
                });
            }

        })
    },
  
  

 
});

