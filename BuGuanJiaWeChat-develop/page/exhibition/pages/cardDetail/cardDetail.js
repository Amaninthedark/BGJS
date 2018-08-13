var url=require('../../../../config.js')
var app=getApp()
Page({
    data:{
        contact:[],   
        urls:[],
        showPublic:true,    
        hasPic:false 
      

    },
   
     onLoad:function(){
      
        var that=this;
      
      
       this.getCardDetail();
     
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
                    var urls=[]
                    var hasPic=false
                     if(res.data.contact.cardFront!=""){
                       hasPic=true
                        urls.push(res.data.contact.cardFront)
                    }
                    if(res.data.contact.cardBack!=""){
                       hasPic=true
                        urls.push(res.data.contact.cardBack)
                    }
       
                   
                  that.setData({
                      contact:res.data.contact,
                      urls:urls,
                      hasPic:hasPic
                     
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
        var urls=this.data.urls
        
       
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
    }
   
  
    
})