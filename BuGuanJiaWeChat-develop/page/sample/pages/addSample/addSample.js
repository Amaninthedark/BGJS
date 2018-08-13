var url = require('../../../../config.js')
var sendAjax = require('../../../../util/sendAjax.js')

var app = getApp()
// var publicPicIds=[],innerPicIds=[],privatePicIds=[];
var cnt = 0;
var pic_num = 0;
Page({
   data: {
      attributes: [],
      hideMoreInput: true,
      focus: [],
      tagName: "",
      //编辑传的参数
      tagIds: "",
      //获取的tag详情
      tags: [],
      //添加的tagname
      addTags: [],
      //添加的tagId
      addTagIds: [],
      remarkArr:['公有备注', '私有备注'],
      remarkIndex: 0,
      publicRemark: "",
      privateRemark: "",
      
      tags: [],
      tags_detail: [],

      pics: [{
         roleType: 0,
         picIds: ""
      }, {
         roleType: 1,
         picIds: ""
      }, {
         roleType: 2,
         picIds: ""
      }

      ],
      upload_pics: [{
         roleType: 0,
         showPath: [],
         uploadPath: [],
         picIds: []

      }, {
         roleType: 1,
         showPath: [],//展示图片
         uploadPath: [],//待上传图片
         picIds: []

      }, {
         roleType: 2,
         showPath: [],
         uploadPath: [],
         picIds: []
      }

      ],
      pics_detail: [],
      pic_types: ['公共样品图片', '私有样品图片'],
      current_pic_type: 0,


      showType: [true, false, false],
      showCloud: false,

      showLoading: false,
      loadingMessage: '',

      showActionsSheet: false,

      imageInAction: '',

      picRoleIndex: 0,
      loadingSave: false,
      loadingContinue: false,
      upload: false
   },
   onLoad: function () {
      wx.showNavigationBarLoading()
      app.getTags(this)
      //app.getAttributes(this)
      // app.getSampleDetail(this);
      //this.initFocus()

      var that = this
      //获取用户是否有查看敏感信息
      wx.request({
        url: url.companysUrl + "/" + wx.getStorageSync('companyId') + "/users/authority",
        method: 'GET',
        header: {
          'content-type': 'application/json',
          'authorization': wx.getStorageSync('authorization')
        },
        data: {
          authorityKeys: "company_screat_view",
        },
        success(res) {
          if (res.data.code == "200") {
            console.log("获取用户拥有权限详情")
            console.log(res.data.userAuthorityItems)

            if (res.data.userAuthorityItems[0].haveRight === 1) {
              that.setData({
                pic_types: ['公共样品图片', '私有样品图片', '内部样品图片']
              })
            }
            
          }
        }
      })
     
     // 获取动态字段
      var attrOpt = {
          url: '/company/attribute',
          type: 'GET',
          data: {
              companyId: wx.getStorageSync('companyId'), 
              isUsed: 1
          }
      }
      var attrCb = {}
      attrCb.success = function(data) {
          
          var attrs = []
          var beforeArr = []
          var afterArr = []

          data.attributes.forEach( item => {
            if (item.attributeId < 8) {

              beforeArr.push(item)
            } else {

              afterArr.push(item)
            }
          })

          beforeArr.sort((a, b) => a.attributeId - b.attributeId)

          attrs = beforeArr.concat(afterArr)

          attrs.forEach( (item, index) => {

              // 生成唯一的key
              item.index = index
              item.value = ''
             
              // 文本加选项
              if (item.valueType === 1){

                  item.options = item.options ? item.options.split(',') : []
              }
             
             // 纯选项  
              if (item.valueType === 2) {

                  item.selected = 0;
                  item.options = item.options ? ['选择' + item.prettyName].concat(item.options.split(',')) : ['选择' + item.prettyName]
              } 

              if (item.valueType === 3) {
                  item.dateArr = ['','']
              }
          })

          that.setData({
              attributes: attrs
          })
      }
      attrCb.complete = function() {
          wx.hideNavigationBarLoading()
      }
      sendAjax(attrOpt, attrCb)
   },
   /**
    * 开始动态绑定参数
    */
    // 普通输入
    handleAttrInput: function(e) {
        var index = e.currentTarget.dataset.index
        var val = e.detail.value

        var attrs = this.data.attributes
        attrs[index].value = val

        this.setData({
            attributes: attrs,
            //focus: []
        })
    },
    // 文本+选择 呼出选择
    handleTabShow: function (e) {
        var index = e.currentTarget.dataset.index
        var foucs = []
        foucs[index] = true

        this.setData({
            focus: foucs
        })
    },
    // 文本+选择 选择
    handleTabSelect: function(e) {
        var index = e.currentTarget.dataset.index
        var val = e.currentTarget.dataset.val
        console.log(e)
        var attrs = this.data.attributes
        attrs[index].value = val

        this.setData({
            attributes: attrs
        })
    }, 
    // 纯选择
    hangleSlideSelect: function (e) {
        var index = e.currentTarget.dataset.index
        var select = e.detail.value
    
        var attrs = this.data.attributes
        attrs[index].value = select == 0 ? '' : attrs[index].options[select]
        attrs[index].selected = select

        this.setData({
            attributes: attrs,
            focus: []
        })
    },
    // 日期选择
    handleDateSelect: function (e) {
        var index = e.currentTarget.dataset.index
        var value = e.detail.value

        var attrs = this.data.attributes
        attrs[index].dateArr[0] = value
        attrs[index].value = attrs[index].dateArr.join(' ').trim()
        console.log(attrs[index].value)
        this.setData({
            attributes: attrs,
            focus: []
        })
    },
    // 时间选择
    handleTimeSelect: function (e) {
        var index = e.currentTarget.dataset.index
        var value = e.detail.value

        var attrs = this.data.attributes
        attrs[index].dateArr[1] = value + ':00'
        attrs[index].value = attrs[index].dateArr.join(' ').trim()
        console.log(attrs[index].value)
        this.setData({
            attributes: attrs,
            focus: []
        })
    },
    // 清空时间选择
    handleClearDate: function(e) {
        var index = e.currentTarget.dataset.index
        var attrs = this.data.attributes

        attrs[index].dateArr = ['','']
        attrs[index].value = ''

        this.setData({
            attributes: attrs,
            focus: []
        })
    },
    // 自动选中优化
    handlAutoFocusNext: function(e) {
        var index = e.currentTarget.dataset.index
        var tabFocus = []
        tabFocus[index + 1] = true
        this.setData({
            tabFocus: tabFocus
        })
    },
    // 展示更多输入
    handleShowMoreInput: function() {
      this.setData({
        hideMoreInput: false
      })
    },
    // 控制哪个备注显示
    hangleSelectRemark: function(e) {
      this.setData({
        remarkIndex: e.detail.value
      })
    },
    // 标签
    addTag(e) {
      var val = e.detail.value;
      app.addToCloud(this, val)
    },
    deleteTag(e) {
        var index = e.currentTarget.dataset.index;
        var addTags = this.data.addTags;
        var addTagIds = this.data.addTagIds;
        addTags.splice(index, 1);
        addTagIds.splice(index, 1);
        this.setData({
            addTags: addTags,
            addTagIds: addTagIds,
            tagIds: addTagIds.join(',')
        })
    },
    addTagsVal(e) {
        var val = e.currentTarget.dataset.val;
        app.addToCloud(this, val);
    },
    // 切换图片分类
    changeType(e) {
        this.hideTagsHelp()

        var index = e.detail.value;

        var showType = [false, false, false];
        for (var i = 0; i < 3; i++) {
            if (i == index) showType[i] = true;

        }
        this.setData({
            current_pic_type: index,
            showType: showType
        });

    },
    // 准备上传图片
    chooseImage: function (roleType) {
        this.hideTagsHelp()
        var that = this;
        wx.chooseImage({
            count: 9,
            sizeType: ['compressed'],
            sourceType: ['album', 'camera'],
            success: function (res) {

                var tempFiles = res.tempFilePaths
                var upload_pics = that.data.upload_pics
                if (upload_pics[roleType].showPath.length + tempFiles.length > 9) {
                  wx.showModal({
                    title: '提示',
                    content: `类别图片请保持在9张以内`,
                    showCancel: false
                  });
                  return;
                }
                pic_num += res.tempFilePaths.length;
                upload_pics[roleType].showPath = upload_pics[roleType].showPath.concat(tempFiles)
                uploadImg(that, roleType, res.tempFilePaths)
            }
        })
    }, 
    choosePublicImage: function (e) {
        this.chooseImage(0);

    },
    chooseInnerImage: function (e) {
        this.chooseImage(1);

    },
    choosePrivateImage: function (e) {
        this.chooseImage(2);

    },
    deleteImage() {
        var roleType = this.data.picRoleIndex
        var path = this.data.imageInAction
        var pics = this.data.pics
        var upload_pics = this.data.upload_pics

        //从展示列表中删除
        for (var i = 0; i < upload_pics[roleType].showPath.length; i++) {
            if (upload_pics[roleType].showPath[i] == path) {
                upload_pics[roleType].showPath.splice(i, 1)
            }
        }

        //若已上传，从上传列表中删除
        for (var j = 0; j < upload_pics[roleType].uploadPath.length; j++) {
            if (upload_pics[roleType].uploadPath[j] == path) {
                upload_pics[roleType].uploadPath.splice(j, 1)
                upload_pics[roleType].picIds.splice(j, 1)
                pics[roleType].picIds = upload_pics[roleType].picIds.join(',')
            }

        }
        this.setData({
            showActionsSheet: false,
            upload_pics: upload_pics,
            pics: pics
        })
    },
    //获取标签的内容结束
    showTagsHelp() {
        this.setData({
            showCloud: true,
            focus: []
        })
    },
    hideTagsHelp() {
        console.log()
        this.setData({
            showCloud: false,
            focus: []
        })
    },
    //展示隐藏标签结束
    // 显示loading提示
    showLoading(loadingMessage) {
        this.setData({ showLoading: true, loadingMessage });
    },

    // 隐藏loading提示
    hideLoading() {
        this.setData({ showLoading: false, loadingMessage: '' });
    },

    // 隐藏动作列表
    hideActionSheet() {
        this.setData({ showActionsSheet: false, imageInAction: '', picRoleIndex: 0 });
    },

    // 显示可操作命令
    showActions(event) {
        this.setData({ showActionsSheet: true, imageInAction: event.currentTarget.dataset.src, picRoleIndex: event.currentTarget.dataset.index });
    },

    hangleTypeSelect: function (e) {
        var index = e.detail.value;
        this.setData({
        typeSelected: index,
        sampleType: this.data.typeRange[index]
        })
    },
    tagIdsBind: function (e) {

        this.setData({
            tagName: e.detail.value
        })
    },
    publicRemarkBind: function (e) {

        this.setData({
            publicRemark: e.detail.value
        })
    },
    privateRemarkBind: function (e) {

        this.setData({
            privateRemark: e.detail.value
        })
    },
    customAttributesBind(e) {
        var attributesMap = this.data.attributesMap;
        var attributeId = e.currentTarget.dataset.id;
        attributesMap[attributeId] = e.detail.value;
        this.setData({
            attributesMap: attributesMap
        })
    },
        //参数绑定结束
    saveAndToList(e) {
        var addType = e.currentTarget.dataset.type
        var that = this
        var canSave = true
        var attrs = that.data.attributes
        var saveData = {}

        var tipText = ''

        attrs.forEach( item => {

            if (!item.value && item.isRequired === 1) {
                canSave = false
                tipText += item.prettyName + ' '
            }
            // 加单位
            if (item.attributeId === 4) {
              item.value = !(/^[0-9]+$/.test(item.value.trim())) ? item.value : item.value ? item.value.trim() + "cm" : ""
            }

            // 加单位
            if (item.attributeId === 5) {
              item.value = !(/^[0-9]+$/.test(item.value.trim())) ? item.value : item.value ? item.value.trim() + "g/㎡" : ""
            }

            saveData[item.attributeId] = item.value.trim()
        })

        if (!canSave) {
            wx.showModal({
                title: '提示',
                content: `${tipText}属于必填字段，请填写`,
                showCancel: false
            });

            return;
        }

        this.setData({
            loadingSave: true
        })

        if (cnt < pic_num) {
            that.setData({
                loadingSave: false,
                loadingContinue: false
            })
            wx.showModal({
                title: '提示',
                content: '网速不佳，请重试',
                showCancel: false
            });
                    
           return
        }
            
        var addOpt = {
            url: '/samples',
            data: {
                companyId: wx.getStorageSync('companyId'),
                customAttribute: saveData,
                tagIds: that.data.tagIds,
                pics: that.data.pics,
                publicRemark: that.data.publicRemark,
                privateRemark: that.data.privateRemark
            }
        }

        var addCb = {}
        addCb.success = function(data) {
            wx.setStorageSync('isAddSample', true)
            if (addType === 'continue') {
                wx.redirectTo({
                  url: './addSample'
                })
            } else {
               
                wx.navigateBack()
            }
        } 
        addCb.complete = function() {
            that.setData({
                loadingSave: false,
                loadingContinue: false
            })
        }

        sendAjax(addOpt, addCb)
        

    }
})



