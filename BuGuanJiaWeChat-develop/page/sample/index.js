var url=require('../../config.js')
var util = require('../../util/md5.js') 
var Base64 = require('../../util/base64_decode.js') 
var app=getApp()
Page({
  data: {
    companys:[],
    inviteCompanys:[],
    createCompanyLen: 0,
    
    showDelete:false,
    message:'',
    placeholder:'请正确输入单词DELETE',
    showContent:false,

  },
  toSampleList(e){
    var companyId=e.currentTarget.id;  
    var companyName=e.currentTarget.dataset.name;
    wx.setStorageSync('companyId',companyId);
    wx.setStorageSync('companyName',companyName);
    wx.redirectTo({
      url: 'pages/sampleList/sampleList',
    })
  },
  onPullDownRefresh(){

        this.getCompanyList()
        // this.getCompanyList()
        wx.stopPullDownRefresh();
     
  },
  onLoad() {
 
    var isLogin = wx.getStorageSync('isLogin');
    var isAuth = wx.getStorageSync('isAuth');
    if (isLogin == "" && isAuth != 1){
      wx.setStorageSync('isAuth',1);
      wx.navigateTo({url: '/page/user/pages/guide/guide'});
      return;
    }
    
    
    if(wx.getStorageSync("isBind")==1&&wx.getStorageSync("isLogin")==1){
        
        this.getCompanyList();
    } else {
    
      app.createAuth(this, 2)
    }
  },
  onShow() {
    if (wx.getStorageSync('isUploadCompany')) {
      wx.setStorageSync('isUploadCompany',false)
      this.getCompanyList();
    }
  },
  getCompanyList(){
    var that=this;      
    this.getDefaultCompany(0)
    //  wx.showNavigationBarLoading()


    wx.request({
      url:url.companysUrl,
      method:'GET',
      header: {
        'content-type': 'application/json',
        'authorization':wx.getStorageSync("authorization")
      },
      success(res){
        // console.log(res.data);
        if(res.data.code=="200"){
          app.company_num = 0;
          var companys = res.data.companys;

          companys.forEach( item => {
            // roleId 为 1 时 是所有者
            if ( item.roleId === 1 ) {

              app.company_num ++
            }
          });

          

          that.setData({
            companys: companys,
            inviteCompanys: res.data.inviteCompanys,
            createCompanyLen: app.company_num
          })
        }
        else if(res.data.code=="400"){           
          
        }
        else if(res.data.code=="401"){
          // wx.setStorageSync("isLogin",0)
          // that.onLoad()
          
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
      wx.hideNavigationBarLoading()
    }
    })
  },
  setDefaultCompany(e){
      var companyId=e.currentTarget.dataset.id
      var that=this
      wx.showModal({
      title:'提示',
      content:'设置该公司为默认样品间？',
      success(resp){
        if(resp.confirm){
          wx.showNavigationBarLoading()
          wx.request({
          url:url.settingsUrl,
          method:'PUT',
          data:{
            companyId:companyId
          },
          header: {
            'content-type': 'application/json',
            'authorization':wx.getStorageSync("authorization")
          },
          success(res){
            // console.log(res.data);
            if(res.data.code=="200"){
              that.setData({
                companyId: companyId
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
            wx.hideNavigationBarLoading()
          }
        })
        }
      }
    })
    
      
  },
  
  getDefaultCompany(type){
    // console.log('getdefault')
    var that=this
      wx.request({
      url:url.settingsUrl,
      method:'GET',
      header: {
        'content-type': 'application/json',
        'authorization':wx.getStorageSync("authorization")
      },
      success(res){
        // console.log(res)
        if(res.data.code=="200"){
          that.setData({
            companyId:res.data.companyId,
            companyName:res.data.companyName
          })
          // wx.setStorageSync('companyId',res.data.companyId);
          // wx.setStorageSync('companyName',res.data.companyName);
          // if( res.data.companyId !==0 ) {
          //   wx.redirectTo ({
          //     url: '/page/center/center'
          //   })
          // }
          
        }
        else if(res.data.code==400){

        }
        else if(res.data.code=="401"){
          // console.log('401')
          // app.getAuth(that,1)
          wx.setStorageSync('isLogin',0)
          that.onLoad()
          
        }
        else{
          wx.showModal({
          title: '提示',
          content: res.data.message,
          showCancel:false
          });
        }
      },
      fail(err){
          wx.showModal({
          title: '提示',
          content: err.errMsg,
          showCancel:false
          });
      }
    })
  },
  hiddenContent(){
    var companys=this.data.companys;
              
    for(var i=0;i<companys.length;i++)companys[i].showContent=false
    // for(var i=0;i<joinedCompanys.length;i++)joinedCompanys[i].showContent=false
    this.setData({
      'companys':companys,
      'showContent':false
    })
  },
  toEdit(e){
    var companyId=e.currentTarget.dataset.id
    this.hiddenContent()
    wx.navigateTo({
      url:'/page/company/pages/editCompany/editCompany?companyId='+companyId
    })
  },
  toColleague(e){
    var companyId=e.currentTarget.dataset.id
    var payStatus=e.currentTarget.dataset.paystatus
    wx.setStorageSync('companyName',e.currentTarget.dataset.name)
    wx.setStorageSync('companyId',companyId)
    // console.log(payStatus)
    // console.log(e)
    this.hiddenContent()
    wx.navigateTo({
      url:'/page/sample/pages/colleague/colleague?payStatus='+payStatus
    })
  },
  showContent(e){
    // var companyId=e.currentTarget.dataset.id
    var index=e.currentTarget.dataset.index
    var companys=this.data.companys
    for(var i=0;i<companys.length;i++){
      if(i==index)companys[i].showContent=!companys[i].showContent
      else  companys[i].showContent=false
    }
    
    this.setData({
      companys:companys,
      showContent:true
    })
  },
  showDelete(e){
    this.hiddenContent()
    // console.log(e.currentTarget.dataset.id)
    wx.setStorageSync('delCompanyId',Number(e.currentTarget.dataset.id))
    this.setData({
      showDelete:true
    })
  },
  messageBind(e){
    this.setData({
      message:e.detail.value
    
    })
  },
  confirm(){
    var that=this
    // console.log(this.data.message)
    var message=this.data.message
    if(message=="DELETE")
    {
        wx.request({
          url: url.companysUrl + "/" + wx.getStorageSync('delCompanyId'),
          method:'DELETE',
          header: {
            'content-type': 'application/json',
            'authorization':wx.getStorageSync("authorization")
          },
          success(res){
            // console.log(res.data);
            if(res.data.code=="200"){
              that.cancel()
              that.getCompanyList()
              console.log(wx.getStorageSync('delCompanyId'), wx.getStorageSync('companyId'))
              if (wx.getStorageSync('delCompanyId') == wx.getStorageSync('companyId') ) {

                wx.setStorageSync('companyId',0)
                wx.setStorageSync('companyName','')
              }
            }
            // else if(res.data.code=="401"){
            //   app.getAuth(that,1);
            
            // }
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
          }
        })
    }
    else if(message==""){
      this.setData({
        placeholder:'请输入DELETE'
      })
    }
    else{
      wx.showModal({
        title:'提示',
        content:'验证未通过，删除样品间失败',
        showCancel:false,
        complete(){
          that.cancel()
        }
      })
    }
  },
  cancel(){
    this.setData({
      showDelete:false,
      message:''
    })
  },

  /**
   * 处理邀请
   */
  handleDealInvite(e) {
    let that = this
    let agreeType = e.currentTarget.dataset.type
    let keyCode = e.currentTarget.dataset.key

    wx.request({
        url: url.companysUrl + "/users",
        method: 'POST',
        data: {
            invitationCode: keyCode,
            isAgree: agreeType
        },
        header: {
            'content-type': 'application/json',
            'authorization': wx.getStorageSync("authorization")
        },
        success(res) {
            // console.log(res.data);
            if (res.data.code == "200") {
                
                that.getCompanyList()
            } else {
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

  
 
  
})

