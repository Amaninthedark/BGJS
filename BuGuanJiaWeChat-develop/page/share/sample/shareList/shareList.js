
var url = require('../../../../config.js')
var sendAjax = require('../../../../util/sendAjax.js')
var util = require('../../../../util/util.js')
var app = getApp()
var searchType = 0;
var key = '';
Page({
   data: {
      inputShowed: false,
      inputVal: "",
      samples: [],
      share: [],
      searchSamples: [],
      pageNum: 0,
      pageNo: 1,
      hidden: false,
      shareKey: "",
      share_checked: false,
      ifShare: false,
      shareListHidden: true,
      sharePage: false,
      isEmpty: true,
      isEditor: false,
      shadow: true,
      sample_share: false,
      sample_public: false,
      sample_add: false,
      ishuahai: false
   },
   onReady() {
     var that = this
     
     that.setData({
       ishuahai: util.huahai_test(wx.getStorageSync('companyId'))
     })
   },
   onShow: function (e) {
      var that = this
      if (that.data.ifShare) {

      }
      else {
         var that = this;
         var companyId = wx.getStorageSync('companyId');
         wx.request({
            url: url.sampleSelectUrl,
            method: 'GET',
            data: {
               companyId: companyId
            },
            header: {
               'content-type': 'application/json',
               'authorization': wx.getStorageSync('authorization')
            },
            success(res) {
               if (res.data.code == 200) {
                  var share = res.data.sampleSelects
                  console.log("share了")
                  if (share.length == 0) {
                     that.setData({
                        chooseAll: false,
                        hidden: true,
                        samples: [],
                        share: [],
                        chooseType: 'nochoose',
                        chooseMode: false,
                        isEmpty: true,
                        isEditor: false,
                        shadow: true
                     })
                     console.log("share是0")
                     wx.setNavigationBarTitle({
                        title: '样品篮',
                     })
                  }
                  else {
                     for (var i = 0; i < share.length; i++) {
                        share[i].chooseType = 0;
                     }
                     wx.setNavigationBarTitle({
                        title: '样品篮(' + share.length + ")",
                     })
                     console.log("share》0  share列表");
                     console.log(share);
                     that.setData({
                        chooseAll: false,
                        hidden: true,
                        samples: share,
                        share: [],
                        chooseType: 'nochoose',
                        chooseMode: false,
                        isEmpty: false,
                        isEditor: false,
                        shadow: true
                     })
                  }
               }
            },
            fail(res) {
               console.log(res.data)
            }
         })
         that.getShareKey();
      }
   },
   toEditor() {
      var that = this;
      if (that.data.isEmpty) {
         wx.showModal({
            title: '提示',
            content: '请先添加样品',
         })
      }
      else {
         that.setData({
            isEditor: !that.data.isEditor
         })
      }
   },
   finishEditor() {
      var that = this;
      that.setData({
         isEditor: !that.data.isEditor
      })
   },
   toShareDetail(e) {
      var detailKey = e.currentTarget.id
      wx.navigateTo({
         url: "/page/share/sample/shareDetail/shareDetail?detailKey=" + detailKey
      })
   },
   sampleAction(e) {
      var sampleId = e.currentTarget.id
      wx.setStorageSync('sampleId', sampleId)
      wx.setStorageSync('fromBasket', true)
      wx.navigateTo({
        url: "/page/sample/pages/sampleDetail/sampleDetail?sampleId=" + sampleId
      })
   },
   handleGoShareDetail(e) {
       var detailKey = e.currentTarget.dataset.key
     wx.navigateTo({
         url: "/page/share/sample/shareDetail/shareDetail?detailKey=" + detailKey
     })
   },
   allShare() {
      var that = this
      that.setData({
         chooseAll: !that.data.chooseAll
      })
      var samples = this.data.samples
      var share = this.data.share
      var type = this.data.chooseType
      if (that.data.chooseAll) {
         for (var i = 0; i < samples.length; i++) {
            samples[i].chooseType = 0
         }
         console.log(samples)
         this.setData({
            share: samples
         })
         this.getChoosed()

      }
      else {
         this.setData({
            share: []
         })
         this.getChoosed()
      }
   },
   scanCode() {
      // var that = this;
      // wx.scanCode({
      //    onlyFromCamera: false,
      //    success: function (res) {
      //       that.getsampledata(res.result);
      //    },
      //    fail: function (res) { },
      //    complete: function (res) { },
      // })
      var that = this;
      if (!that.data.chooseMode) {
         wx.scanCode({
            onlyFromCamera: false,
            success: function (res) {
               console.log("------------------------------")
               console.log(res)
               if (res.scanType == "CODE_128")//类型是条形码
               {
                 that.getsampledata_barCode(res.result);
               }
               if (res.scanType == "QR_CODE")//类型是二维码
               {
                 that.getsampledata_QR_CODE(res.result);
               }
            },
            fail: function (res) { },
            complete: function (res) { },
         })
      }
   },
   getsampledata_barCode(result) {
     var sampleId = result.replace(/\b(0+)/gi, "")
     console.log("code128:" + sampleId)
     wx.request({
       url: url.samplesUrl + '/' + sampleId,
       method: 'GET',
       header: {
         'content-type': 'application/json',
         'authorization': wx.getStorageSync('authorization')
       },
       success(resp) {
         console.log(resp)
         if (resp.data.code == "200") {
           if (resp.data.sample.companyId == wx.getStorageSync('companyId')){
            if (resp.data.sample.status === 1) {
              wx.showModal({
                title: '提示',
                content: '该样品不存在',
                showCancel: false
              });

              return;
            }
            wx.navigateTo({
              url: "../scanAddShare/scanAddShare?sampleId=" + sampleId
            })
          } else {
           wx.showModal({
             title: '提示',
             content: '该样品不存在',
             showCancel: false
           });
          }
         }
         else {
           console.log(resp.data)
           wx.showModal({
             title: '提示',
             content: resp.data.message,
             showCancel: false
           });
         }
       }
     })
   },
   getsampledata_QR_CODE(res) {//二维码
     var that = this;
     var index = res.indexOf('publicKey');

     console.log(res);
     if (index == -1) {
       var list = res.split("/");
       var publicKey = list[list.length - 1];
       console.log(publicKey);
       wx.request({
         url: url.samplePublicUrl,
         method: 'POST',
         header: {
           'content-type': 'application/json'
         },
         data: {
           publicKey: publicKey
         },
         success(resp) {
           console.log(resp.data)
           if (resp.data.code == "200") {

             var sampleId = res.data.sample.sampleId;
             var companyId = wx.getStorageSync('companyId');

             if (res.data.sample.companyId == companyId) {
               wx.navigateTo({
                 url: "../scanAddShare/scanAddShare?sampleId=" + sampleId
               })
             }
             else {
               wx.showModal({
                 title: '提示',
                 content: '样品不存在',
               })
             }
           }
           else if (resp.data.code == "400") {
             wx.showModal({
               title: '提示',
               content: resp.data.message,
             })
           }
         },
         fail(resp) {
           console.log(resp)
         }
       })
     }
     else {
       let key = res.substr(index + 10);
       console.log(key);
       wx.request({
         url: url.samplesUrl + "/public / detail",
         method: 'POST',
         header: {
           authorization: wx.getStorageSync('authorization')
         },
         data: {
           publicKey: key
         },
         success(res) {
           
           if (res.data.code == "200") {
            var sampleId = res.data.sample.sampleId;
            var companyId = wx.getStorageSync('companyId');
        
             if (res.data.sample.companyId == companyId) {
               wx.navigateTo({
                 url: "../scanAddShare/scanAddShare?sampleId=" + sampleId
               })
             }
             else {
               wx.showModal({
                 title: '提示',
                 content: '样品不存在',
               })
             }

           }
           else {

             wx.showModal({
               title: '提示',
               content: res.data.message,
               showCancel: false
             });
           }
         }
       });
     }
   },
   toAdd() {
       var canAdd = this.data.sample_add
     // 自动判断 如果没有样品则去新增页面，如果有则去选择状态下的list
       wx.request({
           url: url.samplesUrl,
           header: {
               authorization: wx.getStorageSync('authorization')
           },
           data: {
               companyId: wx.getStorageSync('companyId')
           },
           success(res) {
               if (res.data.code == "200") {
                   
                   if (res.data.recordCount === 0 && canAdd) {
                       
                       wx.navigateTo({
                           url: '/page/sample/pages/addSample/addSample'
                       })
                     
                   } else {

                       wx.setStorageSync('isSelectToBasket',true) 
                      if( getCurrentPages().length > 1) {
                          wx.navigateBack()
                      } else{
                          wx.redirectTo({
                              url: '/page/sample/pages/sampleList/sampleList',
                          })
                      }
                       
                   }
               }else {
                   wx.setStorageSync('isSelectToBasket', true) 
                   wx.redirectTo({
                       url: '/page/sample/pages/sampleList/sampleList',
                   })
               }
           },
           fail(){
               wx.setStorageSync('isSelectToBasket', true) 
               wx.redirectTo({
                   url: '/page/sample/pages/sampleList/sampleList',
               })
           }
       });
     
   },

   getChoosed() {
      var samples = this.data.samples
      var share = this.data.share
      for (var sample of samples) {
         var flag = false
         for (var sampleId of share) {
            if (sample.sampleId == sampleId.sampleId) {
               flag = true
               break
            }
         }
         if (flag == true) {
            sample.chooseType = 1
         }
         else {
            sample.chooseType = 0
         }
      }
      this.setData({
         samples: samples
      })
   },
   hideShareListTip() {
      wx.setStorageSync('shareListHidden', true)
      this.setData({
         shareListHidden: true
      })
   },
   toHome() {
      
      wx.reLaunch({
         url: '/page/center/center'
      })
   },
   checkboxChange() {

      var share_checked = this.data.share_checked
      wx.setStorageSync('share_checked', !share_checked)
      this.setData({
         share_checked: !share_checked
      })

   },
   chooseOrCancel(e) {
      var samples = this.data.samples
      var sampleId = e.currentTarget.dataset.id
      var share = this.data.share
      var type = this.data.chooseType
      var that = this;

      // console.log(sampleId)
      // for(var sample of samples){
      //     if(sample.id==sampleId) sample.chooseType=1;
      // }
      for (var i = 0; i < samples.length; i++) {
         if (samples[i].sampleId == sampleId) {
            if (samples[i].chooseType == 0) {
               share.push(samples[i])
               // samples[i].chooseType=1
            }
            else {
               console.log('splice');
               that.setData({
                  chooseAll: false
               })
               // samples[i].chooseType=0
               for (var j = 0; j < share.length; j++) {
                  if (share[j].sampleId == sampleId) {
                     share.splice(j, 1)
                  }
               }
            }
         }

      }
      if (samples.length == share.length && share.length != 0) {
         that.setData({
            chooseAll: true
         })
      }
      this.setData({
         // samples:samples,
         share: share
      })
      this.getChoosed()
   },
   getShareList() {
      // console.log(pageNo);
      // console.log('share')
      var that = this;
      //  var companyId=wx.getStorageSync('companyId');
      var shareKey = that.data.shareKey
      wx.request({
         url: url.shareListUrl,
         method: 'POST',
         data: {
            shareKey: shareKey
         },
         header: {
            'content-type': 'application/json'

         },
         success(res) {
            // console.log(res.data);
            if (res.data.code == 200) {

               var share = res.data.share
               for (var sample of share) {
                  if (sample.samplePicKey.indexOf('?x-oss-process') > 0 && sample.samplePicKey.length > 0)
                     sample.samplePicKey = sample.samplePicKey + "/resize,m_fill,h_150,w_144"
                  else if (sample.samplePicKey.indexOf('?x-oss-process') <= 0 && sample.samplePicKey.length > 0)
                     sample.samplePicKey = sample.samplePicKey + "?x-oss-process=image/resize,m_fill,h_150,w_144"

               }
               that.setData({
                  samples: share,
                  hidden: true
               });
               //  that.getChoosed()
               // that.hideInput();
            }
            else if (res.data.code == 401) {
               app.createAuth(that, 0)
            }
            else {
               wx.showModal({
                  title: '提示',
                  content: res.data.message,
                  showCancel: false
               });
            }

         },
         fail() {
            wx.showModal({
               title: '提示',
               content: '服务器连接失败',
               showCancel: false
            });
         },
         complete() {

         }

      })
   },
   onLoad(options) {
      var that = this;
      
      // 只要进入样品篮， 皆视为需要更新样品列表
      wx.setStorageSync('needUploadSampleListSelect', true)
    
      wx.hideShareMenu({})
      console.log(options)

      // 从其他小程序进入专用 切换
      if (options.companyId){
        wx.setStorageSync('companyId', options.companyId)
      }
      if (options.shareKey || options.id) {
         wx.setNavigationBarTitle({
            title: "分享列表",
         })
         var shareKey = options.shareKey || options.id
         that.setData({
            ifShare: true,
            shareKey: shareKey,
            sharePage: true
         })
         if (wx.getStorageSync('isLogin') != 1)
            app.createAuth(this, 0)
         else
            that.getShareList()
      }
      else {
         var companyId = wx.getStorageSync('companyId');
         wx.request({
            url: url.sampleSelectUrl,
            method: 'GET',
            data: {
               companyId: companyId
            },
            header: {
               'content-type': 'application/json',
               'authorization': wx.getStorageSync('authorization')
            },
            success(res) {
               if (res.data.code == 200) {
                  var share = res.data.sampleSelects
                  if (share.length == 0) {
                     that.setData({
                        chooseAll: false,
                        hidden: true,
                        samples: [],
                        share: [],
                        pageNo: 1,
                        chooseType: 'nochoose',
                        chooseMode: false,
                        isEmpty: true,
                        isEditor: false,
                        addsample: true,
                     })
                  }
                  else {
                     for (var i = 0; i < share.length; i++) {
                        share[i].chooseType = 0;
                     }
                     if (share.length > 0) {
                        wx.setNavigationBarTitle({
                           title: '样品篮(' + share.length + ")",
                        })
                     }

                     that.setData({
                        chooseAll: false,
                        hidden: true,
                        samples: share,
                        share: [],
                        pageNo: 1,
                        chooseType: 'nochoose',
                        chooseMode: false,
                        isEmpty: false,
                        isEditor: false
                     })
                  }
               }
            },
            fail(res) {
               console.log(res.data)
            }
         })
        
     
      }

      // 获取权限值 分享，公开展厅 新增样品权限
      wx.request({
         url: url.companysUrl + "/" + wx.getStorageSync('companyId') + "/users/authority",
         method: 'GET',
         header: {
            'content-type': 'application/json',
            'authorization': wx.getStorageSync('authorization')
         },
         data: {
             authorityKeys: "sample_share, sample_public,sample_add_update"
         },
         success(res) {
            if (res.data.code == "200") {
               console.log("获取用户拥有权限详情")
               console.log(res.data.userAuthorityItems)

                that.setData({
                    sample_add: res.data.userAuthorityItems[0].haveRight == 1,
                    sample_share: res.data.userAuthorityItems[1].haveRight === 1,
                    sample_public: res.data.userAuthorityItems[2].haveRight == 1    
                })
            
            }
         }
      })
   },

   toDelete() {
      var samples = this.data.samples
      var sampleList = ""
      var that = this;
      console.log("samples:");
      console.log(samples);
      for (var i = 0; i < samples.length; i++) {
         if (samples[i].chooseType == 1) {
            if (sampleList == "") {
               sampleList = sampleList + samples[i].sampleId;
            }
            else {
               sampleList = sampleList + "," + samples[i].sampleId;
            }
         }
      }
      var companyId = wx.getStorageSync('companyId');
      if(sampleList!="")
      {
      wx.request({
         url: url.sampleSelectUrl,
         method: 'DELETE',
         data: {
            companyId: companyId,
            sampleIds: sampleList
         },
         header: {
            'content-type': 'application/json',
            'authorization': wx.getStorageSync('authorization')
         },
         success(res) {
            console.log(res.data);
            wx.showToast({
               icon: "loading",
               title: '删除中...',
               duration: 300
            })
            that.onShow();
         },
         fail(res) {
            console.log(res.data)
         }
      })
      }
   },
   handlePublic: function() {
     var that = this 
     var sampleIds = [];
     if (that.data.samples.length === 0) {
       return;
     }
     sampleIds = that.data.samples.map(item => item.sampleId).join()

     var publishOpt = {
       url: 'samples/public/publish',
       data: {
         operateType: 0,
         companyId: wx.getStorageSync('companyId'),
         sampleIds: sampleIds
       }
     }

     var publishCb = {}
     publishCb.success = function(data) {
       wx.showToast({
         title: '发布成功',
         duration: 500
       })
     }

     sendAjax(publishOpt, publishCb)
   },
   onShareAppMessage: function () {
      var that = this;
     // that.getShareKey()
      return {
         title: wx.getStorageSync('nickName') + '分享给您的样品,请惠存',
         path: '/page/share/sample/shareList/shareList?shareKey=' + that.data.shareKey
      }
   },
   getShareKey() {
      var that = this
      var companyId = wx.getStorageSync('companyId');
      that.setData({
          shareKey: ''
      })
      wx.request({
         url: url.samplesShareUrl,
         method: 'POST',
         data: {
            companyId: companyId
         },
         header: {
            'content-type': 'application/json',
            'authorization': wx.getStorageSync('authorization')
         },
         success(res) {
            console.log("更新")
            console.log(res.data.shareKey);
            if (res.data.code == 200) {
               that.setData({
                  shareKey: res.data.shareKey
               })
            }
         },
         fail(e) {
            wx.showModal({
               title: '提示',
               content: '分享失败',
               showCancel: false
            });
         }
      })
   },
});