var uploadImg = function (page, roleType, files) {
   var file = files.pop();
   var flag = false;

   var showPath = page.data.upload_pics[roleType].showPath
   for (var i = 0; i < showPath.length; i++) {
      if (showPath[i] == file) {
         flag = true
         break
      }
   }


   console.log(flag)
   if (flag == true) {
      wx.uploadFile({
        url: url.host + '/upload/pic',
         filePath: file,
         name: 'files',    
         formData: {
           bizType: 10,
           bizId: wx.getStorageSync('companyId')
         },
         header: {
            "Content-Type": "multipart/form-data",
            'authorization': wx.getStorageSync('authorization')
         },
         success: function (resp) {

            var res = JSON.parse(resp.data)
            // console.log(res)
            var publicPicIds = page.data.publicPicIds
            var innerPicIds = page.data.innerPicIds
            var privatePicIds = page.data.privatePicIds



            if (res.code == 200) {

               var pics = page.data.pics;
               var upload_pics = page.data.upload_pics
               //  var splitPics = res.picIds.split(',');
               upload_pics[roleType].uploadPath.push(file)
               upload_pics[roleType].picIds.push(res.picIds[0])
               pics[roleType].picIds = upload_pics[roleType].picIds.join(',')
               page.setData({
                  upload_pics: upload_pics,
                  pics: pics
               })
               if (files.length > 0)
                  uploadImg(page, roleType, files)
            }
            else {
               wx.showModal({
                  title: '提示',
                  content: res.message,
                  showCancel: false
               });
            }
         },
         fail: function (e) {

            wx.showModal({
               title: '提示',
               content: e.errMsg,
               showCancel: false
            });
         },
         complete: function () {
            cnt++;
            console.log(cnt)
         }
      })
   }
   else {
      cnt++
      if (files.length > 0)
         uploadImg(page, roleType, files)

   }





}

