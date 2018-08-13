var url = require('../../../../config.js')
var app = getApp()

Page({
  data: {
    attribute: {},
    pic: [],
    publicKey: '',
  },

  onLoad(options) {
    if (options.publicKey) {

      this.setData({
        publicKey: options.publicKey,
      })
      this.getShareDetail()

    }
  },
  getShareDetail() {
    var that = this;
    wx.showNavigationBarLoading()
    wx.request({
      url: url.host + '/samples/public/detail',
      method: 'POST',
      data: {
        publicKey: this.data.publicKey
      },
      header: {
        'content-type': 'application/json'

      },
      success(res) {
        console.log(res.data);
        if (res.data.code == "200") {

            var pics = res.data.sample.pics
            for (var pic of pics) {
              if (pic.sampleDocKey.indexOf('?x-oss-process') > 0 && pic.sampleDocKey.length > 0)
                pic.samplePicKey = pic.sampleDocKey + "/resize,m_fill,h_120,w116"
              else if (pic.sampleDocKey.indexOf('?x-oss-process') <= 0 && pic.sampleDocKey.length > 0)
                pic.samplePicKey = pic.sampleDocKey + "?x-oss-process=image/resize,m_fill,h_120,w116"
            }
            that.setData({
              attribute: res.data.sample.attribute,
              pic: pics
            })

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
      },
      complete() {
        wx.hideNavigationBarLoading()
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
})

