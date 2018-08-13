var url = require('../../../../config.js')
var app = getApp()

Page({
   data: {
      sample: {},
      pic: [],
      sampleId: '',
   },
   onLoad(options) {
      console.log(options)

         wx.setStorageSync('sampleId', options.sampleId)
         this.setData({
            sampleId: options.sampleId
         })
         this.getSampleDetail()
   },
   getSampleDetail() {
      var that = this;
      wx.request({
         url: url.samplesUrl + '/' + that.data.sampleId ,
         method: 'GET',
         header: {
            'content-type': 'application/json',
            authorization: wx.getStorageSync('authorization')

         },
         success(res) {
            console.log(res.data);
            if (res.data.code == "200") {
                
                var pics = [];
                if (res.data.sample.pics[0]){
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
   sample_add(){
      var that=this;
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
            setTimeout( function() {
              wx.navigateBack()
            }, 1000)
            
         },
         fail(res) {
            console.log(res.data)
         }
      })
   }





})

