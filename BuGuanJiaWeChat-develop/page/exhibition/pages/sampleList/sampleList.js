var url=require('../../../../config.js')
var app=getApp()
var searchType=0;
var key='';
var pageSize=10;

Page({
    data: {
        inputShowed: false,
        inputVal: "",
        samples:[],
        pageNum:0,
        pageNo:1,
        hidden:false,
        showActionsSheet:false,
        touch_start:"",
        touch_end:"",
         isPopping: false,//是否已经弹出
        animationPlus: {},//旋转动画
        animationcollect: {},//item位移,透明度
        animationTranspond: {},//item位移,透明度
        animationInput: {},//item位移,透明度
        shadow:false
        
    },
    showInput: function () {
        this.setData({
            inputShowed: true
        });
    },
    hideInput: function () {
        this.setData({
            inputVal: "",
            inputShowed: false
        });
    },
   
    hideActionSheet() {
        this.setData({ showActionsSheet: false });
    },
    clearInput: function () {
        this.setData({
            inputVal: ""
        });
    },
    inputTyping: function (e) {
        this.setData({
            inputVal: e.detail.value
        });
    },
    serachSample:function(e){
        this.setData({
            inputVal: e.detail.value
        });
         var companyId=wx.getStorageSync('companyId');
        var that=this;
     
        that.setData({
            hidden:false,
            samples:[],
            pageNo:1
        })
        key=this.data.inputVal;
        this.getSampleList();
    
    },
     //按下事件开始  
    mytouchstart: function (e) {  
        let that = this;  
        that.setData({  
            touch_start: e.timeStamp  
        })  
        
    },  
    //按下事件结束  
    mytouchend: function (e) {  
        let that = this;  
        console.log(e)
        that.setData({  
            touch_end: e.timeStamp  
        })  

    }, 
    sampleAction:function(e){
        var sampleId=e.currentTarget.id;
        console.log(e)
        wx.setStorageSync('sampleId',sampleId)
        let that = this;    
        var touchTime = that.data.touch_end - that.data.touch_start;  
  
    
        if (touchTime > 350) {  
            this.setData({
                showActionsSheet:true
            })
        }
        else{
          
           this.getSampleDetail()
            
        }
        
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
    editSample:function(){
        this.setData({
            showActionsSheet:false
        })
        wx.navigateTo({
            url:"../editSample/editSample"
        })
    },
    toDeleteSample:function(){
        // this.hidePlus()
        var that=this;
        wx.showModal({
            title: '提示',
            content: '确定删除该样品吗？',
            confirmColor:"#56a4ff",
            success: function(res) {
                if (res.confirm) {
                    that.deleteSample();
                }
                else{
                    that.setData({
                        showActionsSheet:false
                    })
                }
            }
        });
    },
    deleteSample:function(){
        var that=this;
        wx.request({
            url:url.exposUrl+"/"+wx.getStorageSync('exposId')+"/samples/"+wx.getStorageSync('sampleId'),
            method:'DELETE',
            header: {
               'content-type': 'application/json',
               'authorization':wx.getStorageSync('authorization')
            },
            success:function(res){
                if(res.data.code=="200"){

                    
                    that.setData({
                        showActionsSheet:false,
                        samples:[]
                    })
                    that.onLoad()
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
    onLoad:function(){
     
      this.setData({
          hidden:true,
          pageNo:1,
          samples:[]
      })
      this.getSampleList();
     
    },
  

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
//     onShareAppMessage: function () {

//        console.log('fenxian')
//        wx.showModal({
//            title:'提示',
//            content:'分享'
//        })
//   },
  showCode(){
      var that=this
      this.setData({
          shadow:true
      })
      wx.showNavigationBarLoading()
      wx.request({
            url:url.qrUrl,
            method:'POST',
            data:{
                path:"/page/share/card/card",
                width:250,
                type:1,
                bizId:wx.getStorageSync('contactId')

            },
            header: {
                'content-type': 'application/json',
                'authorization':wx.getStorageSync('authorization')
            },
            success(res){
                if(res.data.code==200){                
                    that.setData({
                        qrUrl:res.data.qrUrl
                    })
                }
                else{
                    wx.showModal({
                        title:'提示',
                        content:res.data.message,
                        showCancel:false
                    })
                }
                
            },
            complete(){
                wx.hideNavigationBarLoading()
            }
        })
  },
  hiddenShadow(){
      this.setData({
          shadow:false
      })
  }
 
});

//弹出动画
function popp() {
  //plus顺时针旋转
  var animationPlus = wx.createAnimation({
    duration: 500,
    timingFunction: 'ease-out'
  })
  var animationcollect = wx.createAnimation({
    duration: 500,
    timingFunction: 'ease-out'
  })
  var animationTranspond = wx.createAnimation({
    duration: 500,
    timingFunction: 'ease-out'
  })
  var animationInput = wx.createAnimation({
    duration: 500,
    timingFunction: 'ease-out'
  })
  animationPlus.rotateZ(180).step();
  animationcollect.translate(-20, -65).rotateZ(180).opacity(1).step();
  animationTranspond.translate(-65, 0).rotateZ(180).opacity(1).step();
  animationInput.translate(-100, 100).rotateZ(180).opacity(1).step();
  this.setData({
    animationPlus: animationPlus.export(),
    animationcollect: animationcollect.export(),
    animationTranspond: animationTranspond.export(),
    animationInput: animationInput.export(),
  })
}
//收回动画
function takeback() {
  //plus逆时针旋转
  var animationPlus = wx.createAnimation({
    duration: 500,
    timingFunction: 'ease-out'
  })
  var animationcollect = wx.createAnimation({
    duration: 500,
    timingFunction: 'ease-out'
  })
  var animationTranspond = wx.createAnimation({
    duration: 500,
    timingFunction: 'ease-out'
  })
  var animationInput = wx.createAnimation({
    duration: 500,
    timingFunction: 'ease-out'
  })
  animationPlus.rotateZ(0).step();
  animationcollect.translate(0, 0).rotateZ(0).opacity(0).step();
  animationTranspond.translate(0, 0).rotateZ(0).opacity(0).step();
  animationInput.translate(0, 0).rotateZ(0).opacity(0).step();
  this.setData({
    animationPlus: animationPlus.export(),
    animationcollect: animationcollect.export(),
    animationTranspond: animationTranspond.export(),
    animationInput: animationInput.export(),
  })
}

