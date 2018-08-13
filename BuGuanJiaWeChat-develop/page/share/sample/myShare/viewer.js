var url=require('../../../../config.js')

var app=getApp()
var key=""
Page({
    data:{
        viewer:[],
        inputShowed: false,
        inputVal: "",
        type:'normal'

    },
    showInput: function () {
        this.setData({
            inputShowed: true
        });
    },
    hideInput: function () {
        this.setData({
            inputVal: "",
            inputShowed: false
        });
    },
   
 
    clearInput: function () {
        this.setData({
            inputVal: ""
        });
    },
 
  
    inputTyping: function (e) {
        this.setData({
            inputVal: e.detail.value
        });
    },
    onLoad(){ 
        key="";
         this.data.type='normal'
        this.getUsers()
        
       
    },    
    onPullDownRefresh(){
      this.onLoad()
      key="";
      this.data.type='normal'
   
      wx.stopPullDownRefresh();
    
   }, 
   serachViewer(e){
       this.setData({
            inputVal: e.detail.value,
            type:'search'
        });
        key=e.detail.value
       this.getUsers()
   }, 
   getUsers(){
      var that=this
        wx.request({
            url:url.viewersUrl,
            method:'GET', 
            data:{
                companyId:wx.getStorageSync('companyId'),
                sampleId:wx.getStorageSync('sampleId'),
                key:key,
                limit:100,
            },          
            header: {
               'content-type': 'application/json',
               'authorization':wx.getStorageSync("authorization")
               
            },
            success(res){
                if(res.data.code=="200"){
                    
                    that.setData({
                        viewer:res.data.viewer
                    })
                }
           
                else{
                    wx.showModal({
                        title: '提示',
                        content: res.data.message,
                        showCancel:false
                    });
                }
               
            },
            fail(){
                wx.showModal({
                title: '提示',
                content: '服务器连接失败',
                showCancel:false
                });
            },
            complete(){
              
            }

        })
   },
  
    
})