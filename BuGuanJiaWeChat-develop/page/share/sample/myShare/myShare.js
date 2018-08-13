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
        share:[],
        pageNum:0,
        pageNo:1,
        hidden:false,
        showActionsSheet:false,
        touch_start:"",
        touch_end:"",
        chooseType:'nochoose'
        
        
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
    sampleAction(e){
        var sampleId=e.currentTarget.id;
        // console.log(e)
        wx.setStorageSync('sampleId',sampleId)
        let that = this;    
        var touchTime = that.data.touch_end - that.data.touch_start;  
  
    
        if (touchTime > 350) {
            // if(this.data.chooseType=='choose_btn'){
            //     this.setData({
            //         chooseType:'nochoose',
            //         chooseMode:false
            //     })
            // }
            // else{
            //      this.setData({
            //         chooseType:'choose_btn',
            //         chooseMode:true
            //     })
            // }
           
        }
        else{
            // console.log(sampleId)
            wx.setStorageSync('sampleId',sampleId)
            wx.navigateTo({
                url:"/page/share/sample/shareDetail/shareDetail?sampleId="+sampleId
            })
            
        }
        
    },
    
    getSampleList(){
        // console.log(pageNo);
        var that=this;
        var companyId=wx.getStorageSync('companyId');
          
        wx.request({
            url:url.customerUrl,
            method:'GET',
            data:{
                companyId:companyId,
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
                console.log(res.data);
                if(res.data.code==200){
                    var samples =that.data.samples
                    var share=res.data.share
                    for(var i=0;i<share.length;i++){
                         if(share[i].samplePicKey.indexOf('?x-oss-process')>0&&share[i].samplePicKey.length>0)
                            share[i].samplePicKey=share[i].samplePicKey+"/resize,m_fill,h_150,w_144"
                        else if(share[i].samplePicKey.indexOf('?x-oss-process')<=0&&share[i].samplePicKey.length>0)
                            share[i].samplePicKey=share[i].samplePicKey+"?x-oss-process=image/resize,m_fill,h_150,w_144"
                        samples.push(share[i])
                    }
                   
                    
                    
                
                    that.setData({
                        samples : samples,                  
                        hidden:true,
                        pageNum:res.data.pageCount,
                        pageNo:that.data.pageNo+1
                    });
                    //  that.getChoosed()
                    // that.hideInput();
                }
                // else if(res.data.code==401){
                //   app.getAuth(page,1)           
                
            
                // }
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
    
      key=''
      this.setData({
          hidden:true,
          samples:[],
          share:[],
          pageNo:1
      })
      this.getSampleList();
     
    },
    onPullDownRefresh(){
        this.onLoad()
        wx.stopPullDownRefresh()
    },
    onReachBottom(){
        if(this.data.pageNo<=this.data.pageNum){
            
            this.getSampleList();
        }
      
    },
    toViewer(e){
        var sampleId=e.currentTarget.dataset.id
        wx.setStorageSync('sampleId',sampleId)
        wx.navigateTo({
            url:'/page/share/sample/myShare/viewer'
        })

    }
 
});

