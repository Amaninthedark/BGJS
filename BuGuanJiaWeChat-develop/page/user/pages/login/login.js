var util = require('../../../../util/md5.js') 
var url=require('../../../../config.js')
var app=getApp()
Page({
    data:{
        mobile:"",
        password:"",
        loading:false
    },
    confirmMobile:function(e){
       
        this.setData({
            "mobile":e.detail.value
           
        });
        // console.log(this.data.mobile);
    },
    confirmPassword:function(e){
        this.setData({           
            "password":e.detail.value
        });
        // console.log(this.data.password);
    },
    formSubmit:function(e){
        this.setData({
            "loading":!this.data.loading
        });
        // console.log(e.detail.value);
    },
    login:function(){

        this.setData({
            "loading":!this.data.loading
        });
        var that=this;
        var mobile=this.data.mobile;
        var password=this.data.password;        
        wx.request({
            url: url.loginUrl, 
            method:'POST',
            data: {
                mobile: this.data.mobile ,
                password: util.hexMD5(password)
            },
            header: {
                'content-type': 'application/json'
            },
            success: function(res) {
                // console.log(res.data);
                if(res.data.code=="200"){
                    
                    app.mobile=mobile;
                    app.password=password;
                    app.authorization=res.data.authorization;
                    app.user=res.data;
                    wx.setStorageSync('mobile',mobile);
                    wx.setStorageSync('password',password);
                    wx.setStorageSync('user',res.data);
                  
                    wx.switchTab ({
                        url: '../../../sample/index'
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
                else{
                    wx.showModal({
                        title: '提示',
                        content: res.data.message,
                        showCancel:false
                    });
                }
                
               
            },
            fail:function(){
                 wx.showModal({
                    title: '提示',
                    content: '服务器连接失败',
                    showCancel:false
                 });
            },
            complete:function(){
               
                that.setData({
                   "loading":false
                });
            }
         })
       
    },
    onPullDownRefresh:function(){
        this.onLoad();
       wx.stopPullDownRefresh();
    },
    onLoad:function(){
        
        // if(app.mobile!=''){
        //      wx.switchTab ({
        //        url: '../../../sample/index'
        //     });
        // }
        var mobile=wx.getStorageSync('mobile');
        var password=wx.getStorageSync('password');
        if(mobile!=''){
            wx.request({
            url: url.loginUrl, 
            method:'POST',
            data: {
                mobile: mobile ,
                password: util.hexMD5(password)
            },
            header: {
                'content-type': 'application/json'
            },
            success: function(res) {
                // console.log(res.data);
                if(res.data.code=="200"){
                    
                    app.mobile=mobile;
                    app.password=password;
                    app.authorization=res.data.authorization;
                    app.user=res.data;
                    wx.setStorageSync('mobile',mobile);
                    wx.setStorageSync('password',password);
                    wx.setStorageSync('user',res.data);
                    
                    wx.switchTab ({
                        url: '../../../sample/index'
                    });
                }
               
                
               
            },
            fail:function(){
                
            },
            complete:function(){
               
               
            }
         })
        }
 

         
        //     this.setData({
        //         'mobile':wx.getStorageSync('mobile'),
        //         'password':wx.getStorageSync('password')
        //    })
        
        }
        
    
})

