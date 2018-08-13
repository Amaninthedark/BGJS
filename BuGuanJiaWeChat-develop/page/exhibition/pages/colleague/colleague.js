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
               
                active: false  
                },  
                {  
                "pagePath": "/page/exhibition/pages/colleague/colleague",  
                "text": "同事",  
                "iconPath": "/image/colleague_icon.png",  
                "selectedIconPath": "/image/colleague_hover.png",  
              
                active: true  
                }
            ],  
            "position": "bottom"  
         },
         options:{},
         friends:[],
         inviteCode:"",
         loading:false,
         shadow:true,
         checked:false

    },
    onShow(){
        if(wx.getStorageSync('exposName')){
            wx.setNavigationBarTitle({
                title: wx.getStorageSync('exposName')
            });
        }
        
    },
    hideShadow(){
        this.setData({
            shadow:false
        })
    },
    onLoad(options){ 
        console.log(this.data.checked)
        var checked=wx.getStorageSync('checked')
        if(checked==""||checked==null){
            this.setData({
              checked:false
            })
        }
        else{
             this.setData({
                checked:checked
            })
            if(checked){
                this.setData({
                    shadow:false
                })
            }
        }
       
        
        console.log(options)
        if(options.id){
          
           app.incomingCode(this,options.id)
            // wx.switchTab('/page/sample/index?inviteCode')
        }      
        else{
            this.showLoading()       
            app.getExposUserList(this)
            app.getUserInviteCode(this)  
        } 
        // this.showLoading()       
        //  app.getExposUserList(this)
        //  app.getUserInviteCode(this)        
       
    },    
    onPullDownRefresh(){
      this.onLoad(this.data.options);
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
    checkboxChange(){
        console.log('11')
        var checked=this.data.checked
        wx.setStorageSync('checked',!checked) 
        this.setData({
            checked:!checked
        })    
        
    },
    onShareAppMessage() {
        console.log(this.data.inviteCode)
        var inviteCode=this.data.inviteCode
        return {
            title: wx.getStorageSync('nickName')+'邀请你和Ta一起管理展会',
            path: '/page/exhibition/pages/colleague/colleague?id='+inviteCode
        }
    }
    
})