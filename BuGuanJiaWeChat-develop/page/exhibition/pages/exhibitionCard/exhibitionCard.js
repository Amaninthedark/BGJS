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
                active: true  
                },  
                {  
                "pagePath": "/page/exhibition/pages/audienceCard/audienceCard",  
                "text": "客户",  
                "iconPath": "/image/audience_icon.png",  
                "selectedIconPath": "/image/audience_icon_hover.png",  
               
                active: false  
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
         inviteCode:"",
         loading:false,
         showActionsSheet:false,
         touch_start:"",
         touch_end:"",
         options:{},

    },
    onShow(){
        wx.setNavigationBarTitle({
           title: wx.getStorageSync('exposName')
        });
    },

    onLoad:function(){
        this.showLoading()
     
            app.getContactsList(this,0)
      
    },
  
    onPullDownRefresh(){         
      this.onLoad();
      wx.stopPullDownRefresh();

    
   },
   toCardDetail(e){
       console.log(e)
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
            success(res){
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
    editCard(){
        wx.navigateTo({
            url:"../editCard/editCard"
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
      
        that.setData({  
            touch_end: e.timeStamp  
        })  

    }, 
    contactAction:function(e){
        var contactId=e.currentTarget.id;
      
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