// pages/ad/goodwx.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
    
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
    
    },

    /**
     * 拨打电话
     */
    handleMakeCall: function () {
      let phoneList = ['18106865661', '18106866076']
        wx.showActionSheet({
            itemList: phoneList,
            success: function (res) {
                wx.makePhoneCall({
                    phoneNumber: phoneList[res.tapIndex]
                })
            }
        })
    },

    /**
     * 查看小程序
     */
    handleLookDemo: function () {

        if (!wx.navigateToMiniProgram) {
            wx.showToast({
                title: '微信版本过低',
                iamge: '/image/aboutus.png'

            })
            return
        }
        wx.navigateToMiniProgram({
            appId: 'wx8122402400723845'
        })
    }
})