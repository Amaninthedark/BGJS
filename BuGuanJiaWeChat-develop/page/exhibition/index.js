var url=require('../../config.js')
var util=require('../..//util/util.js')

var app=getApp()
Page({
  data: {
    exhibition:[],
    platType:1,
    platCode:"",
    platUserInfoMap:{},
    isLogin:0,
    isBind:0,
    showAdd:false,
    showChoose:false,
    name:"2017.03上海展",
    date:"",
    options:{},
    cardKey:"",
    type:0,
    placeholder:'请输入展会名称',
    inviteCode:""
  },
  toExhibition(e){
    // console.log(e);
    var exposId=e.currentTarget.id;  
    var exposName=e.currentTarget.dataset.name;
    // app.companyId=companyId;
    // app.companyName=companyName;
    wx.setStorageSync('exposId',exposId);
    wx.setStorageSync('exposName',exposName);
    var that=this
    wx.setStorageSync('cardKey',this.data.cardKey)
    if(this.data.cardKey!="")  app.addScanCard(this,this.data.type)
    else{
       this.toList()
    }
    
              
   
  },
  toList(){
    if(this.data.type==1){     
     
        wx.navigateTo ({
          url: '/page/exhibition/pages/audienceCard/audienceCard'
        })
      }
      else{
        wx.navigateTo ({
          url: '/page/exhibition/pages/exhibitionCard/exhibitionCard'
        })
      }
  },
  addExhibition(){
    
    this.setData({
      showAdd:true
    })
    
    
  },
  nameBind(e){
    var name=e.detail.value
    this.setData({
      name:name
    })

  },
  confirm(){
    console.log(this.data.name)
    console.log(Date.now())
    if(this.data.name==""){
      this.setData({
        placeholder:'请输入...'
      })
      return;
    }
    this.setData({
      date: util.formatTime(new Date)
    
    })
    
      var that=this;

      wx.request({
        url:url.exposUrl,
        method:'POST',
        data:{
          name:that.data.name,
          expoDate:that.data.date
        },
        header: {
          'content-type': 'application/json',
          'authorization':wx.getStorageSync("authorization")
        },
        success:function(res){
          console.log(res);
          if(res.data.code=="200"){
            that.getExhibitionList()
             
          }
          else if(res.data.code=="401"){
            wx.setStorageSync("isLogin",0)
            that.onLoad(that.data.options)
           
          }
          else{
            wx.showModal({
            title: '提示',
            content: res.data.message,
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
        complete:function(){
          that.setData({
              showAdd:false
            })
        }
      })
     
    
  },
  cancel(){
    this.setData({
      showAdd:false
    })
  },
  onPullDownRefresh(){
      this.onLoad(this.data.options);
      wx.stopPullDownRefresh();
    
  },
  addCard(){
        var that=this       
    
        wx.request({
            url:url.exposUrl+"/"+wx.getStorageSync('exposId')+"/contacts",
            method:"POST",
            data:{             
                cardKey:that.data.cardKey,              
                type:that.data.type
            },
            header: {
               'content-type': 'application/json',
               'authorization':wx.getStorageSync('authorization')
            },
            success(res){               
                if(res.data.code==200){
                  if(that.data.type==1){
                    wx.navigateTo({
                     url:'/page/exhibition/pages/audienceCard/audienceCard'
                   })
                  }
                  else{
                    wx.navigateTo({
                     url:'/page/exhibition/pages/exhibitionCard/exhibitionCard'
                   })
                  }                 
                   
                }
                else if(res.data.code==401){
                  that.onload(that.data.options)
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
              console.log('服务器连接失败')
            },
            complete(){
               that.setData({
                  cardKey:"",
                  type:0
                })
            }
        })
    },
    onLoad(options){
    // console.log(options.cardKey)
    wx.showNavigationBarLoading()
    
   

    
      this.setData({
        isLogin:wx.getStorageSync('isLogin'),
        isBind:wx.getStorageSync('isBind')
        // cardKey:'HwsvNrpNwr/PFmapyqfBKQ=='
      })  
    
    
    if(wx.getStorageSync('isLogin')!=1){
      
       var that=this;
       wx.login({
            success: function (loginResult) {
              // console.log(loginResult)
            that.setData({
              platCode:loginResult.code
            })
              wx.getUserInfo({
                  success: function (userResult) {
                    console.log(userResult);
                      var platUserInfoMap=that.data.platUserInfoMap;
                      platUserInfoMap["encryptedData"]=userResult.encryptedData;
                      platUserInfoMap["iv"]=userResult.iv;
                      that.setData({
                        platUserInfoMap:platUserInfoMap
                      })
                      wx.request({
                        url: url.plantLoginUrl, 
                        method:'POST',
                        data: {
                            platType: that.data.platType ,
                            platCode: that.data.platCode,
                            platUserInfoMap:that.data.platUserInfoMap
                        },
                        header: {
                            'content-type': 'application/json'
                        },
                        success: function(res) {
                            
                            if(res.data.code=="200"){
                              wx.setStorageSync("isLogin",1)
                              wx.setStorageSync("isBind",res.data.isBind)
                              
                              app.unionId=res.data.unionId
                              app.nickName=res.data.userName
                              app.headimgurl=res.data.avatar
                              wx.setStorageSync("nickName",res.data.userName)
                               wx.setStorageSync("avatar",res.data.avatar)

                              if(wx.getStorageSync("isBind")!=1){
                                wx.request({
                                  url:url.weixinappUrl,
                                  method:'POST',
                                  data: {
                                      unionId: res.data.unionId ,
                                      nickName: res.data.userName,
                                      headimgurl:res.data.avatar
                                  },
                                  header: {
                                      'content-type': 'application/json'
                                  },
                                  success:function(resp){
                                    if(resp.data.code==200){
                                        wx.setStorageSync('authorization',resp.data.authorization)
                                        that.getExhibitionList()
                                      }
                                      else{
                                         wx.showModal({
                                            title: '提示',
                                            content: resp.data.message,
                                            showCancel:false
                                        });
                                      }
                                 
                                  }
                                })
                            
                                 
                                }
                                else{
                                  wx.setStorageSync('authorization',res.data.authorization)
                                  that.getExhibitionList()
                                }
                              
                           
                              
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
                        }
                    })
                      
                  },

                  fail: function (userError) {
                      
                     wx.showModal({
                        title: '提示',
                        content: '微信登录失败，请检查网络状态',
                        showCancel:false
                    });
                  },
              });
          },

          fail: function (loginError) {
              
              wx.showModal({
                  title: '提示',
                  content: '微信登录失败，请检查网络状态',
                  showCancel:false
              });
          }
      });
    }
  
    else{
      console.log(options)
        if(options.cardKey){
        this.setData({
          cardKey:options.cardKey
          // cardKey:'HwsvNrpNwr/PFmapyqfBKQ=='
        })
      }
      if(options.inviteCode){
            this.setData({
                inviteCode:options.inviteCode
            })
            app.inviteUserToExpos(this,0)
        }
      this.getExhibitionList()
    }

    },
    getExhibitionList(){
       var that=this;
      

      wx.request({
        url:url.exposUrl,
        method:'GET',
        data:{
          pageNo:1,
          pageSize:20
        },
        header: {
          'content-type': 'application/json',
          'authorization':wx.getStorageSync("authorization")
        },
        success:function(res){
          console.log(res);
          if(res.data.code=="200"){
            //扫码 需要添加名片
            if(that.data.cardKey!=""){
                //扫码而来 已有展会
                if(res.data.expos!=0){
                  that.setData({
                    'exhibition':res.data.expos
                    
                  })
                  
                //选择名片类型
                 that.setData({
                   showChoose:true
                 })
                  //只有一个展会 不用选择
              
                

              }
              //没有展会
              else{
                wx.showModal({
                  title:'提示',
                  content:'您还没有创建展会，请新建一个展会后导入名片',
                  showCancel:false,
                  success(res){
                    
                      that.addExhibition()
                    
                  }
                })
              }
            }
            //不是扫码过来的
            else{
              that.setData({
                'exhibition':res.data.expos
                
              })
            }
            
          
          }   
          else if(res.data.code==401){
            wx.setStorageSync('isLogin',0)
            that.onLoad(that.data.options)
          }      
          else{
            wx.showModal({
            title: '提示',
            content: res.data.message,
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
    chooseE(){
      this.setData({
        type:0,
        showChoose:false
      })
      this.chooseExhibition()
    },
    chooseA(){
      this.setData({
        type:1,
         showChoose:false
      })
      this.chooseExhibition()
    },
    chooseType(){
      var that=this
       wx.showModal({
          title:'添加名片',
          content:'请选择您要添加的名片类型',
          confirmText:'展商',
          confirmColor:"#56a4ff",
          cancelColor:"#56a4ff",
          cancelText:'观众',
          success:function(resp){
            
            if(resp.confirm){                      
              that.setData({
                type:0
              })
            
            }
            else{
              that.setData({
                type:1
              })           
            }
            
          },
          complete(){
               if(that.data.exhibition.length==1){
                 
                  wx.setStorageSync('exposId',that.data.exhibition[0].expoId)
                 
                  that.addCard()
                }
                //多个展会，需要选择
                else{
                  wx.showModal({
                    title:'提示',
                    content:'选择您要添加名片的展会，点击导入',
                    confirmColor:"#56a4ff",
                    showCancel:false
                  })
                }
          }
      })
    },
    chooseExhibition(){
      if(this.data.exhibition.length==1){
                 
                  wx.setStorageSync('exposId',this.data.exhibition[0].expoId)
                 
                  this.addCard()
                }
                //多个展会，需要选择
                else{
                  wx.showModal({
                    title:'添加名片向导',
                    content:'选择展会，点击即可导入该名片',
                    confirmColor:"#56a4ff",
                    showCancel:false
                  })
                }
    }
 
  
})

