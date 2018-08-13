var app = getApp()
Page({

  data: {
    hidden: false

  },
  call_c_1() {

    wx.makePhoneCall({
      phoneNumber: '18106866076'
    })
  },
  call_c_2() {
    wx.makePhoneCall({
      phoneNumber: '18106865661'
    })
  },
  call_c_3() {
    wx.makePhoneCall({
      phoneNumber: '18106885131'
    })
  }
})