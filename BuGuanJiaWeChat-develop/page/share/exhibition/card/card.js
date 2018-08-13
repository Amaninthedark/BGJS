var app=getApp()
Page({
    data:{
       
         contact:{},
         samples:[],
         loading:false,
         showActionsSheet:false,
         touch_start:"",
         touch_end:""

    },   
    onShow(){
         app.getShareContent(this)
    },
    onLoad(options){  
        
        this.showLoading()    
        wx.setStorageSync('shareKey',options.shareKey)   
        // wx.setStorageSync('shareKey','wE4ru0pSKOY0htrbv1nzA6DyL1Tm3aXfhGP55QJeh2VQJpVmWgigDC9uXq1/k8Xx')   
       

    },    
    onPullDownRefresh(){
      
      this.onLoad();
      wx.stopPullDownRefresh();
    
   },
 
  
    showLoading(){
        this.setData({
            loading:true
        })
    },
    hideLoading(){
        this.setData({
            loading:false
        })
    },  
    toSampleList(){
        wx.navigateTo({
            url:'../sampleList/sampleList'
        })
    },
    toCardDetail(){
        wx.navigateTo({
            url:'../cardDetail/cardDetail'
        })
    },
    toBig(e){
        console.log(e)
        var img=e.currentTarget.dataset.src
        var urls=[]
        urls.push(img)
        wx.previewImage({
            current:img,
            urls:urls
        })
    }
   
   
    
    
})