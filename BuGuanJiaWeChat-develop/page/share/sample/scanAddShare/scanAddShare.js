var url = require('../../../../config.js')
var app = getApp()

Page({
   data: {
      sample: {},
      pic: [],
      sampleId: ''
   },
   onLoad(options) {
      console.log(options)
      wx.setStorageSync('sampleId', options.sampleId)
      this.setData({
         sampleId: options.sampleId
      })
   },
   onShow() {
      this.getSampleDetail()
   },
   getSampleDetail() {
      var that = this;
      wx.request({
         url: url.samplesUrl + '/' + that.data.sampleId,
         method: 'GET',
         header: {
            'content-type': 'application/json',
            authorization: wx.getStorageSync('authorization')
         },
         success(res) {
            console.log(res.data);
            if (res.data.code == "200") {
                var pics = [];
                if (res.data.sample.pics[0]) {
                    pics = res.data.sample.pics[0].pic
                }
               for (var pic of pics) {
                  if (pic.sampleDocKey.indexOf('?x-oss-process') > 0 && pic.sampleDocKey.length > 0)
                     pic.samplePicKey = pic.sampleDocKey + "/resize,m_fill,h_90,w100"
                  else if (pic.sampleDocKey.indexOf('?x-oss-process') <= 0 && pic.sampleDocKey.length > 0)
                     pic.samplePicKey = pic.sampleDocKey + "?x-oss-process=image/resize,m_fill,h_90,w100"
               }
               that.setData({
                   sample: res.data.sample,
                   pic: pics
               });
            }
            else if (res.data.code == "401") {
               // app.getAuth(page,2)

            }
            else {
               wx.showModal({
                  title: '提示',
                  content: res.data.message,
                  showCancel: false
               });
            }
         }

      })
   },

   previewPic(e) {
      // console.log(e);

      var num = e.currentTarget.dataset.num;
      var pic = this.data.pic
      var pics = []
      for (var p of pic) {
         pics.push(p.sampleDocKey)
      }
      wx.previewImage({
         current: pics[num],
         urls: pics
      })
   },
   sample_add() {
      var that = this;
      var sampleId = that.data.sampleId;
      var companyId = wx.getStorageSync('companyId');

      wx.request({
         url: url.sampleSelectUrl,
         method: 'POST',
         data: {
            companyId: companyId,
            sampleIds: sampleId
         },
         header: {
            'content-type': 'application/json',
            'authorization': wx.getStorageSync('authorization')
         },
         success(res) {
            wx.showToast({
               title: '添加成功',
               duration: 300
            })
         },
         fail(res) {
            console.log(res.data)
         }
      })
   },
   toBasket() {
      wx.navigateBack()
   },
   scanNext() {
      var that = this;
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
   },
   getsampledata_barCode(result) {
     var that = this
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
          if (resp.data.sample.companyId == wx.getStorageSync('companyId')) {
           if (resp.data.sample.status === 1) {
             wx.showModal({
               title: '提示',
               content: '该样品不存在',
               showCancel: false
             });

             return;
           }
           that.setData({
             sampleId: sampleId
           })
           that.onShow()
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
             var companyId = wx.getStorageSync('companyId');
             if (res.data.sample.companyId == companyId) {
               that.setData({
                 sampleId: res.data.sample.sampleId
               })
               that.onShow()
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
           console.log(res);
           var sampleId = res.data.sample.sampleId;
           if (res.data.code == "200") {
             var companyId = wx.getStorageSync('companyId');
             console.log(res.data.sample.companyId)
             if (res.data.sample.companyId == companyId) {
               that.setData({
                  sampleId: sampleId
                })
                that.onShow()
             }
             else {
               wx.showModal({
                 title: '提示',
                 content: '样品不存在',
               })
             }

           }
           else {
             console.log(res.data)
             wx.showModal({
               title: '提示',
               content: resp.data.message,
               showCancel: false
             });
           }
         }
       });
     }
   },
})

