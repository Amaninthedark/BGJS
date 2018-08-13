var util = require('../../../../util/md5.js') 
var url=require('../../../../config.js')
var app=getApp()
Page({
    data:{
        mobile:"",
        code:"",
        password:"",
        loading:false,
        mobileFocus:true,
        codeFocus:false,
        passwordFocus:false,
        showMobileTip:false,
        showPasswordTip:false,
        disabled:false,
        code_message:"获取验证码",
        inviteCode:'',
        companyName:''
    },
    onLoad(options){
        console.log(options)
        if(options.inviteCode){
            this.setData({
                inviteCode:options.inviteCode,
                companyName:options.companyName
            })
        }
       
    },
     confirmMobile:function(e){
        
        this.setData({
            mobile:e.detail.value,
            showMobileTip:false
        
        });

        
    },
     confirmCode:function(e){
       
        this.setData({
            code:e.detail.value
           
        });
        // console.log(this.data.mobile);
    },
    confirmPassword:function(e){
        this.setData({           
            password:e.detail.value,
            showPasswordTip:false
        });
        
    },
    getCode(){
        if(!(/^1[3|4|5|7|8][0-9]{9}$/.test(this.data.mobile))){ 
            this.setData({
                mobileFocus:true,
                showMobileTip:true
            })
            
            return; 
        } 
        var times = 60;
        var that=this
        that.setData({
            disabled: true
        })
        var onCount = setInterval(function() {
            times--;
            if (times == 0) {
                clearInterval(onCount);
                
                that.setData({
                    code_message:"重新获取",
                    disabled:false
                })
            } else {
                that.setData({
                    code_message:times+"s",
                    disabled:true
                })
            }
        }, 1000);
     
        wx.request({
            url:url.checkCodeUrl,
            method:'POST',
            header: {
            'content-type': 'application/json'
            },
            data:{
                mobile:this.data.mobile,
                businessType:2
            },
            success:function(res){
            // console.log(res.data);
            if(res.data.code!="200"){
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
            }
        })
    },
    bindPhone:function(e){
        if(!(/^1[3|4|5|7|8][0-9]{9}$/.test(this.data.mobile))){ 
            this.setData({
                mobileFocus:true,
                showMobileTip:true
            })
            
            return; 
        } 
        if(this.data.code==""){
            this.setData({
                codeFocus:true,               
            })
            return;
        }
        if(this.data.password.length<6){
            this.setData({
                passwordFocus:true,
                showPasswordTip:true
            })
            return;
        }
        
        this.setData({
            "loading":!this.data.loading
        });
        var that=this;
        // console.log(app.globalData.unionId)
        // console.log(wx.getStorageSync('avatar'))
        wx.request({
            url:url.bindUrl,
            method:'POST',
            header: {
            'content-type': 'application/json'
            },
            data:{
                mobile:that.data.mobile,
                checkCode:that.data.code,
                password:util.hexMD5(that.data.password),
                unionId:app.globalData.unionId,
                nickName:wx.getStorageSync('nickName'),
                headimgurl:wx.getStorageSync('avatar')
            },
            success:function(res){
            // console.log(res.data);
            if(res.data.code==200){
                wx.setStorageSync('authorization',res.data.authorization)
                wx.setStorageSync('isBind',1)
                app.globalData.avater=res.data.avater
                app.globalData.userName=res.data.userName
                
                if(that.data.inviteCode!='')
                    app.inviteUserToCompany(that.data.inviteCode,that.data.companyName)
                
                else
                   app.BackLastPage()
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
                })
            }
        })
       
    }
})