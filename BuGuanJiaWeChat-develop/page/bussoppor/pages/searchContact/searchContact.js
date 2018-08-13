var url = require('../../../../config.js')
var util = require('../../../../util/util.js')
const query = require('../../../../util/getInviterFirst.js')
const sendAjax = require('../../../../util/sendAjax.js')
var app = getApp()
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
   * 联系人实现
   *
   */
  getuserdata(n) {
    let that = this;

    if (that.data.isLoading) {
      return
    }

    let infoOpt = {
      url: '/contact/bizOpp/contactUser',
      type: 'GET',
      data: {
        companyId: wx.getStorageSync('companyId'),
        limit: 999
      }
    }

    let infoCb = {}
    infoCb.success = function (data) {
      // console.log(data)
      data.contactUser.forEach(item => {
        item.ishidden = false;
      })
      data.contactUser.forEach(item => {
        if (item.contactUserName == ''){
          item.contactUserName = '(该用户没有姓名)';
        }
      })
      let arr = that.data.contactArr.concat(data.contactUser);
      // console.log(arr);
      that.setData({
        contactArr: arr,
        isLoading: false
      })
      that.data.contactArr.forEach(item => {
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
      let firstInitials = query(item.contactUserName)

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
   * 搜索功能
   */
  bindKeyInput: function (e) {

    let contactArr = this.data.contactArr
    let inputVal = e.detail.value
    let reg = new RegExp(inputVal, 'i')

    contactArr.forEach(item => {

      item.ishidden = !reg.test(item.contactUserName);
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

  //返回商机搜索页面，传名字参数过去
  tosearchBuss: function (e) {
    // console.log(e);
    var name = e.currentTarget.dataset.mes.contactUserName;
    var contactUserId = e.currentTarget.dataset.mes.contactUserId;
    let pages = getCurrentPages();//当前页面
    let prevPage = pages[pages.length - 2];//上一页面
    prevPage.setData({//直接给上移页面赋值
      inputName: name,
      contactUserId: contactUserId
    });
    wx.navigateBack({//返回
      delta: 1
    })
  }
})