var url=require('../../../../config.js')
var sendAjax = require('../../../../util/sendAjax.js')
var app=getApp()

Page({
    data:{      
        attribute:{},
        pic:[],
        detailKey:'',
        shareKey:'',
        sharePage:false

    },  
   
    onLoad(options){
        console.log(options)
        if(options.sampleId){
            wx.setStorageSync('sampleId',options.sampleId)
            this.setData({
                sampleId:options.sampleId
            })
            this.getSampleDetail()
        }
        else if(options.detailKey){
            
            this.setData({
                detailKey:options.detailKey,
                sharePage:true
            })
            this.getShareDetail()

        } else if (options.shareKey) {
            
            this.setData({
                shareKey: options.shareKey,
                sharePage: true
            })

            this.getInfoFromShareList()
        }  
    },
   toHome(){
      wx.reLaunch({
          url: '/page/center/center',
      })
    },
    getSampleDetail(){
       var that=this;
       wx.request({
           url:url.samplesUrl+'/'+that.data.sampleId+"/share",
           method:'GET',
           header: {
                'content-type': 'application/json'
                
            },
            success(res){
                if(res.data.code=="200"){
                    var pics = res.data.sample.pic
                    for(var pic of pics){
                         if(pic.sampleDocKey.indexOf('?x-oss-process')>0&&pic.sampleDocKey.length>0)
                            pic.samplePicKey=pic.sampleDocKey+"/resize,m_fill,h_90,w100"
                        else if(pic.sampleDocKey.indexOf('?x-oss-process')<=0&&pic.sampleDocKey.length>0)
                            pic.samplePicKey=pic.sampleDocKey+"?x-oss-process=image/resize,m_fill,h_90,w100"
                    }
                    that.setData({
                        attribute: res.data.sample.attribute,
                        pic:pics
                    });
                     
                }
                 else if(res.data.code=="401"){
                     app.getAuth(page,2) 
                
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

    getInfoFromShareList() {
        var that = this

        wx.request({
            url: url.shareListUrl,
            method: 'POST',
            data: {
                shareKey: that.data.shareKey
            },
            header: {
                'content-type': 'application/json'
            },
            success(res) {
                if (res.data.code == "200") {
                    
                    that.setData({
                        detailKey: res.data.share[0].detailKey
                    })

                    that.getShareDetail()

                } else {
                    wx.showModal({
                        title: '提示',
                        content: res.data.message,
                        showCancel: false
                    });
                }
            }
        })
    },
    getShareDetail(){

       var that=this;
       wx.showNavigationBarLoading()
       wx.request({
           url:url.shareDetailUrl,
           method:'POST',
           data:{
               detailKey:this.data.detailKey
           },
           header: {
                'content-type': 'application/json'
            },
            success(res){
                console.log(res.data);
                if(res.data.code=="200"){
                    if(res.data.sample.pics.length>0){
                        var pics=res.data.sample.pics[0].pic
                        for(var pic of pics){
                            if(pic.sampleDocKey.indexOf('?x-oss-process')>0&&pic.sampleDocKey.length>0)
                                pic.samplePicKey=pic.sampleDocKey+"/resize,m_fill,h_120,w116"
                            else if(pic.sampleDocKey.indexOf('?x-oss-process')<=0&&pic.sampleDocKey.length>0)
                                pic.samplePicKey=pic.sampleDocKey+"?x-oss-process=image/resize,m_fill,h_120,w116"
                        }
                        // if()
                        that.setData({
                            attribute: res.data.sample.attributes,
                            pic: pics
                        })
                    }
                    else{
                        that.setData({
                            attribute: res.data.sample.attributes,
                           
                        })
                    }
                     
                }else{
                    wx.showModal({
                        title: '提示',
                        content: res.data.message,
                        showCancel:false
                    });
                }
            },
            complete(){
                wx.hideNavigationBarLoading()
            }

       })
    },

  
   previewPic(e){
        // console.log(e);
      
        var num=e.currentTarget.dataset.num;  
        var pic=this.data.pic
        var pics=[]
        for(var p of pic){
            pics.push(p.sampleDocKey)
        } 

      
        
       
        wx.previewImage({
            current:pics[num],
            urls:pics
        })
    },
 

   


    
})

