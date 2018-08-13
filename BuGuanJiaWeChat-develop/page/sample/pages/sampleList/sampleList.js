var url = require('../../../../config.js')
var sendAjax = require('../../../../util/sendAjax.js')
var util = require('../../../../util/util.js')
var app = getApp()

var imgurl = ["/image/order.png", "/image/order_top.png", "/image/order_down.png"]
Page({
  data: {
    samples: [],
    pageNum: 0,
    pageNo: 1,
    orderByType: '',
    key: '',
    havePics: '',
    hidden: false,
    selecting: false,
    selectArr: [],
    img_new: imgurl[0],
    img_width: imgurl[0],
    img_weight: imgurl[0],
    img_no: imgurl[0],
    addsample: false,
    platUserInfoMap: {},
    ishuahai: false
  },
  onShow: function () {

    var that = this

    // 判断是否是样品篮点击添加过来的
    if (wx.getStorageSync('isSelectToBasket')) {
      that.setData({
        selecting: true
      })
      wx.setStorageSync('isSelectToBasket', false)
    } else {
      that.setData({
        selecting: false
      })
    }



    // 搜索排序
    if (wx.getStorageSync('isSearch')) {

      wx.setStorageSync('isSearch', false);

      that.setData({
        key: wx.getStorageSync('searchKey'),
        havePics: wx.getStorageSync('havePics'),
        orderByType: '',
        img_new: imgurl[0],
        img_width: imgurl[0],
        img_weight: imgurl[0],
        img_no: imgurl[0]
      })

      wx.setStorageSync('isSearch', false);
      wx.setStorageSync('searchKey', '');
      wx.setStorageSync('havePics', '');
      that.getGoodList(true)
    }

    // 新增样品
    if (wx.getStorageSync('isAddSample')) {
      wx.setStorageSync('isAddSample', false)
      this.setData({
        orderByType: '',
        img_new: imgurl[0],
        img_width: imgurl[0],
        img_weight: imgurl[0],
        img_no: imgurl[0],
        key: '',
        havePics: ''
      })
      this.getGoodList(true)
    }

    // 删改样品
    if (wx.getStorageSync('isEditDelSample')) {
      wx.setStorageSync('isEditDelSample', false)
      this.getAfterEditDelList()
      return
    }

    // 样品篮子更新
    if (wx.getStorageSync('needUploadSampleListSelect')) {

      wx.setStorageSync('needUploadSampleListSelect', false)
      this.uploadSelect()
    }
  },
  uploadSelect() {
    var that = this
    var selectListOpt = {
      url: '/samples/selects',
      type: 'GET',
      data: {
        companyId: wx.getStorageSync("companyId")
      }
    }

    var selectListCb = {};
    var samples = that.data.samples;
    selectListCb.success = function (data) {


      var list = data.sampleSelects.map(item => item.sampleId);

      samples.forEach(item => {
        item.selected = list.some(select => select == item.sampleId)
      })

      that.setData({
        hidden: false,
        selectArr: list,
        samples: samples
      });
    }
    sendAjax(selectListOpt, selectListCb)
  },
  sortList(e) {
    var key = e.currentTarget.dataset.key;
    var up = e.currentTarget.dataset.up;
    var down = e.currentTarget.dataset.down;
    var old = this.data.orderByType;
    var now;
    var imgKey;

    if (old == up) {

      now = down;
      imgKey = imgurl[1]
    } else {

      now = up;
      imgKey = imgurl[2]
    }

    this.setData({
      orderByType: now,
      img_new: imgurl[0],
      img_width: imgurl[0],
      img_weight: imgurl[0],
      img_no: imgurl[0],
      ['img_' + key]: imgKey
    })

    this.getGoodList(true)
  },
  handleGoSearch() {
    wx.navigateTo({
      url: '/page/sample/pages/tabSearch/tabSearch'
    })
  },
  handleCancelSearch(e) {
    var key = e.currentTarget.dataset.key;
    this.setData({
      orderByType: '',
      pageNo: 1,
      img_new: imgurl[0],
      img_width: imgurl[0],
      img_weight: imgurl[0],
      img_no: imgurl[0],
      [key]: '',
      hidden: true
    })

    this.getGoodList(true)
  },
  handleGoSample(e) {
    if (this.data.selecting) {
      return
    }
    var sampleId = e.currentTarget.id;
    wx.setStorageSync('sampleId', sampleId)

    wx.navigateTo({
      url: "../sampleDetail/sampleDetail?sampleId=" + sampleId
    })
  },
  handleLongTap() {
    this.setData({
      selecting: !this.data.selecting
    })
  },
  // 扫码
  scanCode() {
    var that = this;
    that.setData({
      selecting: false
    })
    wx.scanCode({
      onlyFromCamera: false,
      success: function (res) {

        if (res.scanType == "CODE_128")//类型是条形码
        {
          that.getsampledata_barCode(res.result);
        }
        if (res.scanType == "QR_CODE")//类型是二维码
        {
          that.getsampledata_QR_CODE(res.result);
        }
        // else {
        //   // that.getsampledata_barCode(res.result);
        //    that.getsampledata_else(res.result);
        // }
      },
      fail: function (res) {

      },
      complete: function (res) { },
    })
  },
  getsampledata_barCode(result) {
    var that = this
    var sampleId = result.replace(/\b(0+)/gi, "")

    wx.request({
      url: url.samplesUrl + '/' + sampleId,
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'authorization': wx.getStorageSync('authorization')
      },
      success(resp) {

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
            wx.navigateTo({
              url: "../sampleDetail/sampleDetail?sampleId=" + sampleId
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


    if (index == -1) {
      var list = res.split("/");
      var publicKey = list[list.length - 1];

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

          if (resp.data.code == "200") {

            var companyId = wx.getStorageSync('companyId');

            if (res.data.sample.companyId == companyId) {
              var sampleId = res.data.sample.sampleId;
              wx.navigateTo({
                url: "../sampleDetail/sampleDetail?sampleId=" + sampleId
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
              content: resp.data.message,
            })
          }
        },
        fail(resp) {

        }
      })
    }
    else {

      let key = res.substr(index + 10);

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
            var companyId = wx.getStorageSync('companyId');

            if (res.data.sample.companyId == companyId) {
              var sampleId = res.data.sample.sampleId;
              wx.navigateTo({
                url: "../sampleDetail/sampleDetail?sampleId=" + sampleId
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
  getGoodList(isNew) {
    var that = this;
    var companyId = wx.getStorageSync('companyId');
    var selectArr = that.data.selectArr;

    that.setData({
      hidden: true
    })

    if (isNew) {
      that.setData({
        pageNo: 1,
        samples: []
      });
    }
    var listOpt = {
      url: '/samples',
      type: 'GET',
      data: {
        companyId: companyId,
        pageNo: that.data.pageNo,
        pageSize: 10,
        orderByType: that.data.orderByType,
      }
    }
    if (that.data.key !== '') {

      listOpt.data.searchType = 1;
      listOpt.data.key = that.data.key;

    }
    if (that.data.havePics !== '') {
      listOpt.data.havePics = that.data.havePics
    }

    var listCb = {};

    listCb.success = (data) => {
      var list = that.data.samples;

      // 过滤老数据
      list.forEach(item => {
        item.selected = selectArr.some(select => select == item.sampleId)

      })

      // 过滤新数据
      data.samples.forEach(item => {

        item.selected = selectArr.some(select => select == item.sampleId)
        item.samplePicKey = item.samplePicKey ? `${item.samplePicKey}?x-oss-process=image/resize,m_fill,h_150,w_144` : '';
        list.push(item)
      })

      that.setData({
        samples: list,
        pageNum: data.pageCount,
        pageNo: data.pageNo
      });
    }
    listCb.complete = () => {
      that.setData({
        hidden: false
      });
    }

    sendAjax(listOpt, listCb)
  },
  getAfterEditDelList() {
    var that = this;
    var companyId = wx.getStorageSync('companyId');
    var selectArr = that.data.selectArr;

    that.setData({
      hidden: true
    })

    var listOpt = {
      url: '/samples',
      type: 'GET',
      data: {
        companyId: companyId,
        pageNo: 1,
        pageSize: that.data.pageNo * 10,
        orderByType: that.data.orderByType,
      }
    }
    if (that.data.key !== '') {

      listOpt.data.searchType = 1;
      listOpt.data.key = that.data.key;

    }
    if (that.data.havePics !== '') {
      listOpt.data.havePics = that.data.havePics
    }

    var listCb = {};

    listCb.success = (data) => {
      var list = [];

      // 过滤老数据
      list.forEach(item => {
        item.selected = selectArr.some(select => select == item.sampleId)
      })

      // 过滤新数据
      data.samples.forEach(item => {
        item.selected = selectArr.some(select => select == item.sampleId)
        item.samplePicKey = item.samplePicKey ? `${item.samplePicKey}?x-oss-process=image/resize,m_fill,h_150,w_144` : '';
        list.push(item)
      })
      that.setData({
        samples: list,
        pageNum: data.pageCount
      });

      if (wx.getStorageSync('needUploadSampleListSelect')) {

        wx.setStorageSync('needUploadSampleListSelect', false)
        that.uploadSelect()
      }
    }
    listCb.complete = () => {
      that.setData({
        hidden: false
      });
    }

    sendAjax(listOpt, listCb)
  },
  handleSelect(e) {

    var that = this
    var samples = that.data.samples
    var index = e.currentTarget.dataset.index


    if (!that.data.selecting) {
      return
    }
    var isAdd = samples[index].selected ? false : true;

    var selectOpt = {
      url: '/samples/selects',
      type: isAdd ? 'POST' : 'DELETE',
      data: {
        companyId: wx.getStorageSync("companyId"),
        sampleIds: samples[index].sampleId
      }
    }

    var selectCb = {}
    selectCb.success = function (data) {
      var selectArr = that.data.selectArr
      var samples = that.data.samples
      samples[index].selected = isAdd ? 1 : 0;
      if (isAdd) {

        if (selectArr.indexOf(samples[index].sampleId) === -1) {
          selectArr.push(samples[index].sampleId)
        }
      } else {

        if (selectArr.indexOf(samples[index].sampleId) > -1) {
          selectArr.splice(selectArr.indexOf(samples[index].sampleId), 1)
        }

      }

      that.setData({
        selectArr: selectArr,
        samples: samples
      })
    }

    sendAjax(selectOpt, selectCb)
  },
  handleGoBasket() {
    wx.navigateTo({
      url: '/page/share/sample/shareList/shareList'
    })
  },
  onReady() {
    var that = this
    wx.setNavigationBarTitle({
      title: wx.getStorageSync('companyName')
    });
    that.setData({
      ishuahai: util.huahai_test(wx.getStorageSync('companyId'))
    })
  },
  onLoad() {

    var that = this

    if (wx.getStorageSync('isLogin') != 1) {
      app.createAuth(that, 2)
      return;
    }

    var companyId = wx.getStorageSync("companyId");
    if (companyId && companyId !== 0) {
      wx.setNavigationBarTitle({
        title: wx.getStorageSync('companyName')
      });
      that.setData({
        hidden: true,
        samples: [],
        selecting: false
      })

      var selectListOpt = {
        url: '/samples/selects',
        type: 'GET',
        data: {
          companyId: companyId
        }
      }

      var selectListCb = {}
      selectListCb.success = function (data) {

        var list = data.sampleSelects.map(item => item.sampleId);
        that.setData({
          selectArr: list
        });

        that.getGoodList();
      }
      sendAjax(selectListOpt, selectListCb)
    }
    else {
      that.getDefaultCompany();
    }

    //获取用户是否拥有增加修改权限
    wx.request({
      url: url.companysUrl + "/" + wx.getStorageSync('companyId') + "/users/authority",
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'authorization': wx.getStorageSync('authorization')
      },
      data: {
        authorityKeys: "sample_add_update"
      },
      success(res) {
        if (res.data.code == "200") {

          var auth = res.data.userAuthorityItems[0].haveRight === 1;

          wx.setStorageSync("sample_add_update", auth)

          that.setData({
            addsample: auth
          })

        }
      }
    })
  },
  onPullDownRefresh() {
    var that = this


    var selectListOpt = {
      url: '/samples/selects',
      type: 'GET',
      data: {
        companyId: wx.getStorageSync("companyId")
      }
    }

    var selectListCb = {}
    selectListCb.success = function (data) {

      var list = data.sampleSelects.map(item => item.sampleId);
      that.setData({
        selectArr: list
      });

      that.getGoodList(true);

      wx.stopPullDownRefresh();
    }
    sendAjax(selectListOpt, selectListCb)
  },
  getDefaultCompany() {
    var that = this
    wx.request({
      url: url.settingsUrl,
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'authorization': wx.getStorageSync("authorization")
      },
      success(res) {

        if (res.data.code == "200") {
          if (res.data.companyId == 0) {
            wx.showModal({
              title: '提示',
              content: '请选择样品间或新建一个样品间',
              showCancel: false
            })
            wx.navigateTo({
              url: '/page/sample/index',
            })
          }
          else {
            that.setData({
              companyId: res.data.companyId,
              companyName: res.data.companyName
            })
            wx.setStorageSync('companyId', res.data.companyId);
            wx.setStorageSync('companyName', res.data.companyName);
            wx.setNavigationBarTitle({
              title: res.data.companyName
            });
            that.onShow();
          }

        }
        else if (res.data.code == "400") {
        }
        else if (res.data.code == "401") {
          wx.setStorageSync('isLogin', 0)
          that.onLoad()
        }
        else {
          wx.showModal({
            title: '提示',
            content: res.data.message,
            showCancel: false
          });
        }
      },
      fail(err) {
        wx.showModal({
          title: '提示',
          content: err.errMsg,
          showCancel: false
        });
      }
    })
  },
  onReachBottom() {
    var that = this
    if (that.data.pageNo <= that.data.pageNum) {
      that.setData({
        pageNo: that.data.pageNo + 1,
        hidden: true
      })
      that.getGoodList();
    }
  }
});
