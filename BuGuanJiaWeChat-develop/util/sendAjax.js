var url = require('../config.js')

function sendAjax(options, callback, outTimeType){
  // 登录信息过期处理类型
  var OTTYPE = outTimeType || 2;
  
  var _sets = options
  if (!_sets.type) { _sets.type = 'POST'}
  if (!_sets.data) { _sets.data = {}}

  _sets.type = _sets.type.toUpperCase();
  
  var scallback = callback.success || function (data) { };
  var ccallback = callback.complete || function (data) { };

  wx.request({
    url: url.host + _sets.url,
    method: _sets.type,
    data: _sets.data,
    header: {
      'content-type': 'application/json',
      'authorization': wx.getStorageSync('authorization')
    },
    success(res) {
      if (res.data.code == 200) {

        scallback(res.data);
      } else {

        if (res.data.code == 401) {
          wx.setStorageSync('isLogin', 0)
          getApp().createAuth(getCurrentPages().pop(), OTTYPE)
        } else {
          wx.showModal({
            title: '提示',
            content: res.data.message || '服务器连接失败',
            showCancel: false
          });
        } 
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
      ccallback()
    }
  })
}

module.exports = sendAjax
