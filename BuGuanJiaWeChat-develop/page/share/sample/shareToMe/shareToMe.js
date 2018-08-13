var url=require('../../../../config.js')
var app=getApp()
var searchType=0;

var pageSize=10;

Page({
    data: {
        inputShowed: false,
        inputVal: "",
        samples:[],
        share:[],
        pageNum:0,
        pageNo:1,
        hidden:false,
        showActionsSheet:false,
        touch_start:"",
        touch_end:"",
        status:false,
        opacity:false,
        chooseType:'nochoose',
        chooseMode:false
        
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
        // console.log(e)
        that.setData({  
            touch_end: e.timeStamp  
        })  

    },
    toRecord(e){
        var sampleId=e.currentTarget.dataset.id
        wx.setStorageSync('sampleId',sampleId)
        wx.navigateTo({
            url:'/page/share/sample/shareToMe/record'
        })
    }, 
    sampleAction(e){
        var key=e.currentTarget.dataset.key;
        
        wx.navigateTo({
          url: "/page/share/sample/shareToMeDetail/shareToMeDetail?publicKey=" + key 
        })
              
    },
   
  
    getSampleList(){
        // console.log(pageNo);
        var that=this;
        var companyId=wx.getStorageSync('companyId');
        wx.setStorageSync('noBindTip', true)
        wx.request({
            url:url.supplierUrl,
            method:'GET',
            data:{
                
                pageNo:that.data.pageNo,
                pageSize:pageSize
                // searchType:searchType,
                // key:key,
            },
            header: {
               'content-type': 'application/json',
               'authorization':wx.getStorageSync('authorization')
            },
            success(res){
                // console.log(res.data);
                if(res.data.code==200){
                    var list = that.data.samples
                    var share=res.data.share
                   
                    for(var i = 0; i < share.length; i++){
                        if(share[i].samplePicKey.indexOf('?x-oss-process')>0&&share[i].samplePicKey.length>0)
                            share[i].samplePicKey=share[i].samplePicKey+"/resize,m_fill,h_150,w_144"
                        else if(share[i].samplePicKey.indexOf('?x-oss-process')<=0&&share[i].samplePicKey.length>0)
                            share[i].samplePicKey=share[i].samplePicKey+"?x-oss-process=image/resize,m_fill,h_150,w_144"
                        list.push(share[i])
                    }
                    
                
                    that.setData({
                        samples : list,
                        hidden:true,
                        pageNum:res.data.pageCount,
                        pageNo:that.data.pageNo+1
                    });
                    //  that.getChoosed()
                    // that.hideInput();
                }
                else if(res.data.code==401){
                  app.createAuth(that,2)           
                
            
                }
                else{
                    wx.showModal({
                        title: '提示',
                        content: res.data.message,
                        showCancel:false
                    });
                }
                
            },
            fail(){
                wx.showModal({
                title: '提示',
                content: '服务器连接失败',
                showCancel:false
                });
            },
            complete(){
                that.setData({
                    hidden:false
                });
            }

        })
    },
  
    onLoad(){
        // console.log(wx.getStorageSync('authorization'))
    
     
      this.setData({
          hidden:true,
          samples:[],
          share:[],
          pageNo:1,
          chooseType:'nochoose',
          chooseMode:false
      })
      this.getSampleList();
     
    },  

    onPullDownRefresh(){
        // console.log(this.data.samples)
   
        this.onLoad()
        wx.stopPullDownRefresh();
    },
    onReachBottom(){
        if(this.data.pageNo<=this.data.pageNum){
            
            this.getSampleList();
        }
      
    }
 
});

