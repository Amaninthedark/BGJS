var app=getApp()
Page({
    data:{
         tabBar: {  
            "color": "#7A7E83",  
            "selectedColor": "#56a4ff",  
            "backgroundColor": "#f7f7fa",  
            "borderStyle": "#dddde0",  
            "list": [  
                {  
                "pagePath": "/page/exhibition/pages/exhibitionCard/exhibitionCard",  
                "text": "供应商",  
                "iconPath": "/image/exhibition_icon.png",  
                "selectedIconPath": "/image/exhibition_icon_hover.png",            
                active: false  
                },  
                {  
                "pagePath": "/page/exhibition/pages/audienceCard/audienceCard",  
                "text": "客户",  
                "iconPath": "/image/audience_icon.png",  
                "selectedIconPath": "/image/audience_icon_hover.png",  
              
                active: true  
                },  
                {  
                "pagePath": "/page/exhibition/pages/colleague/colleague",  
                "text": "同事",  
                "iconPath": "/image/colleague_icon.png",  
                "selectedIconPath": "/image/colleague_hover.png",  
              
                active: false  
                }
            ],  
            "position": "bottom"  
         },
         contacts:[],
         loading:false,
         showActionsSheet:false,
         cardKey:"",
         options:{},
         finished:false
    },
    onShow(){
        wx.setNavigationBarTitle({
            title: wx.getStorageSync('exposName')
        });
    },
    onLoad(){
       
        this.showLoading()
    
        app.getContactsList(this,1)
     
    },
    onPullDownRefresh(){
    
      this.onLoad()
      wx.stopPullDownRefresh();
    
   },
   toCardDetail(e){
       wx.setStorageSync('contactId',e.currentTarget.dataset.id)
       wx.navigateTo({
           url:'../cardDetail/cardDetail'
       })
   },
 
    toDeleteCard(){
        var that=this
        wx.showModal({
            title: '提示',
            content: '确定删除该样品吗？',
            success:function(res){
                if(res.confirm){
                     app.deleteCard(that)
                }
            },
            complete(){
                that.setData({
                    showActionsSheet:false
                })
            }
        })
       
    },
   
    showActionsSheet(){
        this.setData({
            showActionsSheet:true
        })
    },
    hideActionSheet(){
         this.setData({
            showActionsSheet:false
        })
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
    contactAction:function(e){
        var contactId=e.currentTarget.id;
        console.log(e)
        wx.setStorageSync('contactId',contactId)
        let that = this;    
        var touchTime = that.data.touch_end - that.data.touch_start;  
  
    
        if (touchTime > 350) {  
            this.setData({
                showActionsSheet:true
            })
        }
        else{
            console.log(contactId)
            wx.navigateTo({
                url:"../sampleList/sampleList?contactId="+contactId
            })
            
        }
        
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