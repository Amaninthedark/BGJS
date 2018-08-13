var url=require('../../../../config.js')
var sendAjax = require('../../../../util/sendAjax.js')
var app=getApp()

var cnt=0;
var pic_num=0;
var files=[];
Page({
    data: {
        attributes: [],
        attrData:{},
        focus: [],
        tagName:"",
        //编辑传的参数
        tagIds:"",
        //获取的tag详情
        tags:[],
        //添加的tagname
        addTags:[],
        //添加的tagId
        addTagIds:[],
        tags:[],
        tags_detail:[],
        
        pics:[{
                roleType:0,
                picIds:""
            },{
                roleType:1,
                picIds:""
            },{
                roleType:2,
                picIds:""
            }
            
        ],
        upload_pics:[{
                roleType:0,
                showPath:[],
                uploadPath:[],
                picIds:[]
                
            },{
                roleType:1,
                showPath:[],//展示图片
                uploadPath:[],//待上传图片
                picIds:[]
                
            },{
                roleType:2,
                showPath:[],
                uploadPath:[],
                picIds:[]           
            }
            
        ],
        pics_detail:[],
        pic_types: ['公共样品图片', '私有样品图片'],
        current_pic_type: 0,   
        showType:[true,false,false],
        showList:false,
        showCloud:false,
        showLoading: false,   
        loadingMessage: '',
        showActionsSheet: false,
        loadingSave:false,
        loadingContinue:false,
        
        imageInAction: '',
        picRoleIndex: 0,

        focus:[]

    },
    onLoad(options) {
        wx.showNavigationBarLoading()
        //app.getSampleDetail(this);
        app.getTags(this)
        
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

        //获取动态表单数据
        var attrOpt = {
            url: '/company/attribute',
            type: 'GET',
            data: {
                companyId: wx.getStorageSync('companyId'),
                isUsed: 1
            }
        }
        var attrCb = {}
        attrCb.success = function (data) {

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

            attrs.forEach((item, index) => {

                // 生成唯一的key
                item.index = index
                item.value = ''

                // 文本加选项
                if (item.valueType === 1) {

                    item.options = item.options ? item.options.split(',') : []
                }

                // 纯选项  
                if (item.valueType === 2) {
                    item.selected = 0;
                    item.options = item.options ? ['选择' + item.prettyName].concat(item.options.split(',')) : ['选择' + item.prettyName]
                }

                if (item.valueType === 3) {
                    item.dateArr = ['', '']
                }
            })

            
            
            that.setData({
                attributes: attrs
            })
            
            // 获取该样品数据
            var infoOpt = {
                url: `/samples/${options.sampleId}`,
                type: 'GET'
            }

            var infoCb = {}
            infoCb.success = function(data) {
                that.setData({

                    attrData: data.sample.attributes,
                    tags_detail: data.sample.tags,
                    pics_detail: data.sample.pics

                });
                that.showAttr()
                that.showTags()
                that.showPics()
            }
            infoCb.complete = function() {

                wx.hideNavigationBarLoading()
            }
            sendAjax(infoOpt, infoCb)
        }
        sendAjax(attrOpt, attrCb)

    },
    /**
        * 开始动态绑定参数
        */
    // 普通输入
    handleAttrInput: function (e) {
        var index = e.currentTarget.dataset.index
        var val = e.detail.value.trim()

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
    handleTabSelect: function (e) {
        var index = e.currentTarget.dataset.index
        var val = e.currentTarget.dataset.val
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
        this.setData({
            attributes: attrs,
            focus: []
        })
    },
    // 清空时间选择
    handleClearDate: function (e) {
        var index = e.currentTarget.dataset.index
        var attrs = this.data.attributes

        attrs[index].dateArr = ['', '']
        attrs[index].value = ''

        this.setData({
            attributes: attrs,
            focus: []
        })
    },
    // 自动选中优化
    handlAutoFocusNext: function (e) {
        var index = e.currentTarget.dataset.index
        var tabFocus = []
        tabFocus[index + 1] = true
        this.setData({
            tabFocus: tabFocus
        })
    },
    changeFocus(e){
        var focus=this.data.focus
        var num=e.currentTarget.dataset.focus
        if(num==10)num+=e.currentTarget.dataset.index
        for(var i=0;i<15;i++){
            if(i==num) focus[i+1]=true
            else focus[i+1]=false
        }
        this.setData({
            focus:focus
        })

    },
    changeFocusp(e){
        var focusp=this.data.focusp
        var num=e.currentTarget.dataset.focus
        for(var i=0;i<9;i++){
            if(i==num) focusp[i+1]=true
            else focusp[i+1]=false
        }
        this.setData({
            focusp:focusp
        })

    },
    addTag(e){
        var val=e.detail.value;
        app.addToCloud(this,val)
    },
    deleteTag(e){
        var index=e.currentTarget.dataset.index;
        var addTags=this.data.addTags;
        var addTagIds=this.data.addTagIds;
        addTags.splice(index,1);
        addTagIds.splice(index,1);
        this.setData({
            addTags:addTags,
            addTagIds:addTagIds,
            tagIds:addTagIds.join(',')
        })
    },
    addTagsVal(e){
        var val=e.currentTarget.dataset.val;
       app.addToCloud(this,val);
    },
     bindPickerChange: function() {
         this.hideTagsHelp()
        this.setData({
            showList:!this.data.showList
        });
     
       
    },
    showTags(){
        var addTags=[];
        var addTagIds=[]; 
        var tags_detail=this.data.tags_detail;
        for(var i=0;i<tags_detail.length;i++){
            addTags.push(tags_detail[i].tagName)
            addTagIds.push(tags_detail[i].tagId)
        }
        this.setData({
            addTags:addTags,
            addTagIds:addTagIds,
            tagIds:addTagIds.join(',')
        })
    },
    changeType(e){
        this.hideTagsHelp()
        var index = e.detail.value;
         var showType=[false,false,false];
        for(var i=0;i<3;i++){
            if(i==index) showType[i]=true;
        
        }
        this.setData({
          current_pic_type: index,
          showType: showType
        });

    },
    showPics(){
        var pics_detail=this.data.pics_detail
        var pics=this.data.pics
        var publicFiles=this.data.publicFiles
        var innerFiles=this.data.innerFiles
        var privateFiles=this.data.privateFiles
        var publicPicIds=this.data.publicPicIds
        var innerPicIds=this.data.innerPicIds
        var privatePicIds=this.data.privatePicIds
        var upload_pics=this.data.upload_pics
        for(var i=0;i<pics_detail.length;i++){
            var roleType=pics_detail[i].roleType
             for(var j=0;j<pics_detail[i].pic.length;j++){
            
                upload_pics[roleType].showPath.push(pics_detail[i].pic[j].sampleDocKey)
                upload_pics[roleType].uploadPath.push(pics_detail[i].pic[j].sampleDocKey)
                upload_pics[roleType].picIds.push(pics_detail[i].pic[j].docId)                    
                pics[roleType].picIds=upload_pics[roleType].picIds.join(',')
            }
            
            this.setData({
               
                upload_pics:upload_pics,
                pics:pics
            })

        }
    },
    showAttr(){
        var that = this
        var datas = that.data.attrData
        var attrs = that.data.attributes

        // 拿到datas的key - value 格式
        var objDatas = {}
        datas.forEach( item => {
            objDatas[item.attributeId] = item.value
        })
        
        attrs.forEach( item => {
            item.value = objDatas[item.attributeId] || ''

            // 纯选项  
            if (item.valueType === 2) {
                let index = item.options.indexOf(item.value)
                index = index > -1 ? index : 0
                
                item.selected = index
            }

            // 日期选择器
            if (item.valueType === 3 && item.value) {
                let dateArr = item.value.split(' ')
                let ymd = dateArr[0]
                let hm = dateArr[1] ? dateArr[1] : ''
                item.dateArr = [ymd, hm]
            }
        })

        that.setData({
            attributes: attrs
        })
    },
 
    chooseImage(roleType) {
        this.hideTagsHelp()
        var that = this;
       
        wx.chooseImage({
            count:9,
            sizeType: ['compressed'], 
            sourceType: ['album', 'camera'],
            success(res) {
              
                var tempFiles=res.tempFilePaths
                var upload_pics=that.data.upload_pics
                pic_num+= res.tempFilePaths.length;
                upload_pics[roleType].showPath=upload_pics[roleType].showPath.concat(tempFiles)
                uploadImg(that,roleType,res.tempFilePaths)
                
              
            
                
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
    deleteImage(){
        var roleType=this.data.picRoleIndex
        var path=this.data.imageInAction
        var pics=this.data.pics
        var upload_pics=this.data.upload_pics
       
        //从展示列表中删除
        for(var i=0;i<upload_pics[roleType].showPath.length;i++){
            if(upload_pics[roleType].showPath[i]==path){
                upload_pics[roleType].showPath.splice(i,1)
            }
        }
      
        //若已上传，从上传列表中删除
        for(var j=0;j<upload_pics[roleType].uploadPath.length;j++){
            if(upload_pics[roleType].uploadPath[j]==path){
                upload_pics[roleType].uploadPath.splice(j,1)
                upload_pics[roleType].picIds.splice(j,1)
                pics[roleType].picIds=upload_pics[roleType].picIds.join(',')
            }

        }
         this.setData({
             showActionsSheet:false,
            upload_pics:upload_pics,
            pics:pics
        })

    

    },
    showTagsHelp(){
        this.setData({
            showCloud:true,
            focus: []
        })
    },
    hideTagsHelp(){
        this.setData({
            showCloud:false,
            focus: []   
        })
    },
     // 显示loading提示
    showLoading(loadingMessage) {
        this.setData({ showLoading: true, loadingMessage });
    },

    // 隐藏loading提示
    hideLoading() {
        this.setData({ showLoading: false, loadingMessage: '' });
    },
    showList(){
        this.setData({ showList: true});
    },

    hiddenList(){
        this.setData({ showList: false});
    }, 

    // 隐藏动作列表
    hideActionSheet() {
        this.setData({ showActionsSheet: false, imageInAction: '',picRoleIndex:0 });
    },

    // 显示可操作命令
    showActions(event) {
 
        this.setData({ showActionsSheet: true, imageInAction: event.currentTarget.dataset.src ,picRoleIndex:event.currentTarget.dataset.index});
    },
  
    hangleTypeSelect: function (e) {
      var index = e.detail.value;
      this.setData({
        typeSelected: index,
        sampleType: this.data.typeRange[index]
      })
    },

    tagIdsBind:function(e){
      
        this.setData({
            tagName:e.detail.value
        })
    },
    publicRemarkBind:function(e){
      
        this.setData({
            publicRemark:e.detail.value
        })
    },
    privateRemarkBind:function(e){
      
        this.setData({
            privateRemark:e.detail.value
        })
    },
    saveSample(){
     
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
            
        var editOpt = {
            url: `/samples/${wx.getStorageSync('sampleId')}`,
            type: 'PUT',
            data: {
                companyId: wx.getStorageSync('companyId'),
                customAttribute: saveData,
                tagIds: that.data.tagIds,
                pics: that.data.pics
            }
        }

        var editCb = {}
        editCb.success = function(data) {
           wx.setStorageSync('isEditDelSample', true)
            wx.navigateBack()
        } 
        editCb.complete = function() {
            that.setData({
                loadingSave: false,
                loadingContinue: false
            })
        }

        sendAjax(editOpt, editCb)
                  
    }
})

// var picIds=[];


var uploadImg=function(page,roleType,files){
       
        var file=files.pop();  
     
        var flag=false;      
        var showPath=page.data.upload_pics[roleType].showPath
        for(var i=0;i<showPath.length;i++){
            if(showPath[i]==file){
                flag=true
                break
            }
        }
       
        if(flag==true){
            wx.uploadFile({
            url: url.host + '/upload/pic',
            filePath:file,
            name: 'files',
            // header: { "Content-Type": "multipart/form-data" },          
            formData: {
            
              bizType: 11,
              bizId: wx.getStorageSync('sampleId')
            },
            header: {
            "Content-Type": "multipart/form-data",
            'authorization':wx.getStorageSync('authorization')
            },
            success:function(resp){
            
                var res= JSON.parse(resp.data)

                var publicPicIds=page.data.publicPicIds
                var innerPicIds=page.data.innerPicIds
                var privatePicIds=page.data.privatePicIds
                
                
                
                if(res.code==200){
                    // picIds.push(res.picIds);
                    
                    var pics=page.data.pics;
                    var upload_pics=page.data.upload_pics
                    //  var splitPics = res.picIds.split(',');
                    upload_pics[roleType].uploadPath.push(file)
                    upload_pics[roleType].picIds.push(res.picIds[0])
                    pics[roleType].picIds=upload_pics[roleType].picIds.join(',')
                     page.setData({
                        upload_pics:upload_pics,
                        pics:pics
                    })
             
                    if(files.length>0) 
                       uploadImg(page,roleType,files)
                }
                else{
                    wx.showModal({
                        title: '提示',
                        content: res.message,
                        showCancel:false
                        });
                    }
            },
            fail:function(e){
                wx.showModal({
                    title: '提示',
                    content: e.errMsg,
                    showCancel:false
                });
            
            },
            complete:function(){
                cnt++;

                
            }
            
            
        })
        }
        else{
            cnt++
            if(files.length>0)
             uploadImg(page,roleType,files)
            
        }
      
     
       


    }
