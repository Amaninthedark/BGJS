var url=require('../../../../config.js')
var decode = require("../../../../util/base64_decode.js");
var sendAjax = require("../../../../util/sendAjax.js");
var app=getApp()
Page({
    data:{
        inputShowed: false,
        inputVal: "",
         companyId:'',
         options:{},
         companyUsers:[],
         companyUserId:'',
         companyName:'',
         userId:'',
         inviteCode:"", 
         loading:false,       
         shadow:true,
         checked:false,
         searchResult:false,
         isAgree:0,
         payStatus:0,
         showInvite:false,
         firstOnlod:true,
         colleagueShareHidden:true,
         colleagueNumTipHidden:true,
         showIniteBox: false,
         groupsName: [],
         groupsId: [],
         groupIndex: 0,
         rolesName: [],
         rolesId: [],
         roleIndex: 0,
         loadInviteCode: false,
         invitePage: false
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
    serachColleague(e){
        this.setData({
            inputVal: e.detail.value
        });
         var companyId=wx.getStorageSync('companyId');
        var that=this;
     
        that.setData({
            hidden:false,
            companyUsers:[],
            pageNo:1,
            searchResult:true
        })
        this.setData({
            firstOnlod:false
        })
    
        this.getUsers();
    
    },
    hideShareTip(){
        wx.setStorageSync('colleagueShareHidden',true)
        this.setData({
            colleagueShareHidden:true
        })
    },
    hideNumTip(){
        wx.setStorageSync('colleagueNumTipHidden',true)
        this.setData({
            colleagueNumTipHidden:true
        })
    },
    onLoad(options){ 
        wx.hideShareMenu()
        this.setData({
            options:options
        })      
        
        console.log(options)
        if(options.id){
            this.setData({
                companyName:options.companyName,
                invitePage: true
            })
            var that=this
            wx.showModal({
                title:'提示',
                content:'确认加入'+options.companyName+'？',
                confirmText:'接受',
                cancelText:'拒绝',
                success(res){
                    if(res.confirm){
                        that.setData({
                            isAgree:1
                        })
                       
                        app.incomingCode(that,options.id,4)
                    }
                    else{
                        // that.setData({
                        //     isAgree:0
                        // })
                        // app.incomingCode(that,options.id,4)
                        wx.reLaunch({
                          url: '/page/center/center',
                        })
                    }
                }
            })
           
          
           
            // wx.switchTab('/page/sample/index?inviteCode')
        }      
        else{
            this.setData({
                payStatus:options.payStatus
            })
            this.showLoading()       
            this.getUsers()
           
           
        } 
       
    },
    hiddenTips(){
        this.setData({
           
            colleagueShareHidden:wx.getStorageSync('colleagueShareHidden'),
            colleagueNumTipHidden:wx.getStorageSync('colleagueNumTipHidden')
        })    
        var that=this
        if(that.data.payStatus==1&&that.data.companyUsers.length<30){
        
            if(that.data.colleagueShareHidden==true){
                that.setData({
                    colleagueShareHidden:true,
                    colleagueNumTipHidden:true
                })
            }
            else{
                that.setData({
                    colleagueShareHidden:false,
                    colleagueNumTipHidden:true
                })
            }
        }
        else{
            wx.hideShareMenu()
            if(that.data.companyUsers.length>=30&&that.data.payStatus==1){
                if(that.data.colleagueNumTipHidden==true){
                    that.setData({
                        colleagueNumTipHidden:true,
                        colleagueShareHidden:true
                    })
                }
                else{
                    that.setData({
                        colleagueNumTipHidden:false,
                        colleagueShareHidden:true
                    })
                }

            }
            else{
                that.setData({
                    colleagueNumTipHidden:true,
                    colleagueShareHidden:true
                })
            }
        }
    }, 
    getAll(){
      this.hideInput()
      
      this.setData({
          searchResult:false,
          inputVal:''
      })
      this.getUsers()
     
    
   },
   changeEditType(e){
       var companyUserId=e.currentTarget.dataset.id
       var userId=e.currentTarget.dataset.userid
       var companyUsers=this.data.companyUsers     
       for(var user of companyUsers){
           if(user.companyUserId==companyUserId&& user.showEdit==false)
             user.showEdit=true
           else
             user.showEdit=false
       }
       this.setData({
           companyUserId:companyUserId,
           userId:userId,
           companyUsers:companyUsers
       })

   },
   hideEdit(){
   
       var companyUsers=this.data.companyUsers     
       for(var user of companyUsers){
         
             user.showEdit=false
       }
       this.setData({
           
           companyUsers:companyUsers
       })
   },
   toSet(){
       var that=this
       wx.showModal({
           title:'提示',
           content:'确定转移管理员身份？',
           success(res){
               if(res.confirm){
                   that.setManager()
               }
           },
           complete(){
               that.hideEdit()
           }
       })

   },
   toRemove(){
      var that=this
       wx.showModal({
           title:'提示',
           content:'确定移除该员工？',
           success(res){
               if(res.confirm){

                   that.removeUser()
               }
           },
           complete(){
               that.hideEdit()
           }
       })
   },
   setManager(){
       var userId=this.data.userId
       var that=this 
       wx.request({
            url:url.companysUrl+"/"+wx.getStorageSync('companyId')+'/transfer',
            method:'POST',
            data:{
                targetUserId:userId
            },
            header: {
               'content-type': 'application/json',
               'authorization':wx.getStorageSync("authorization")
               
            },
            success(res){
                if(res.data.code=="200"){
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
            fail(){
                wx.showModal({
                title: '提示',
                content: '服务器连接失败',
                showCancel:false
                });
            },
            complete(){
                that.hideLoading()
            }

        })

   },
   removeUser(){
       var companyUserId=this.data.companyUserId
       var that=this 
       wx.request({
            url:url.companysUrl+"/"+wx.getStorageSync('companyId')+'/users/'+companyUserId,
            method:'DELETE',            
            header: {
               'content-type': 'application/json',
               'authorization':wx.getStorageSync("authorization")
               
            },
            success(res){
                if(res.data.code=="200"){
                   that.showLoading() 
                   that.setData({
                        firstOnlod:false
                    })
                   that.getUsers()
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
                that.hideLoading()
            }

        })

   },
   getUsers(){
      var that=this
        wx.request({
            url:url.companysUrl+"/"+wx.getStorageSync('companyId')+'/users',
            method:'GET',
            data:{
                pageNo:1,
                pageSize:99,
                searchInfo:this.data.inputVal
            },
            header: {
               'content-type': 'application/json',
               'authorization':wx.getStorageSync("authorization")
               
            },
            success(res){
                if(res.data.code=="200"){
                    var userList = [];
                    var userObj  = {};

                    res.data.companyUsers.forEach( item => {
                      item.showEdit = false;
                      if( userObj[item.roleId] ) {

                        userObj[item.roleId].list.push(item)
                      } else {

                        userObj[item.roleId] = {};
                        userObj[item.roleId].name = item.roleName || '待分配';
                        userObj[item.roleId].list = [item]
                      }
                    })

                    for (var x in userObj) {
                        userList.push(userObj[x])
                    }
                    // userList = Object.keys(userObj).map(key => (userObj[key]))

                    that.setData({
                      companyUsers: userList
                    })
                    
                    if (that.data.payStatus == 1 && res.data.companyUsers.length < 30) {
                      that.setData({
                        showInvite:true
                      });
                    } else {
                      wx.hideShareMenu()
                    }
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
                that.hideLoading()
            }

        })
   },

    showLoading(){
        this.setData({
            loading:true
        })
    },
    hideLoading(){
        this.setData({
            loading:false
        })
    },
    checkboxChange(){
        
        var checked=this.data.checked
        wx.setStorageSync('colleague_checked',!checked) 
        this.setData({
            checked:!checked
        })    
        
    },
    handleShowInviteBox(){
        wx.showShareMenu()
        let raceRole = false
        let raceGroup = false
      const that = this
      that.setData({
        showInviteBox: true
      })

      if( that.data.groupsId.length > 0 && that.data.rolesId.length > 0) {
        return;
      }

      let groupListOpt = {
        url: '/companys/' + wx.getStorageSync('companyId') + '/users/groups',
        type: 'GET'
      }

      let groupListCb = {}
      groupListCb.success = function (data) {
        let groupsId = []
        let groupsName = []

        data.groups.forEach(item => {
          groupsId.push(item.groupId)
          groupsName.push(item.name)
        })

        if (data.groups.length === 0) {
            groupsId = ['']
            groupsName = ['未设置成员组']
        }

        that.setData({
          groupsId,
          groupsName
        })

        raceGroup = true
        if (raceRole && raceGroup) {
            that.createInviteCode()
        }
      }

      let roleListOpt = {
        url: '/companys/' + wx.getStorageSync('companyId') + '/roles',
        type: 'GET'
      }
      
      let roleListCb = {}
      roleListCb.success = function(data) {
        let rolesId = []
        let rolesName = []

        data.roles.forEach( item => {

          if( item.id !== 1){
            rolesId.push(item.id)
            rolesName.push(item.name)
          }
        })

        if (data.roles.length === 1) {
            rolesId = ['']
            rolesName = ['未设置角色']
        }

        that.setData({
          rolesId,
          rolesName
        })

        raceRole = true
        if (raceRole && raceGroup) {
            that.createInviteCode()
        }
      }
      
      sendAjax(groupListOpt, groupListCb)
      sendAjax(roleListOpt, roleListCb)
    },
    handleRoleSelect(e) {
      this.setData({
        roleIndex: e.detail.value
      })
      this.createInviteCode()
    },
    handleGroupSelect(e) {
      this.setData({
        groupIndex: e.detail.value
      })
      this.createInviteCode()
    },
    handleHideInviteBox(){
        wx.hideShareMenu()
      this.setData({
        showInviteBox: false
      })
    },
    createInviteCode() {
      var that = this

      that.setData({
        loadInviteCode: true
      })

      var createOpt = {
        url: '/companys/' +wx.getStorageSync('companyId') + "/invite",
        type: 'GET',
        data: {
          roleId: that.data.rolesId[that.data.roleIndex] || '',
          groupId: that.data.groupsId[that.data.groupIndex] || ''
        }
      }

      var createCb = {}
      createCb.success = function( data) {
        that.setData({
          inviteCode: data.invitationCode
        })
      }
      createCb.complete =function(){
        that.setData({
          loadInviteCode: false
        })
      }

      sendAjax(createOpt, createCb)
    },
    onShareAppMessage() {
        console.log(this.data.inviteCode)
        var inviteCode=this.data.inviteCode
        return {
            title: wx.getStorageSync('nickName')+'邀请你和Ta一起管理'+wx.getStorageSync('companyName'),
            path: '/page/sample/pages/colleague/colleague?id='+inviteCode+"&companyName="+wx.getStorageSync('companyName')
        }
    }
    
})