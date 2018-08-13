var url = require('../../config.js')
var util = require('../../util/util.js')
var app = getApp()

// cardList.js
const query = require('../../util/getInviterFirst.js')
const sendAjax = require('../../util/sendAjax.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    scrollList: [],
    contactObj: {},
    scrollTop: 0,
    scrollTopstart: 0,
    contactArr: [],
    inputVal: '',
    // canIUserScroll: true,
    isLoading: false,
    emptySearch: false,
    isLoaded: false,
    rightHeight: 0
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    let that = this

    // 获取是否支持滚动到指定位置的功能
    // that.setData({
    //   canIUserScroll: !!wx.createSelectorQuery
    // })

    that.getuserdata(1);
    // 获取系统信息
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          rightHeight: res.windowHeight - 750 / 750
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this

    if (wx.getStorageSync('G_needUploadList') && that.data.isLoaded) {

      this.setData({
        contactArr: [],
        scrollTop: 0,
        scrollTopstart: 0,
        inputVal: ''
      })

      wx.setStorageSync('G_needUploadList', false)
      this.getuserdata(1)
    }

  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh: function () {
    this.setData({
      scrollTop: 0,
      scrollTopstart: 0,
      contactArr: [],
      inputVal: ''
    })
    this.getuserdata(1)
    wx.stopPullDownRefresh();
  },

  /**
   * 供应商通讯录实现
   *
   */
  getuserdata(n) {
    let that = this;

    if (that.data.isLoading) {
      return
    }

    let infoOpt = {
      url: '/contact/company',
      type: 'GET',
      data: {
        // pageNo: n,
        // pageSize: 999,
        // searchType: 0,
        companyId: wx.getStorageSync('companyId'),
        nature: 1
      }
    }

    let infoCb = {}
    infoCb.success = function (data) {
      console.log(data)
      data.contactCompanys.forEach(item => {
        item.ishidden = false;
      })
      let arr = that.data.contactArr.concat(data.contactCompanys);
      console.log(arr);
      that.setData({
        contactArr: arr,
        isLoading: false
      })
      that.data.contactArr.forEach(item => {
        if (item.name == '') {
          item.name = '暂无公司';
        }
        item.ishidden = false;
      })
      that.handleSortdata();
    }

    infoCb.beforeSend = () => {

      wx.showToast({
        title: '正在加载...',
        icon: 'loading',
        duration: 10000
      })
      that.setData({
        isLoading: true
      })
    }

    infoCb.complete = () => {

      wx.hideToast()
      that.setData({
        isLoading: false
      })
    }

    sendAjax(infoOpt, infoCb, () => {
      that.onLoad()
      wx.setStorageSync('G_needUploadIndex', true)
    });
  },

  /**
   * 拿到后台数据
   */
  handleSortdata() {

    let contactArr = this.data.contactArr;
    /**
     * 拿到数据那名字的首字母firstInitials.js
     * 处理为contactObj ={firstInitials{title:firstInitials,list:[item]}}
     */
    let contactObj = {}

    // console.log(contactArr)
    contactArr.forEach(item => {
      //查看拼音首字母大写,调用getInviterFirst.js
      let firstInitials = query(item.name)

      if (!((/[A-Z]/g).test(firstInitials))) {

        firstInitials = '11';
      }
      if (contactObj[firstInitials]) {

        contactObj[firstInitials].list.push(item)
      } else {

        if (firstInitials !== '11') {

          contactObj[firstInitials] = {
            title: firstInitials,
            list: [item]
          }
        } else {

          contactObj['11'] = {
            title: '#',
            list: [item]
          }
        }

      }
    })


    /**
     * 对首字母排序
     */
    let arr = []
    let hiddenCount = 0

    for (let key in contactObj) {
      contactObj[key].ishidden = contactObj[key].list.every(contact => contact.ishidden)
      arr.push(key)

      if (contactObj[key].ishidden) {
        hiddenCount++
      }
    }

    arr = arr.sort()

    this.setData({
      scrollList: arr,
      contactObj: contactObj,
      emptySearch: hiddenCount === arr.length
    })
  },

  /**
   * 滚动条位置
   */
  handleScroll: function (e) {

    this.setData({
      scrollTopstart: e.detail.scrollTop
    })
  },

  /**
   * 链接侧边字母与内容字母
   * 
   */
  handleScrollView(e) {
    let that = this

    // if (!that.data.canIUserScroll) {
    //   return
    // }


    let key = e.currentTarget.dataset.key
    if (key === '#') { key = '11' }

    let query = wx.createSelectorQuery()

    query.select(`#view_${key}`).boundingClientRect()
    query.selectViewport().scrollOffset()

    query.exec(function (res) {
      that.setData({

        scrollTop: that.data.scrollTopstart + res[0].top - 45
      })
    })
  },

  /**
   * 搜索功能
   */
  bindKeyInput: function (e) {

    let contactArr = this.data.contactArr
    let inputVal = e.detail.value
    let reg = new RegExp(inputVal, 'i')

    contactArr.forEach(item => {

      item.ishidden = !reg.test(item.name);
    })

    this.setData({
      contactArr,
      inputVal
    })

    this.handleSortdata()
  },

  /**
   * 清空输入
   */
  handlecancelSearch() {

    let contactArr = this.data.contactArr

    contactArr.forEach(item => {

      item.ishidden = false
    })

    this.setData({
      inputVal: '',
    });

    this.handleSortdata();

    return;
  },


  //跳转到供应商详情页面
  contactTap: function (e) {
    console.log(e);
    var id = e.currentTarget.dataset.mes.id;
    // var addresareaNamesDt = e.currentTarget.dataset.mes.areaName;
    // var fax = e.currentTarget.dataset.mes.fax;
    // var imgsrc = e.currentTarget.dataset.mes.imgsrc;
    // var mailCompany = e.currentTarget.dataset.mes.mailCompany;
    // var mailName = e.currentTarget.dataset.mes.mailName;
    // var mailbox = e.currentTarget.dataset.mes.mailbox;
    // var phoneNumber = e.currentTarget.dataset.mes.phoneNumber;
    // var source = e.currentTarget.dataset.mes.source;
    // var star = e.currentTarget.dataset.mes.star;
    wx.navigateTo({
      url: 'pages/SupplierDetail/SupplierDetail?id=' + id
    })
  }
})