var url=require('../../../../config.js')
var app=getApp()
Page({
    data:{
        contact:{}, 
        samples:[],
         showPublic:true,     
      

    },
   
     onLoad:function(){
      
        var that=this;
      
      
      app.getShareContent(this)
     
    },   
    getCardDetail(){
        var that=this
        wx.request({
            url:url.exposUrl+"/"+wx.getStorageSync('exposId')+"/contacts/"+wx.getStorageSync('contactId'),
            method:"GET",           
            header: {
               'content-type': 'application/json',
               'authorization':wx.getStorageSync('authorization')
            },
            success:function(res){
             
                if(res.data.code==200){
                   
                  that.setData({
                      contact:res.data.contact
                     
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
               
            }
        })
    
    },
 
   previewPic:function(e){
        // console.log(e);
        console.log(e)
        var img=e.currentTarget.dataset.src
        var urls=[]
        
        if(this.data.contact.cardFront!=""){
            console.log(1)
             urls.push(this.data.contact.cardFront)
        }
         if(this.data.contact.cardBack!=""){
             console.log(2)
             urls.push(this.data.contact.cardBack)
        }
       
        wx.previewImage({
            current:img,
            urls:urls
        })
     
    },
    changeSlide:function(){
        var animation = wx.createAnimation({
            duration: 1000,
            timingFunction: 'ease',
        })

        this.animation = animation

        animation.rotateY(-90).step()

        this.setData({
            animationData:animation.export()
        })
    },
    changePublicSlide:function(){
        this.setData({
            showPublic:!this.data.showPublic
        });
    },
    changeInnerSlide:function(){
        this.setData({
            showInner:!this.data.showInner
        });
    },
    changePrivateSlide:function(){
        this.setData({
            showPrivate:!this.data.showPrivate
        });
    },
  
    
})