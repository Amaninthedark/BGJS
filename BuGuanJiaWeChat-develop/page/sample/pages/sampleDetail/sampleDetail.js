var url = require('../../../../config.js')
var QR = require("../../../../util/qrcode.js");
var sendAjax = require('../../../../util/sendAjax.js');
var util = require('../../../../util/util.js')
var app = getApp()

var cnt = 0;
var pic_num = 0;
var flag = true
Page({
  data: {
    currentNavtab: 0,
    isPublic: 0,
    sample: [],
    publicPic: [],
    innerPic: [],
    privatePic: [],
    state: 'success',//当前页面所处的状态，是否有图片在上传
    demo: '',
    remarks: [],
    sampleId: '',
    remarkId: '',
    pics: [{
      roleType: 0,
      picIds: ""
    }, {
      roleType: 1,
      picIds: ""
    }, {
      roleType: 2,
      picIds: ""
    }

    ],
    upload_pics: [{
      roleType: 0,
      littleImage: [],
      showPath: [],
      uploadPath: [],
      picIds: []

    }, {
      roleType: 1,
      littleImage: [],
      showPath: [],//展示图片
      uploadPath: [],//待上传图片
      picIds: []

    }, {
      roleType: 2,
      littleImage: [],
      showPath: [],
      uploadPath: [],
      picIds: []

    }

    ],
    // tab切换  
    currentTab: 0,
    edit_page: true,
    shareKey: "",
    share: [],
    showContent: true,
    placeholder: '输入新备注...',
    placeholderEdit: '输入新备注...',
    loadingPublic: false,
    loadingPrivate: false,
    havePublicRemark: false,
    havePrivateRemark: false,
    winWidth: 0,
    winHeight: 0,
    loadingDelete: false,
    showEditRemark: false,
    edit_remark: '',
    showActionsSheet: [false, false, false],
    roleType: 0,//当前操作的图片类型
    num: 0,//当前操作的是第几张图片
    sampleDocId: '',//当前操作的图片id
    priceRecord: [],
    sendRecord: [],
    docsRecord: [],
    selectArr: [],
    iSselected: false,
    shadow: false,
    sample_delete: false,
    sample_share: false,
    sample_supper: false,
    sample_inner: false,
    sample_add_update: false,
    sample_biz: false,
    pageX: 0,
    throttle: null,
    ishuahai: false,
    huahai_tab: false
  },

  onReady() {
    var that = this
    if (this.data.edit_page) {
      wx.setNavigationBarTitle({
        title: wx.getStorageSync('companyName')
      })
    }
    that.setData({
      ishuahai: util.huahai_test(wx.getStorageSync('companyId')),
      huahai_tab: util.huahai_test(wx.getStorageSync('companyId'))
    })

  },
  onLoad(options) {
    wx.hideShareMenu()
    cnt = 0;
    pic_num = 0;
    console.log(options)
    if (options.id) {
      wx.redirectTo({
        url: '/page/share/sample/shareDetail/shareDetail?shareKey=' + options.id
      })
      return
    }
    if (options.sampleId) {
      wx.setStorageSync('sampleId', options.sampleId)
      this.setData({
        sampleId: options.sampleId
      })

      /** 
     * 获取系统信息 
     */
      var that = this
      wx.getSystemInfo({
        success: function (res) {
          that.setData({
            winWidth: res.windowWidth,
            winHeight: res.windowHeight
          });
        }

      });

      //获取用户是否有分享权限\删除权限\查看敏感信息\增改
      wx.request({
        url: url.companysUrl + "/" + wx.getStorageSync('companyId') + "/users/authority",
        method: 'GET',
        header: {
          'content-type': 'application/json',
          'authorization': wx.getStorageSync('authorization')
        },
        data: {
          authorityKeys: "sample_share,sample_delete,company_screat_view,sample_add_update,biz_opp_view",
        },
        success(res) {
          if (res.data.code == "200") {
            console.log("获取用户拥有权限详情")
            console.log(res.data.userAuthorityItems)
            console.log(that.data.ishuahai);
            that.setData({
              sample_share: res.data.userAuthorityItems[3].haveRight === 1,
              sample_delete: res.data.userAuthorityItems[2].haveRight === 1,
              sample_inner: res.data.userAuthorityItems[0].haveRight === 1,
              sample_add_update: res.data.userAuthorityItems[1].haveRight === 1,
              sample_biz: that.data.ishuahai ? false : (res.data.userAuthorityItems[4].haveRight === 1)
            })

            if (res.data.userAuthorityItems[3].haveRight !== 1) {
              wx.hideShareMenu()
            }
            //加载记录
            if (res.data.userAuthorityItems[4].haveRight === 1) {

              // 报价
              var quoteOpt = {
                url: 'contact/quote/record',
                type: 'GET',
                data: {
                  sampleId: options.sampleId,
                  companyId: wx.getStorageSync('companyId'),
                  pageNo: 1,
                  pageSize: 50
                }
              }

              var quoteCb = {}
              quoteCb.success = function (data) {

                data.records.forEach((item) => {

                  var sampleObj;
                  item.recordDetail.some((sample) => {

                    if (sample.sampleId == options.sampleId) {
                      sampleObj = sample;
                      return true;
                    }
                  })

                  item.recordDetail = {};

                  if (typeof sampleObj === 'object') {

                    item.recordDetail = sampleObj;
                  }
                });


                that.setData({
                  priceRecord: data.records
                })
              }

              sendAjax(quoteOpt, quoteCb)

              // 寄样
              var sendOpt = {
                url: 'contact/send/record',
                type: 'GET',
                data: {
                  sampleId: options.sampleId,
                  companyId: wx.getStorageSync('companyId'),
                  pageNo: 1,
                  pageSize: 50
                }
              }

              var sendCb = {}
              sendCb.success = function (data) {

                data.records.forEach((item) => {

                  var sampleObj;
                  item.recordDetail.some((sample) => {

                    if (sample.sampleId == options.sampleId) {
                      sampleObj = sample;
                      return true;
                    }
                  })

                  item.recordDetail = {};

                  if (typeof sampleObj === 'object') {

                    item.recordDetail = sampleObj;
                  }
                });


                that.setData({
                  sendRecord: data.records
                })
              }

              sendAjax(sendOpt, sendCb)

            }
          }
        }
      })

      // 获取样品篮
      var selectListOpt = {
        url: '/samples/selects',
        type: 'GET',
        data: {
          companyId: wx.getStorageSync("companyId")
        }
      }

      var selectListCb = {};
      selectListCb.success = function (data) {
        var list = data.sampleSelects.map(item => item.sampleId);

        var isSelected = list.some(item => item == Number(options.sampleId));

        that.setData({

          selectArr: list,
          isSelected: isSelected
        });
      }
      sendAjax(selectListOpt, selectListCb)
    }
  },
  onShow() {
    var that = this;
    that.setData({
      isPublic: wx.getStorageSync("isPublic")
    })
    setTimeout(() => {

      that.getSampleDetail()
      that.getRemarks()
      that.getShareKey()
    }, 0)

    var animation = wx.createAnimation({
      duration: 150,
      timingFunction: 'ease',
    })
    that.animation = animation
  },
  onUnload() {
    var that = this;
    that.setData({
      isPublic: 0
    })
  },
  /** 
   * 滑动切换tab 
   */
  bindChange: function (e) {
    var that = this;
    var old = that.data.currentTab;
    var index = e.detail.current;

    that.setData({ currentTab: index });

  },
  handleTouchStart: function (e) {
    this.setData({
      pageX: e.changedTouches[0].pageX
    })
  },
  handleTouchEnd: function (e) {
    var that = this
    var left;
    if (!that.data.sample_biz) {
      return
    }
    if (e.changedTouches[0].pageX - 20 > that.data.pageX) {

      that.animation.left(0).step();
      that.setData({
        animationData: that.animation.export()
      })
    }

    if (e.changedTouches[0].pageX + 20 < that.data.pageX) {

      left = '-250rpx';
      if (that.data.sample_supper) {
        left = '-500rpx'
      }
      that.animation.left(left).step();
      that.setData({
        animationData: that.animation.export()
      })
    }
  },
  handleAddBasket: function () {

    var that = this
    var selectArr = that.data.selectArr

    var selectOpt = {
      url: '/samples/selects',
      data: {
        companyId: wx.getStorageSync("companyId"),
        sampleIds: wx.getStorageSync("sampleId")
      }
    }

    var selectCb = {}
    selectCb.success = function (data) {

      selectArr.push(Number(wx.getStorageSync("sampleId")))

      that.setData({
        selectArr: selectArr,
        isSelected: true
      })
      wx.setStorageSync('needUploadSampleListSelect', true)
    }

    sendAjax(selectOpt, selectCb)
  },
  handleGoBasket: function (e) {
    if (wx.getStorageSync('fromBasket')) {
      wx.setStorageSync('fromBasket', false)
      wx.navigateBack()
    } else {
      wx.redirectTo({
        url: '/page/share/sample/shareList/shareList'
      })
    }

  },
  /** 
   * 点击tab切换 
   */
  switchTab(e) {

    this.setData({
      currentTab: e.currentTarget.dataset.idx
    });
  },

  /** 
   * 点击tab切换 
   */
  swichNav(e) {

    var that = this;
    console.log(e.target.dataset.current)
    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current
      })
    }
  },

  getSampleDetail() {
    var that = this;
    if (!that.data.sampleId) {
      return
    }
    wx.request({
      url: url.samplesUrl + '/' + that.data.sampleId,
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'authorization': wx.getStorageSync('authorization')
      },
      success(res) {
        var sample = res.data.sample;
        console.log(sample);
        if (res.data.code == "200") {
          that.setData({
            sample: sample,
            docsRecord: sample.sampleDocs
          });
          that.showPics();
        }
        else if (res.data.code == "401") {
          app.getAuth(that, 2)

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
  showPics() {
    //  console.log(this.data.sample);
    var pics_detail = this.data.sample.pics
    console.log(pics_detail)
    var pics = [{
      roleType: 0,
      picIds: ""
    }, {
      roleType: 1,
      picIds: ""
    }, {
      roleType: 2,
      picIds: ""
    }

    ]
    var upload_pics = [{
      roleType: 0,
      littleImage: [],
      showPath: [],
      uploadPath: [],
      picIds: []

    }, {
      roleType: 1,
      littleImage: [],
      showPath: [],//展示图片
      uploadPath: [],//待上传图片
      picIds: []

    }, {
      roleType: 2,
      littleImage: [],
      showPath: [],
      uploadPath: [],
      picIds: []
    }

    ]


    for (var i = 0; i < pics_detail.length; i++) {
      var roleType = pics_detail[i].roleType
      for (var j = 0; j < pics_detail[i].pic.length; j++) {
        var sampleDocKey = pics_detail[i].pic[j].sampleDocKey
        if (sampleDocKey.indexOf('?x-oss-process') > 0)
          sampleDocKey = sampleDocKey + "/resize,m_fill,h_120,w137"
        else
          sampleDocKey = sampleDocKey + "?x-oss-process=image/resize,m_fill,h_120,w137"

        upload_pics[roleType].littleImage.push(sampleDocKey)
        upload_pics[roleType].showPath.push(pics_detail[i].pic[j].sampleDocKey)
        upload_pics[roleType].picIds.push(pics_detail[i].pic[j].docId)
        pics[roleType].picIds = upload_pics[roleType].picIds.join(',')
      }


    }

    this.setData({
      upload_pics: upload_pics,
      pics: pics
    })

  },
  clearInput() {
    this.setData({
      demo: '',
      placeholder: '输入新备注...'
    })
  },
  resetBar() {
    wx.hideNavigationBarLoading()
    wx.setNavigationBarTitle({
      title: wx.getStorageSync('companyName')
    })
    this.setData({
      state: 'success'
    })
  },
  addRemark(isOpen) {
    var that = this;
    var content = this.data.demo

    // wx.showNavigationBarLoading()

    wx.request({
      url: url.samplesUrl + "/" + that.data.sampleId + "/remarks",
      method: 'POST',
      data: {
        isOpen: isOpen,
        content: content
      },
      header: {
        'content-type': 'application/json',
        'authorization': wx.getStorageSync('authorization')
      },
      success(res) {
        // console.log(res.data);
        if (res.data.code == 200) {
          that.getRemarks();
          that.setData({
            demo: '',
          });

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
        that.setData({
          loadingPublic: false,
          loadingPrivate: false,
          placeholder: '输入新备注...',
        })
      }
    })
  },
  //saveSample() {
  changeSamplePic(picId, roleType, isDel) {
    var that = this

    var changeOpt = {
      url: `/samples/${that.data.sampleId}/pics`,
      type: 'PUT',
      data: {
        operateType: isDel ? 1 : 0,
        roleType: roleType,
        docIds: picId
      }
    }

    var changeCb = {}
    changeCb.success = function () {
      wx.setStorageSync('isEditDelSample', true)
      console.log('接口调用了')
      that.getSampleDetail()
      if (!isDel) {
        clearTimeout(that.data.throttle)
        that.setData({
          throttle: setTimeout(function () {
            that.getSampleDetail()
          }, 5000)
        })
      }
    }
    changeCb.complete = function () {
      that.resetBar()
    }
    sendAjax(changeOpt, changeCb)
  },
  chooseImage(roleType) {

    var that = this;

    wx.chooseImage({
      count: 9,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success(res) {

        var tempFiles = res.tempFilePaths
        var upload_pics = that.data.upload_pics
        pic_num += res.tempFilePaths.length;
        console.log(pic_num)
        // upload_pics[roleType].showPath=upload_pics[roleType].showPath.concat(tempFiles)
        // upload_pics[roleType].littleImage=upload_pics[roleType].littleImage.concat(tempFiles)
        wx.showNavigationBarLoading()
        wx.setNavigationBarTitle({
          title: '图片上传中，请勿离开'
        })
        that.setData({
          state: 'loading'
        })
        uploadImg(that, roleType, res.tempFilePaths)


      },
      fail() {
        that.resetBar()
      }
    })
  },
  choosePublicImage(e) {
    console.log(e)
    this.chooseImage(0);

  },
  chooseInnerImage(e) {
    this.chooseImage(1);

  },
  choosePrivateImage(e) {
    this.chooseImage(2);

  },
  toEdit() {
    //wx.setStorageSync('pageType', 'detail')
    // console.log(app.page)
    wx.navigateTo({
      url: '../editSample/editSample?sampleId=' + this.data.sampleId
    })
  },
  toDeleteSample() {
    var that = this;
    wx.showModal({
      title: '提示',
      content: '确定删除该样品吗？',
      confirmColor: "#56a4ff",
      success(res) {
        if (res.confirm) {
          that.deleteSample();
        }

      }
    });
  },
  deleteSample() {
    var that = this;
    this.setData({
      loadingDelete: true
    })
    wx.request({
      url: url.samplesUrl + "/" + this.data.sampleId,
      method: 'DELETE',
      header: {
        'content-type': 'application/json',
        'authorization': wx.getStorageSync('authorization')
      },
      success(res) {
        if (res.data.code == "200") {
          wx.setStorageSync('isEditDelSample', true)
          wx.setStorageSync('needUploadSampleListSelect', true)
          wx.navigateBack()
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
      }

    })
  },
  toDeleteImage(e) {
    var that = this

    var num = e.currentTarget.dataset.num
    this.hideActionSheet()
    if (this.data.state == 'loading') {
      wx.showModal({
        title: '提示',
        content: '图片正在上传，请稍后重试'
      })
      return;
    }
    wx.showModal({
      title: '提示',
      content: '确定删除该图片吗？',
      success(res) {
        if (res.confirm) {
          that.deleteImage()
        }
      }
    })
  },


  deleteImage() {
    wx.showNavigationBarLoading()

    var pics = this.data.pics
    var upload_pics = this.data.upload_pics
    var roleType = this.data.roleType
    var num = this.data.num

    this.changeSamplePic(upload_pics[roleType].picIds[num], roleType, true)


  },
  deleteRemark(e) {
    var that = this;
    var index = e.currentTarget.dataset.index
    var remarkId = this.data.remarks[index].remarkId

    wx.showModal({
      title: '提示',
      content: '确定删除该备注吗？',
      confirmColor: "#56a4ff",
      success(res) {
        if (res.confirm) {
          wx.request({
            url: url.samplesUrl + "/" + that.data.sampleId + "/remarks/" + remarkId,
            method: 'DELETE',
            header: {
              'content-type': 'application/json',
              'authorization': wx.getStorageSync('authorization')
            },
            success(res) {
              // console.log(res.data);
              if (res.data.code == 200) {
                that.getRemarks();

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
        }

      }
    })

  },
  cancelEditRemark() {
    this.setData({
      showEditRemark: false
    })
  },
  toEditRemark(e) {
    var index = e.currentTarget.dataset.index
    var remarks = this.data.remarks
    console.log(index)
    this.hiddenAction()
    this.setData({
      showEditRemark: true,
      edit_remark: remarks[index].content,
      remarkId: remarks[index].remarkId
    })
  },
  editRemark() {
    var that = this;
    // console.log('delete') 
    var content = this.data.edit_remark.trim()
    if (content == "") {
      this.setData({
        placeholderEdit: "请输入..."
      })
    }
    else {
      wx.request({
        url: url.samplesUrl + "/" + that.data.sampleId + "/remarks/" + that.data.remarkId,
        method: 'PUT',
        data: {
          content: that.data.edit_remark
        },
        header: {
          'content-type': 'application/json',
          'authorization': wx.getStorageSync('authorization')
        },
        success(res) {
          // console.log(res.data);
          if (res.data.code == 200) {
            that.setData({
              showEditRemark: false
            })
            that.getRemarks();

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
    }






  },
  moveToPublicImg() {
    this.changeImgTypeRole(0)
  },
  moveToInnerImg() {
    this.changeImgTypeRole(1)
  },
  moveToPrivateImg() {
    this.changeImgTypeRole(2)
  },
  changeImgTypeRole(roleType) {
    this.hideActionSheet()
    if (this.data.state == 'loading') {
      wx.showModal({
        title: '提示',
        content: '图片正在上传，请稍后重试'
      })
      return;
    }
    var that = this;
    wx.showNavigationBarLoading()
    wx.request({
      url: url.samplesUrl + "/" + this.data.sampleId + "/pics/" + this.data.sampleDocId,
      method: 'PUT',
      data: {
        roleType: roleType,
        position: that.data.upload_pics[roleType].littleImage.length + 1
      },
      header: {
        'content-type': 'application/json',
        'authorization': wx.getStorageSync('authorization')
      },
      success(res) {
        if (res.data.code == "200") {
          wx.setStorageSync('isEditDelSample', true)
          that.getSampleDetail()
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
        wx.hideNavigationBarLoading()
      }

    })
  },

  moveToPrivateRemark(e) {
    var that = this
    wx.showModal({
      title: '提示',
      content: '确认转移至私有备注吗?',
      success(res) {
        if (res.confirm) {
          var remarkId = e.currentTarget.dataset.index

          that.setData({
            remarkId: remarkId
          })
          that.changeRemarkRole(0)
        }
      }
    })

  },
  moveToPublicRemark(e) {
    var that = this
    wx.showModal({
      title: '提示',
      content: '确认转移至公有备注吗?',
      success(res) {
        if (res.confirm) {
          var remarkId = e.currentTarget.dataset.index

          that.setData({
            remarkId: remarkId
          })
          that.changeRemarkRole(1)
        }
      }
    })
  },
  changeRemarkRole(role) {
    var that = this;
    wx.showNavigationBarLoading()
    wx.request({
      url: url.samplesUrl + "/" + this.data.sampleId + "/remarks/" + this.data.remarkId + "/role",
      method: 'PUT',
      data: {
        isOpen: role
      },
      header: {
        'content-type': 'application/json',
        'authorization': wx.getStorageSync('authorization')
      },
      success(res) {
        if (res.data.code == "200") {
          that.getRemarks()
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
        wx.hideNavigationBarLoading()
      }

    })
  },
  getRemarks() {

    var that = this;
    if (!that.data.sampleId) {
      return
    }
    wx.request({
      url: url.samplesUrl + "/" + that.data.sampleId + "/remarks",
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'authorization': wx.getStorageSync('authorization')
      },
      success(res) {
        // console.log(res.data);
        if (res.data.code == "200") {
          var remarks = res.data.remarks;

          var num1 = 0, num2 = 0//num1私有备注
          for (var i = 0; i < remarks.length; i++) {
            remarks[i].showAction = false
            if (remarks[i].isOpen == 0) {
              num1++
            }
            else {
              num2++
            }
          }
          if (num1 != 0) {
            that.setData({
              havePrivateRemark: true
            })
          }
          if (num2 != 0) {
            that.setData({
              havePublicRemark: true
            })
          }
          that.setData({
            remarks: res.data.remarks
          })
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
      }

    })
  },
  //编辑删除备注菜单显示隐藏
  hiddenAction() {
    console.log('hidden')
    var remarks = this.data.remarks
    for (var i = 0; i < remarks.length; i++) {

      remarks[i].showAction = false
    }
    this.setData({
      remarks: remarks
    })
  },
  showAction(e) {
    var remarkId = e.currentTarget.dataset.index
    var remarks = this.data.remarks

    for (var i = 0; i < remarks.length; i++) {
      if (remarks[i].remarkId == remarkId)
        remarks[i].showAction = true
      else
        remarks[i].showAction = false
    }
    this.setData({
      remarks: remarks
    })
  },
  //修改图片类型，删除图片菜单显示隐藏
  showImgAction(e) {
    var roleType = e.currentTarget.dataset.index
    var num = e.currentTarget.dataset.num
    var pics = this.data.sample.pics
    var sampleDocId
    for (var pic of pics) {
      if (pic.roleType == roleType) {
        sampleDocId = pic.pic[num].sampleDocId
      }
    }
    //   sampleDocId=this.data.sample.pics[roleType].pic[num].sampleDocId
    var showActionsSheet = this.data.showActionsSheet
    console.log(sampleDocId)
    for (var i = 0; i < showActionsSheet.length; i++) {
      if (i == roleType)
        showActionsSheet[i] = true
      else
        showActionsSheet[i] = false
    }
    this.setData({
      roleType: roleType,
      num: num,
      sampleDocId: sampleDocId,
      showActionsSheet: showActionsSheet
    })

  },
  hideActionSheet() {

    this.setData({
      showActionsSheet: [false, false, false]
    })
  },
  getShowCode() {
    var that = this
    wx.request({
      url: url.samplesUrl + "/" + this.data.sampleId + "/share",
      method: 'POST',
      data: {
        sampleVersionId: 0
      },
      header: {
        'content-type': 'application/json',
        'authorization': wx.getStorageSync('authorization')
      },
      success(res) {
        if (res.data.code == "200") {
          wx.navigateTo({
            url: "/page/share/shareCode/shareCode?shareKey=" + res.data.shareKey
          })
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
      }

    })

  },
  previewPic(e) {
    // console.log(e);
    var roleType = e.currentTarget.dataset.index;
    var num = e.currentTarget.dataset.num;

    var pic = this.data.upload_pics[roleType].showPath;


    wx.previewImage({
      current: pic[num],
      urls: pic
    })
  },
  changeSlide() {
    var animation = wx.createAnimation({
      duration: 1000,
      timingFunction: 'ease',
    })

    this.animation = animation

    animation.rotateY(-90).step()

    this.setData({
      animationData: animation.export()
    })
  },
  changePublicSlide() {
    this.setData({
      showPublic: !this.data.showPublic
    });
  },
  changeInnerSlide() {
    this.setData({
      showInner: !this.data.showInner
    });
  },
  changePrivateSlide() {
    this.setData({
      showPrivate: !this.data.showPrivate
    });
  },
  changePublicDemo() {
    this.setData({
      showPublicDemo: !this.data.showPublicDemo
    })
  },
  changePrivateDemo() {
    this.setData({
      showPrivateDemo: !this.data.showPrivateDemo
    })
  },
  remarkBind(e) {
    this.setData({
      edit_remark: e.detail.value
    })
  },
  demoBind(e) {
    this.setData({
      demo: e.detail.value
    })
  },
  addPublicRemark() {
    var content = this.data.demo
    if (content == "") {
      this.setData({
        placeholder: '请输入...'
      })

    }
    else {
      this.setData({
        loadingPublic: true
      })
      this.addRemark(1)
    }


  },
  addPrivateRemark() {
    var content = this.data.demo
    if (content == "") {
      this.setData({
        placeholder: '请输入...'
      })

    }
    else {
      this.setData({
        loadingPrivate: true
      })
      this.addRemark(0)
    }

  },
  getShareKey() {
    var that = this
    if (!that.data.sampleId) {
      return
    }
    wx.request({
      url: url.samplesUrl + "/share",
      method: 'POST',
      data: {
        sampleIds: that.data.sampleId,
        companyId: wx.getStorageSync('companyId')
      },
      header: {
        'content-type': 'application/json',
        'authorization': wx.getStorageSync('authorization')
      },
      success(res) {
        if (res.data.code == "200") {

          var listOpt = {
            url: '/samples/share/list',
            data: {
              shareKey: res.data.shareKey
            }
          }

          var listCb = {}
          listCb.success = function (data) {
            that.setData({
              shareKey: data.share[0].detailKey
            })

          }

          sendAjax(listOpt, listCb)
          // app.getShareList(that,res.data.shareKey,0)
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
          content: '分享失败',
          showCancel: false
        });
      }

    })
  },
  toHome() {
    wx.navigateTo({
      url: '/page/sample/index'
    })
  },
  toShare() {
    wx.showShareMenu()
    this.getShareKey()

    // this.setData({
    //     shadow:true
    // })
  },
  onShareAppMessage() {
    var that = this;
    return {
      title: wx.getStorageSync('nickName') + '分享给您的样品' + that.data.sample.itemNo + ',请惠存',
      path: '/page/share/sample/shareDetail/shareDetail?detailKey=' + that.data.shareKey
    }

  },
  hideShadow() {
    this.setData({
      shadow: false
    })
  },

  //华海定制
  downDos(e) {
    wx.showLoading({
      title: '加载中',
    })

    setTimeout(function () {
      wx.hideLoading()
    }, 2000)

    let path = e.currentTarget.dataset.dockey.split('buguanjia.com')
    path = 'https://buguanjia.oss.aliyuncs.com' + path[path.length - 1]

    wx.downloadFile({
      url: path,
      success: function (res) {

        if (res.statusCode === 200) {

          var tempFilePaths = res.tempFilePath;
          wx.openDocument({
            filePath: tempFilePaths,
            success: function (res) {
              //console.log(res);

            },
            fail: function () {
              wx.previewImage({
                current: tempFilePaths, // 当前显示图片的http链接  
                urls: [tempFilePaths],// 需要预览的图片http链接列表  
                fail: function (res) {
                  wx.showModal({
                    title: '提示',
                    content: '只能打开指定文件类型(doc, xls, ppt, pdf, docx, xlsx, pptx)和图片',
                    showCancel: true
                  });
                }
              })
            }
          })
        }
      }
    })

  }

})

var tmpArr = [];
var uploadImg = function (page, roleType, files) {

  var file = files.pop();

  wx.uploadFile({
    url: url.host + '/upload/pic',
    filePath: file,
    name: 'files',
    // header: { "Content-Type": "multipart/form-data" },          
    formData: {
      bizType: 11,
      bizId: page.data.sampleId
    },
    header: {
      "Content-Type": "multipart/form-data",
      'authorization': wx.getStorageSync('authorization')
    },
    success: function (resp) {

      var res = JSON.parse(resp.data)
      if (res.code == 200) {

        console.log(res)
        // var pics = page.data.pics;
        // var upload_pics = page.data.upload_pics
        // //  var splitPics = res.picIds.split(',');
        // upload_pics[roleType].uploadPath.push(file)
        // upload_pics[roleType].picIds.push(res.picIds[0])
        // pics[roleType].picIds = upload_pics[roleType].picIds.join(',')
        // page.setData({
        //    upload_pics: upload_pics,
        //    pics: pics
        // })
        // page.saveSample()

        if (files.length > 0) {

          tmpArr.push(res.picIds[0])
          uploadImg(page, roleType, files)
        } else {
          tmpArr.push(res.picIds[0])
          var ids = tmpArr.join(',');
          tmpArr = [];
          page.changeSamplePic(ids, roleType)
        }
      }
      else {
        tmpArr = [];
        wx.showModal({
          title: '提示',
          content: res.message,
          showCancel: false
        });
      }
    },
    fail: function (e) {
      tmpArr = [];
      wx.showModal({
        title: '提示',
        content: e.errMsg,
        showCancel: false
      });

    },
    complete: function () {
      cnt++;
    }


  })

}


