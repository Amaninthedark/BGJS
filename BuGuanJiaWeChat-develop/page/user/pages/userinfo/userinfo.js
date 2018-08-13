var url=require('../../../../config.js')
var app=getApp()
Page({
    data:{
        user:{}
    },
    onLoad:function(){
         var that=this;
        
        wx.request({
            url:url.userinfoUrl,
            method:'GET',
            header: {
               'content-type': 'application/json',
               'authorization':app.authorization
            },
            success:function(res){
                // console.log(res.data);
                if(res.data.code=="200"){
                    that.setData({
                        user:res.data.user
                    });
                }
                else if(res.data.code==401){
                   wx.setStorageSync("isLogin",0)
                    wx.showModal({
                    title: '提示',
                    content: '登录异常，我们将为您返回主界面',
                    showCancel:false,
                    success:function(resp){
                        if(resp.confirm){
                                wx.redirectTo({
                                url: '/page/sample/index'
                                })
                        }
                    }
                    });
            
                
            
            }
            },
            fail:function(){
                wx.showModal({
                title: '提示',
                content: '服务器连接失败',
                showCancel:false
                });
            }

        })
    },
    onPullDownRefresh:function(){
        this.onLoad();
       wx.stopPullDownRefresh();
    }
})