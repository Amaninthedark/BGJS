var app=getApp()
var url=require('../../../../config.js')

Page({
    data:{
        card:{},
        name:"",
        mobile:"",
        telephone:"",
        email:"",
        companyName:"",
        position:"",
        gender:"",
        address:"",
        showCardFront:"",
        showCardBack:"",
        cardFront:"",
        cardBack:"",        
        loadingAdd:false,
        genders: [
            {name: 'man', value: '男', checked: 'true'},
            {name: 'woman', value: '女'}
        ]
    },
    onLoad(){
        app.getMyCard(this,1)
    },
    radioChange: function(e) {
       
        var gender=0
        console.log(e)
        if(e.detail.value=='woman')gender=1
        this.setData({
            gender:gender
        })
    },
    nameBind(e){
        this.setData({
            name:e.detail.value
        })
    },
     mobileBind(e){
        this.setData({
            mobile:e.detail.value
        })
    },
    telephoneBind(e){
        this.setData({
            telephone:e.detail.value
        })
    },
     emailBind(e){
        this.setData({
            email:e.detail.value
        })
    },
     companyNameBind(e){
        this.setData({
            companyName:e.detail.value
        })
    },
    positionBind(e){
        this.setData({
            position:e.detail.value
        })
    },
     addressBind(e){
        this.setData({
            address:e.detail.value
        })
    },
     chooseImage: function (roleType) {
      
        var that = this;
      
         
        wx.chooseImage({
            count:1,
            sizeType: ['compressed'], 
            sourceType: ['album', 'camera'],
            success: function (res) {
            
                var tempFiles=res.tempFilePaths
                var upload_pics=that.data.upload_pics
                pic_num+= res.tempFilePaths.length;
                upload_pics[roleType].showPath=upload_pics[roleType].showPath.concat(tempFiles)
                uploadImg(that,roleType,res.tempFilePaths)
            
            
           
           
                
            }
        })
    },
    chooseFrontImage(){
        var that=this
         wx.chooseImage({
            count:1,
            sizeType: ['compressed'], 
            sourceType: ['album', 'camera'],
            success: function (res) {
            
                var tempFiles=res.tempFilePaths 
                that.setData({
                    showCardFront:tempFiles[0]
                })
                that.uploadImg(tempFiles[0],0)
                
           
                
            }
        })
    },
    chooseBackImage(){
        var that = this;
         wx.chooseImage({
            count:1,
            sizeType: ['compressed'], 
            sourceType: ['album', 'camera'],
            success: function (res) {
            
                var tempFiles=res.tempFilePaths 
                that.setData({
                    showCardBack:tempFiles[0]
                })
                that.uploadImg(tempFiles[0],1)
           
                
            }
        })
    },
    uploadImg(file,surface){
        var that=this
        wx.showNavigationBarLoading()
        wx.uploadFile({
            url:url.expoUploadUrl,
            filePath:file,
            name: 'file', 
            formData: {
            
                expoId:wx.getStorageSync('exposId')
            },          
            header: {
            "Content-Type": "multipart/form-data",
            'authorization':wx.getStorageSync('authorization')
            },
            success:function(resp){
            
                var res= JSON.parse(resp.data)
                console.log(res) 
                
                if(res.code==200){
                    if(surface==0){
                        that.setData({
                            cardFront:res.picId
                        })
                    }
                    else{
                         that.setData({
                            cardBack:res.picId
                        })
                    }
                }
                else if(res.code==401){
                    app.toSamplePage()
                }
                else{
                    wx.showModal({
                        title: '提示',
                        content: res.message,
                        showCancel:false
                        });
                    }
            },
            fail:function(e){
                console.log(e)
                
                wx.showModal({
                    title: '提示',
                    content: e.errMsg,
                    showCancel:false
                });
            
            },
            complete(){
                wx.hideNavigationBarLoading()
            }
            
            
        })

    },
   
    addCard(){
        if(this.data.name==""&&this.data.cardFront==""&&this.data.cardBack==""){
            wx.showModal({
                title:'提示',
                content:'姓名名片不能同时为空',
                showCancel:false
            })
           
        }
        else{
            var that=this
            this.setData({
                loadingAdd:true
            })
              clearTimeout(myTimeout);
            var myTimeout=setTimeout(function(){
                   that.updateCard()
            },1000)
            
        }
        
    },
    updateCard(){
        var card=this.data
        wx.request({
            url:url.mycardUrl,
            method:"PUT",
            data:{
                name:card.name,
                mobile:card.mobile,
                telephone:card.telephone,
                email:card.email,
                companyName:card.companyName,
                position:card.position,
                gender:card.gender,
                address:card.address,                    
                cardFront:card.cardFront,
                cardBack:card.cardBack,  
              
            },
            header: {
               'content-type': 'application/json',
               'authorization':wx.getStorageSync('authorization')
            },
            success:function(res){
              
                if(res.data.code==200){
                    wx.navigateBack({
                        url:"/page/card/index",
                        success: function (e) {  
                            var page = getCurrentPages().pop();  
                            if (page == undefined || page == null) return;  
                                page.onLoad();  
        
                        }
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
               
            },
            fail:function(){
                 wx.showModal({
                    title: '提示',
                    content: '服务器链接失败',
                    showCancel:false
                });
            }
        })
    }

  
  
})