const openIdUrl = require('./config').openIdUrl
var url=require('./config.js')
// const Promise = global.Promise = require('./util/lib/es6-promise')
var searchType=0;
var key='';
var pageNo=1;
var pageSize=10;

App({
  onLaunch () {
    console.log('App Start')
  },
  onShow (path) {
      console.log(path)
  },
  onHide () {
    console.log('App Hide')
  },
  onError: function (msg) {
      console.error('[发生错误]：', msg)
  },
  globalData: {
    userInfo:null,
    hasLogin: false,
    openid: null,
    mobile:'',
    password:'',
    companyId:'',
    authorization:'',
    companyName:'',
    user:{},
    remarks:[],
    share:[],
    sampleId:'',
    isBind:'',
    unionId:'',
    nickName:'',
    headimgurl:'',
    avater:'',
    userName:'',
    company_num:0,
    platType:1,
    platCode:"",
    platUserInfoMap:{},
    options:{},
    inviteCode:'',
    page:'',
    isAgree:0

  },
  getUserInfo(page){
      var that=this
     wx.request({
            url:url.userInfoUrl,
            method:'GET',
            header: {
               'content-type': 'application/json',
               'authorization':wx.getStorageSync('authorization')
            },
            success:function(res){
                // console.log(res.data);
                if(res.data.code=="200"){
                    page.setData({
                        user:res.data.user
                    });
                }
                else if(res.data.code==401){
                  that.createAuth(page,2)
             }
            },
            fail:function(){
                wx.showModal({
                title: '提示',
                content: '服务器连接失败',
                showCancel:false
                });
            }

        })
  },
  incomingCode(page,inviteCode,type){
      this.globalData.inviteCode=inviteCode
      this.globalData.isAgree=page.data.isAgree
    //   console.log('incoming')
 
      this.getAuth(page,type)
  },
  //type=0邀请同事 type=1auth过期 type=2sampleDetail type=4邀请管理样品间type=4
  getAuth(page,type){
      var that=this
      wx.login({
            success (loginResult) {

              that.globalData.platCode=loginResult.code
            
              wx.getUserInfo({
                  success (userResult) {
                    console.log(userResult);
                      var platUserInfoMap=that.globalData.platUserInfoMap;
                      platUserInfoMap["encryptedData"]=userResult.encryptedData;
                      platUserInfoMap["iv"]=userResult.iv;
                      that.globalData.platUserInfoMap=platUserInfoMap
                     
                      wx.request({
                        url: url.plantLoginUrl, 
                        method:'POST',
                        data: {
                            platType: that.globalData.platType ,
                            platCode: that.globalData.platCode,
                            platUserInfoMap:that.globalData.platUserInfoMap
                        },
                        header: {
                            'content-type': 'application/json'
                        },
                        success(res) {
                            console.log(res.data)
                            
                            if(res.data.code=="200"){
                              wx.setStorageSync("isLogin",1)
                              wx.setStorageSync("isBind",res.data.isBind)
                              
                              that.globalData.unionId=res.data.unionId
                              that.globalData.nickName=res.data.userName
                              that.globalData.headimgurl=res.data.avatar
                              wx.setStorageSync("nickName",res.data.userName)
                               wx.setStorageSync("avatar",res.data.avatar)
                               wx.setStorageSync("userKey", res.data.userKey)
                               console.log(that.globalData.unionId)
                               wx.setStorageSync("user", res.data)
                              if(wx.getStorageSync("isBind")!=1){
                                
                                if (wx.getStorageSync('noBindTip')) {
                                    wx.setStorageSync('noBindTip', false)
                                    return
                                }
                                wx.showModal({
                                      title: '绑定手机',
                                      content: '检测到您的账号还未绑定手机号,请绑定手机号', 
                                      confirmText:'绑定手机',
                                      confirmColor:"#56a4ff",
                                      success: function(res) {
                                        if (res.confirm) {
                                            if(type==4){
                                                 wx.navigateTo ({
                                                    url: '/page/user/pages/bindPhone/bindPhone?inviteCode='+that.globalData.inviteCode+"&companyName="+page.data.companyName
                                                    
                                                })
                                            }
                                            else{
                                                 wx.navigateTo ({
                                                    url: '/page/user/pages/bindPhone/bindPhone'
                                                    
                                                })
                                            }
                                         
                                    
                                        }
                                      }
                                    })
                            
                                 
                                }
                                else{
                                  console.log(page.options)
                                  wx.setStorageSync('authorization',res.data.authorization)
                                  if(type==0)     that.inviteUserToExpos(that.globalData.inviteCode)
                                  else if (type == 1) page.onLoad(page.options)
                                  else if(type==2) page.onLoad({sampleId:wx.getStorageSync('sampleId')})
                                  else if(type==4) that.inviteUserToCompany(that.globalData.inviteCode,page.data.companyName)
                                  else if(type==5) page.onLoad() && page.onShow()
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

                  fail (userError) {
                      
                    wx.showModal({
                      title: '提示',
                      content: '若不授权微信登录，则无法使用相关功能；点击重新获取授权，则可重新使用；若点击不授权，需在微信【发现】——【小程序】 删除【知布布管家+】，重新搜索授权登录，方可正常使用。',
                      cancelText: "不授权",
                      confirmText: "授权",
                      success: function (res) {
                        if (res.confirm) {
                          wx.openSetting({
                            success: function (res) {
                              console.log(res.authSetting);
                              console.log(res.authSetting["scope.userInfo"]);
                              if (res.authSetting["scope.userInfo"]) {
                                page.onLoad()
                              }
                            }
                          });

                          // wx.setStorageSync('isAuth',0);
                          // wx.reLaunch({ url: '/page/user/pages/guide/guide' });
                        } else if (res.cancel) {
                          wx.showModal({
                            title: '提示',
                            content: '未授权，无法流畅使用主要功能',
                            showCancel: false
                          });
                        }
                      }
                    });
                  },
              });
          },

          fail (loginError) {
              
              wx.showModal({
                  title: '提示',
                  content: '微信登录失败，请检查网络状态',
                  showCancel:false
              });
          }
      });
  },
  //type=0获取分享列表 type=1分享详情页 type=2我的 页面 type=3分享列表页授权
  createAuth(page,type){
    
      
       var that=this;
       wx.login({
            success: function (loginResult) {
              // console.log(loginResult)
           that.globalData.platCode=loginResult.code
              wx.getUserInfo({
                  success: function (userResult) {
                
                     var platUserInfoMap=that.globalData.platUserInfoMap;
                      platUserInfoMap["encryptedData"]=userResult.encryptedData;
                      platUserInfoMap["iv"]=userResult.iv;
                      that.globalData.platUserInfoMap=platUserInfoMap
                      wx.request({
                        url: url.plantLoginUrl, 
                        method:'POST',
                        data: {
                           platType: that.globalData.platType ,
                            platCode: that.globalData.platCode,
                            platUserInfoMap:that.globalData.platUserInfoMap
                        },
                        header: {
                            'content-type': 'application/json'
                        },
                        success: function(res) {
                            
                          if(res.data.code=="200"){
                            wx.setStorageSync("isLogin",1)
                            wx.setStorageSync("isBind",res.data.isBind)
                            
                            that.globalData.unionId=res.data.unionId
                            that.globalData.nickName=res.data.userName
                            that.globalData.headimgurl=res.data.avatar
                            wx.setStorageSync("userKey", res.data.userKey)
                            wx.setStorageSync("nickName",res.data.userName)
                            wx.setStorageSync("avatar",res.data.avatar)
                            wx.setStorageSync("user", res.data)
                            
                            if(wx.getStorageSync("isBind")!=1&&res.data.authorizationauthorization==""){
                                
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
                                      if(type==0)
                                        page.getShareList()
                                        else if(type==1)
                                        that.getShareList(page)
                                        else if(type==2)
                                          page.onLoad()
                                      else if(type==3)
                                          page.onLoad(page.data.options)

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
                            
                                 
                            } else if (res.data.isBind != 1){
                                if (wx.getStorageSync('noBindTip')) {
                                    wx.setStorageSync('noBindTip', false)
                                    return
                                }
                                wx.showModal({
                                  title: '绑定手机',
                                  content: '检测到您的账号还未绑定手机号,请绑定手机号',
                                  confirmText: '绑定手机',
                                  confirmColor: "#56a4ff",
                                  success: function (res) {
                                    if (res.confirm) {
                                      
                                        wx.navigateTo({
                                          url: '/page/user/pages/bindPhone/bindPhone'

                                        })

                                    }
                                  }
                                })
                              }else{
                                  wx.setStorageSync('authorization',res.data.authorization)
                                  if(type==0)
                                    page.getShareList()
                                  else if(type==1)
                                   that.getShareList(page)
                                  else if(type==2)
                                     page.onLoad()
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
                      content: '若不授权微信登录，则无法使用相关功能；点击重新获取授权，则可重新使用；若点击不授权，需在微信【发现】——【小程序】 删除【知布布管家+】，重新搜索授权登录，方可正常使用。',
                      cancelText: "不授权",
                      confirmText: "授权",
                      success: function (res) {
                        if (res.confirm) {
                          wx.openSetting({
                            success: function (res) {
                              console.log(res.authSetting);
                              console.log(res.authSetting["scope.userInfo"]);
                              if (res.authSetting["scope.userInfo"]) {
                                page.onLoad()
                              }
                            }
                          });

                          // wx.setStorageSync('isAuth',0);
                          // wx.reLaunch({ url: '/page/user/pages/guide/guide' });
                        } else if (res.cancel) {
                          wx.showModal({
                            title: '提示',
                            content: '未授权，无法流畅使用主要功能',
                            showCancel: false
                          });
                        }
                      }
                    });
                  },
              });
          },

          fail: function (loginError) {
            console.log(loginError)
              wx.showModal({
                  title: '提示',
                  content: '微信登录失败，请检查网络状态',
                  showCancel:false
              });
          }
      });
  
  },
  // lazy loading openid
  getUserOpenId(callback) {
    var self = this

    if (self.globalData.openid) {
      callback(null, self.globalData.openid)
    } else {
      wx.login({
        success(data) {
          wx.request({
            url: openIdUrl,
            data: {
              code: data.code
            },
            success(res) {
              console.log('拉取openid成功', res)
              self.globalData.openid = res.data.openid
              callback(null, self.globalData.openid)
            },
            fail(res) {
              console.log('拉取用户openid失败，将无法正常使用开放接口等服务', res)
              callback(res)
            }
          })
        },
        fail(err) {
          console.log('wx.login  ', err)
          callback(err)
        }
      })
    }
  },
  getSampleInputHelp(page){
        var that=this;
        var companyId=wx.getStorageSync('companyId')
        wx.request({
            url:url.companysUrl+'/'+companyId+'/sampleInputHelp',
            method:'GET',
            header: {
               'content-type': 'application/json',
               'authorization':wx.getStorageSync('authorization')
            },
            success:function(res){
                // console.log(res.data);
                if(res.data.code==200){
                  page.setData({
                    widthOptions : res.data.widthOptions,
                    weightOptions:res.data.weightOptions,
                    componentOptions:res.data.componentOptions,
                    supplierOptions:res.data.supplierOptions
                  })
                    
                 
              
                }
                 else if(res.data.code=="401"){
                   that.getAuth(page,1)    
                
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
                content: '服务器连接失败',
                showCancel:false
                });
            }

        })
    },
    getTags(page){
        var that=this;
        wx.request({
            url:url.tagUrl,
            method:'GET',
            data:{
                companyId:wx.getStorageSync('companyId')
            },
            header: {
               'content-type': 'application/json',
               'authorization':wx.getStorageSync('authorization')
            },
            success:function(res){
                // console.log(res.data);
                if(res.data.code==200){
                   
         
                    // console.log(that.globalData.tags)
                      page.setData({
                        tags:res.data.tags
                    })
               
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
                content: '服务器连接失败',
                showCancel:false
                });
            }

        })
    },
    addToCloud(page,tagName){
        var that=this;
        var addTags=page.data.addTags;
        var addTagIds=page.data.addTagIds;
        for(var i=0;i<addTags.length;i++){
            if(addTags[i]==tagName){
                return;
            }
        }
       
         wx.request({
            url:url.tagsUrl,
            method:'POST',
            data:{
                tagName:tagName
            },
            header: {
               'content-type': 'application/json',
               'authorization':wx.getStorageSync('authorization')
            },
            success:function(res){
                // console.log(res.data);

            
                if(res.data.code==200){
                    addTags.push(tagName);
                    addTagIds.push(res.data.tagId);
                    
                    page.setData({
                        addTags:addTags,
                        addTagIds:addTagIds,
                        tagName:"",
                        tagIds:addTagIds.join(','),
                        tagsFocks:true
                    });
                }
                else if(res.data.code=="401"){
                    wx.setStorageSync("isLogin",0)
                     wx.showModal({
                        title: '提示',
                        content: '登录异常，我们将为您返回主界面',
                        showCancel:false,
                        success:function(resp){
                            if(resp.confirm){
                                 wx.redirectTo({
                                    url: '/page/sample/index'
                                 })
                            }
                        }
                        });
                
                   
                
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
    getAttributes(page){
        var that=this;
        var companyId=wx.getStorageSync('companyId')
        wx.request({
            url:url.host+'/company/attribute',
            method:'GET',
            header: {
               'content-type': 'application/json',
               'authorization':wx.getStorageSync('authorization')
            },
            data: {
                companyId: companyId,
                isUsed: 1
            },
            success:function(res){
                // console.log(res.data);
                if(res.data.code==200){
                      var customAttributes=res.data.customAttributes
                      var attributesMap=page.data.attributesMap
                      for(var attribute of customAttributes){
                          attributesMap[attribute.attributeId]="";
                      }
                  
                       page.setData({
                         customAttributes :customAttributes,
                         attributesMap:attributesMap
                       })
                       page.showAttributes()
                   
                }
                // else if(res.data.code=="401"){
                //     wx.setStorageSync("isLogin",0)
                //      wx.showModal({
                //         title: '提示',
                //         content: '登录异常，我们将为您返回主界面',
                //         showCancel:false,
                //         success:function(resp){
                //             if(resp.confirm){
                //                  wx.redirectTo({
                //                     url: '/page/sample/index'
                //                  })
                //             }
                //         }
                //         });
                
                   
                
                // }
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
                content: '服务器连接失败',
                showCancel:false
                });
            }

        })
    },
    uploadImg(page,roleType,path){
        // console.log(path);
        // page.showLoading('图片上传中...');
     
        wx.uploadFile({
            url:url.samplepicUrl,
            filePath:path,
            name: 'files',
            // header: { "Content-Type": "multipart/form-data" },          
             formData: {
               
               companyId:wx.getStorageSync('companyId')
             },
             header: {
               "Content-Type": "multipart/form-data",
               'authorization':wx.getStorageSync('authorization')
            },
            success:function(resp){
            
                var res= JSON.parse(resp.data)
                
                
                if(res.code==200){
                    // picIds.push(res.picIds);
                    var pics=page.data.pics;
                    if(roleType==0){
                        page.publicPicIds.push(res.picIds);
                        pics[roleType].picIds=publicPicIds.join(',');
                    }
                    else if(roleType==1){
                        page.innerPicIds.push(res.picIds);
                         pics[roleType].picIds=innerPicIds.join(',');
                    }
                    else{
                        page.privatePicIds.push(res.picIds);
                        pics[roleType].picIds=privatePicIds.join(',');
                    }
                    
                    
                    // publicPicIds.push(res.picIds);
                    page.setData({
                        pics:pics
                    })
                }
                 else if(res.data.code=="401"){
                    wx.setStorageSync("isLogin",0)
                     wx.showModal({
                        title: '提示',
                        content: '登录异常，我们将为您返回主界面',
                        showCancel:false,
                        success:function(resp){
                            if(resp.confirm){
                                 wx.redirectTo({
                                    url: '/page/sample/index'
                                 })
                            }
                        }
                        });
                
                   
                
                }
                else{
                    wx.showModal({
                        title: '提示',
                        content: res.message,
                        showCancel:false
                        });
                    }
            },
            fail:function(){
                wx.showModal({
                    title: '提示',
                    content: '图片上传失败',
                    showCancel:false
                });
            
            },
            complete:function(){
                // page.hideLoading()
            }
               
            
        })


    },
    getSampleDetail(page){
        var that=this
         wx.request({
         url:url.samplesUrl+'/'+wx.getStorageSync('sampleId'),
           method:'GET',
            header: {
                'content-type': 'application/json',
                'authorization':wx.getStorageSync('authorization')
            },
            success:function(res){
                // console.log(res.data);
                
                if(res.data.code=="200"){
                    var sample=res.data.sample
                   
                    
                    page.setData({
                        itemNo:sample.itemNo,
                        name:sample.name,
                        component:sample.component,
                        width:sample.width,
                        weight:sample.weight,
                        specification:sample.specification,
                        attributes:sample.attributes,
                        tags_detail:sample.tags,
                        pics_detail:sample.pics
                        
                });
                if(sample.supplierInfo){
                    console.log(sample.supplierInfo)
                        page.setData({
                            supplierName:sample.supplierInfo.supplierName,
                            supplier_itemNo:sample.supplierInfo.itemNo,
                            supplier_name:sample.supplierInfo.name,
                            supplier_nameEn:sample.supplierInfo.nameEn,
                            supplier_width:sample.supplierInfo.width,
                            supplier_weight:sample.supplierInfo.weight,
                            supplier_component:sample.supplierInfo.component,
                            supplier_specification:sample.supplierInfo.specification,
                            clothPrice:sample.supplierInfo.clothPrice,
                            finishedPrice:sample.supplierInfo.finishedPrice
                        })
                    }
                    page.showTags()
                    page.showPics()
                    that.getAttributes(page)
                    
                     
                }
                 else if(res.data.code=="401"){
                    that.getAuth(page,1)               
                   
                
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
    
    getSampleList:function(page){
        // console.log(pageNo);
        page.onLoad();
    },
    addSample(page,type){
        var that=this
 
        wx.request({
            url:url.samplesUrl,
            method:'POST',
            data:{
                companyId:wx.getStorageSync('companyId'),
                customAttribute:page.data.attributesMap,
                tagIds:page.data.tagIds,
                pics:page.data.pics,
                publicRemark:page.data.publicRemark,
                privateRemark:page.data.privateRemark
            },
            header: {
               'content-type': 'application/json',
               'authorization':wx.getStorageSync('authorization')
            },
            success:function(res){
                // console.log(res.data);
               if(res.data.code==200){
                   if(type==0){
                        // wx.
                    var pages = getCurrentPages();
                    var currPage = pages[pages.length - 1];  //当前页面
                    var prevPage = pages[pages.length - 2]; //上一个页面
                    that.getSampleList(prevPage)
                    wx.navigateBack()
                    
                   }
                   else if(type==1){
                      wx.redirectTo ({
                            url: '../addSample/addSample'
                        })
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
            fail:function(){
                wx.showModal({
                    title: '提示',
                    content: '服务器连接失败',
                    showCancel:false
                });
            },
            complete:function(){
                page.setData({
                    loadingSave:false,
                    loadingContinue:false
                })
            }

        })

    },
    editSample(page){
        var that=this
        console.log(wx.getStorageSync('pageType'))
        var pageType=wx.getStorageSync('pageType')
    
 
        wx.request({
            url:url.samplesUrl+'/'+wx.getStorageSync('sampleId'),
            method:'PUT',
            data:{
                companyId:wx.getStorageSync('companyId'),
                name:page.data.name,
                component:page.data.component,
                width:page.data.width,
                weight:page.data.weight,
                specification:page.data.specification,
                sampleType: page.data.sampleType,
                customAttribute:page.data.attributesMap,
                tagIds:page.data.tagIds,
                pics:page.data.pics,              
            },
            header: {
               'content-type': 'application/json',
               'authorization':wx.getStorageSync('authorization')
            },
            success:function(res){
                console.log(res.data);
               if(res.data.code==200){
                   
                    var pages = getCurrentPages();
                    var currPage = pages[pages.length - 1];  //当前页面
                    var prevPage = pages[pages.length - 2]; //上一个页面
                    if(pageType=="list")
                       that.getSampleList(prevPage)
                    else if(pageType=="detail")
                       prevPage.onLoad({sampleId:wx.getStorageSync('sampleId')})
                    wx.navigateBack()
                   
               }
                else if(res.data.code=="401"){
                    wx.setStorageSync("isLogin",0)
                     wx.showModal({
                        title: '提示',
                        content: '登录异常，我们将为您返回主界面',
                        showCancel:false,
                        success:function(resp){
                            if(resp.confirm){
                                 wx.redirectTo({
                                    url: '/page/sample/index'
                                 })
                            }
                        }
                        });
                
                   
                
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
                content: '服务器连接失败',
                showCancel:false
                });
            },
            complete:function(){
                page.setData({
                    loadingSave:false
                })
               
            }

        })

    },
    uploadImg(page,roleType,files){
        
        var file=files.pop();
       
        var flag=false;
       
        var showPath=page.data.upload_pics[roleType].showPath
        for(var i=0;i<showPath.length;i++){
            if(showPath[i]==file){
                flag=true
                break
            }
        }
        
        if(flag==true){
            wx.uploadFile({
            url:url.samplepicUrl,
            filePath:file,
            name: 'files',
            // header: { "Content-Type": "multipart/form-data" },          
            formData: {
            
            companyId:wx.getStorageSync('companyId')
            },
            header: {
            "User-Agent":"Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.143 Safari/537.36 appservice webview/100000",
            "Content-Type": "multipart/form-data",
            'authorization':wx.getStorageSync('authorization')
            },
            success:function(resp){
            
                var res= JSON.parse(resp.data)
                // console.log(res)
                var publicPicIds=page.data.publicPicIds
                var innerPicIds=page.data.innerPicIds
                var privatePicIds=page.data.privatePicIds
                
                
                
                if(res.code==200){
                    // picIds.push(res.picIds);
                    
                    var pics=page.data.pics;
                    var upload_pics=page.data.upload_pics
                    //  var splitPics = res.picIds.split(',');
                    upload_pics[roleType].uploadPath.push(file)
                    upload_pics[roleType].picIds.push(res.picIds[0])
                    pics[roleType].picIds=upload_pics[roleType].picIds.join(',')
                     page.setData({
                        upload_pics:upload_pics,
                        pics:pics
                    })
                    // if(roleType==0){
                    //     // console.log(res.picIds[0])
                    //     publicPicIds.push(res.picIds[0]);
                    //     pics[roleType].picIds=publicPicIds.join(',');
                    //     page.setData({
                    //         publicPicIds:publicPicIds,
                    //         pics:pics
                    //     })
                    // }
                    // else if(roleType==1){
                    //     innerPicIds.push(res.picIds[0]);
                    //     pics[roleType].picIds=innerPicIds.join(',');
                    //     page.setData({
                    //         innerPicIds:innerPicIds,
                    //         pics:pics
                    //     })
                    // }
                    // else{
                    //     privatePicIds.push(res.picIds[0]);
                    //     pics[roleType].picIds=privatePicIds.join(',');
                    //     page.setData({
                    //         privatePicIds:privatePicIds,
                    //         pics:pics
                    //     })
                    // }
                    if(files.length>0)
                    uploadImg(page,roleType,files)
                }
                else{
                    wx.showModal({
                        title: '提示',
                        content: res.message,
                        showCancel:false
                        });
                    }
            },
            fail:function(){
                wx.showModal({
                    title: '提示',
                    content: '图片上传失败',
                    showCancel:false
                });
            
            },
            complete:function(){
                cnt++;
                console.log(cnt)
                
            }
            
            
        })
        }
        else{
            cnt++
            if(files.length>0)
             uploadImg(page,roleType,files)
            
        }
      
     
       


    },
    toSamplePage(){
        wx.reLaunch({
          url: '/page/center/center',
        })
    },
    refresh(page){
         wx.setStorageSync("isLogin",0)
         this.loginReset(page)
    },
    //获取名片列表
    getContactsList(page,type){
        console.log(type)
        var that=this
        wx.request({
            url:url.exposUrl+"/"+wx.getStorageSync('exposId')+"/contacts",
            method:"GET",
            data:{
                pageNo:1,
                pageSize:50,
                type:type
            },
            header: {
               'content-type': 'application/json',
               'authorization':wx.getStorageSync('authorization')
            },
            success:function(res){
                console.log(res.data)
                if(res.data.code==200){
                     page.setData({
                        contacts:res.data.contacts
                    })

                }
                else if(res.data.code==401){
                    that.toSamplePage()
                }
                else{
                     wx.showModal({
                        title: '提示',
                        content: res.data.message,
                        showCancel:false
                    });
                }
               
            },
            complete:function(){
                page.hideLoading()
            }

        })
    },
    //添加名片
    addCard(page){
        var that=this   
        wx.request({
            url:url.exposUrl+"/"+wx.getStorageSync('exposId')+"/contacts",
            method:"POST",
            data:{
                name:page.data.name,
                cardFront:page.data.cardFront,
                cardBack:page.data.cardBack,              
                remark:page.data.remark,
                type:page.data.type
            },
            header: {
               'content-type': 'application/json',
               'authorization':wx.getStorageSync('authorization')
            },
            success:function(res){
              
                if(res.data.code==200){
                    
                        var pages = getCurrentPages();
                        var currPage = pages[pages.length - 1];  
                        var prevPage = pages[pages.length - 2]; 
                        that.getContactsList(prevPage,page.data.type)
                        wx.navigateBack()
                  
                    
                }
                else if(res.data.code==401){
                    that.toSamplePage()
                }
                else{
                     wx.showModal({
                        title: '提示',
                        content: res.data.message,
                        showCancel:false
                    });
                }
               
            },
            complete:function(){
                page.setData({
                    loadingAdd:false,
                    loading:false
                })
            }
        })
    },
     //添加扫码得到的名片
    addScanCard(page,type){
        var that=this       
        wx.request({
            url:url.exposUrl+"/"+wx.getStorageSync('exposId')+"/contacts",
            method:"POST",
            data:{               
                cardKey:wx.getStorageSync('cardKey'),
                type:type
            },
            header: {
               'content-type': 'application/json',
               'authorization':wx.getStorageSync('authorization')
            },
            success:function(res){
                
                if(res.data.code==200){
                     page.toList()
                }
                else if(res.data.code==401){
                    that.toSamplePage()
                }
                else{
                     wx.showModal({
                        title: '提示',
                        content: res.data.message,
                        showCancel:false
                    });
                }
               
            },
            complete(){
                page.setData({
                    loadingAdd:false,
                    loading:false,
                    cardKey:""
                })
                wx.setStorageSync('cardKey','')
            }
        })
    },
    //type=0 个人页 type=1编辑页
    getMyCard(page,type){
        wx.request({
            url:url.mycardUrl,
            method:"GET",          
            header: {
               'content-type': 'application/json',
               'authorization':wx.getStorageSync('authorization')
            },
            success:function(res){
                console.log(res.data)
                if(res.data.code==200){
                    var card=res.data.card
                    if(type==0){
                        console.log(card.qrUrl)
                        var qrUrl=card.qrUrl
                        if(qrUrl==""||qrUrl==null){
                            wx.request({
                                url:url.qrUrl,
                                method:'POST',
                                data:page.data.path,
                                header: {
                                    'content-type': 'application/json',
                                    'authorization':wx.getStorageSync('authorization')
                                },
                                success(resp){
                                    if(resp.data.code==200){
                                        qrUrl=resp.data.qrUrl
                                        page.setData({
                                            qrUrl:qrUrl
                                        })
                                    }
                                    else{
                                        wx.showModal({
                                            title:'提示',
                                            content:res.data.message,
                                            showCancel:false
                                        })
                                    }
                                    
                                }
                            })
                        }
                        page.setData({
                            name:card.name,
                            mobile:card.mobile,
                            telephone:card.telephone,
                            email:card.email,
                            companyName:card.companyName,
                            position:card.position,
                            gender:card.gender,
                            address:card.address,                    
                            showCardFront:card.cardFront,
                            showCardBack:card.cardBack,
                            qrUrl:qrUrl,
                            hasCard:true,
                        })
                    
                    }
                    else{
                        var genders=page.data.genders;

                        if(res.data.card.gender==1){
                            genders[0].checked=false
                            genders[1].checked=true
                        }
                        page.setData({
                            name:card.name,
                            mobile:card.mobile,
                            telephone:card.telephone,
                            email:card.email,
                            companyName:card.companyName,
                            position:card.position,
                            gender:card.gender,
                            address:card.address, 
                            showCardFront:card.cardFront,
                            showCardBack:card.cardBack,
                            genders:genders
                        })
                    }
                    
                    

                }
                else if(res.data.code==400){
                    page.setData({
                        showAddBtn:true,
                        showEditBtn:false
                    })
                }
                else{
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
    deleteCard(page){
         page.setData({
            loading:true
         })
         var that=this
        console.log(page.data.remark)
        wx.request({
            url:url.exposUrl+"/"+wx.getStorageSync('exposId')+"/contacts/"+wx.getStorageSync('contactId'),
            method:"DELETE",
            header: {
               'content-type': 'application/json',
               'authorization':wx.getStorageSync('authorization')
            },
            success:function(res){
             
                if(res.data.code==200){
                   
                  page.onLoad()
                 
                }
                else if(res.data.code==401){
                    that.toSamplePage()
                }
                else{
                     wx.showModal({
                        title: '提示',
                        content: res.data.message,
                        showCancel:false
                    });
                }
               
            },
            complete:function(){
                page.setData({
                    loading:false,
                    showActionsSheet:false
                })
            }
        })
    },

    // getCardDetail(){
    //     var that=this
    //     wx.request({
    //         url:url.exposUrl+"/"+wx.getStorageSync('exposId')+"/contacts/"+wx.getStorageSync('contactId'),
    //         method:"GET",           

    //获取同事列表
    getExposUserList(page){
        var that=this
        wx.request({
            url:url.exposUrl+"/"+wx.getStorageSync('exposId')+"/users",
            method:"GET",


            header: {
               'content-type': 'application/json',
               'authorization':wx.getStorageSync('authorization')
            },
            success:function(res){

             
                if(res.data.code==200){
                     page.setData({
                        friends:res.data.expoUsers
                    })


                }
                else if(res.data.code==401){
                    that.toSamplePage()
                }
                else{
                     wx.showModal({
                        title: '提示',
                        content: res.data.message,
                        showCancel:false
                    });
                }
               
            },
            complete:function(){
                 page.hideLoading()
            }
        })
    
    },
   
    //获取邀请员工加入的验证码
    getUserInviteCode(page){
        var that=this
        wx.request({
            url:url.exposUrl+"/"+wx.getStorageSync('exposId')+"/users/invite",
            method:"GET",

            header: {
               'content-type': 'application/json',
               'authorization':wx.getStorageSync('authorization')
            },
            success:function(res){
                console.log(res.data)
                if(res.data.code==200){
                     page.setData({
                        inviteCode:res.data.inviteCode
                    })

                }
                else if(res.data.code==401){
                    that.toSamplePage()
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
    //员工加入展会
    inviteUserToExpos(inviteCode){
        console.log(inviteCode)
        var that=this   
        wx.request({
            url:url.exposUrl+"/"+inviteCode+"/users",
            method:"POST",
            data:{
                inviteCode:inviteCode,

            },
            header: {
               'content-type': 'application/json',
               'authorization':wx.getStorageSync('authorization')
            },
            success:function(res){
                console.log(res.data)
             
                if(res.data.code==200){
                    // wx.switchTab({
                    //     url:"/page/sample/index"
                    // })
                     wx.redirectTo({
                        url:"/page/sample/index"
                    })
                }
                else if(res.data.code==401){
                    that.toSamplePage()
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
     //员工加入样品间
    inviteUserToCompany(inviteCode,companyName){
        console.log(inviteCode)
        var that=this   
        wx.request({
            url:url.usersUrl,
            method:"POST",
            data:{
                invitationCode:inviteCode,
                isAgree:that.globalData.isAgree

            },
            header: {
               'content-type': 'application/json',
               'authorization':wx.getStorageSync('authorization')
            },
            success:function(res){
                console.log(res.data)
             
                if(res.data.code==200){
                    // wx.switchTab({
                    //     url:"/page/sample/index"
                    // })
                    if(that.globalData.isAgree==1)
                    {
                         wx.showModal({
                            title:'加入成功',
                            content:'您已成功加入'+companyName,
                            showCancel:false,
                            success(res){
                                if(res.confirm){
                                    that.toSamplePage()
                                }
                            }
                        })
                    }
                    else{
                        wx.showModal({
                            title:'加入失败',
                            content:'您已拒绝加入'+companyName,
                            showCancel:false,
                            success(res){
                                if(res.confirm){
                                    that.toSamplePage()
                                }
                            }
                        })
                    }
                   
                   
                }
                
                else{
                     wx.showModal({
                        title: '提示',
                        content: res.data.message,
                        showCancel:false,
                        success(resp){
                            if(resp.confirm){
                                that.toSamplePage()
                            }
                        }
                    });
                }
               
            }
        })
    },
    getShareContent(page){
        var that=this
        wx.request({
            url:url.shareUrl,
            method:"GET",
            data:{
                shareKey:wx.getStorageSync('shareKey'),
                pageNo:1,
                pageSize:50
            },
            header: {
                'content-type': 'application/json',
                'authorization':wx.getStorageSync('authorization')
            },
            success:function(res){
            
                if(res.data.code==200){
                    
                page.setData({
                    contact:res.data.contact,
                    samples:res.data.samples
                })
                
                }
                else if(res.data.code==401){
                    that.toSamplePage()
                }
                else{
                    wx.showModal({
                        title: '提示',
                        content: res.data.message,
                        showCancel:false
                    });
                }
                
            },
            complete:function(){
                page.hideLoading()
            }
        })
    },
    BackLastPage(){
        var pages = getCurrentPages();
        var currPage = pages[pages.length - 1];  //当前页面
        var prevPage = pages[pages.length - 2]; //上一个页面
        prevPage.onLoad()
        wx.navigateBack()
         
    },
     BackSampleListPage(){
        
        var pages = getCurrentPages();
        var currPage = pages[pages.length - 1];  //当前页面
        var prevPage = pages[pages.length - 2]; //上一个页面
        this.getSampleList(prevPage)
        wx.navigateBack()
    },
    toMainPage(){
        
    },
    //type=0单分享 type=1列表分享
    getShareList(page){
        var that=this
        wx.request({
            url:url.shareListUrl,
            method:'POST',
            data:{
                shareKey:page.data.shareKey
            },
            header: {
               'content-type': 'application/json',
               authorization:wx.getStorageSync('authorization')
               
            },
            success(res){
                if(res.data.code=="200"){
                   
                    that.getShareDetail(page,res.data.share[0].detailKey)
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
    getShareDetail(page,detailKey){
        wx.request({
            url:url.shareDetailUrl,
            method:'POST',
            data:{
                detailKey:detailKey
            },
            header: {
               'content-type': 'application/json',
               authorization:wx.getStorageSync('authorization')
               
            },
            success(res){
                if(res.data.code=="200"){
                    page.setData({
                        sample:res.data.share.sample
                    })
                    page.showPics()
                    
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
    }


            
        



})


