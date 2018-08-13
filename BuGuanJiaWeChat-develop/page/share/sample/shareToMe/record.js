var url=require('../../../../config.js')
var util=require('../../../../util/util.js')

var app=getApp()

Page({
    data:{
        record:[],
        inputShowed: false,
        inputVal: "",

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
   
        this.getRecord()
      
        
       
    },    
    onPullDownRefresh(){
      this.onLoad()
   
   
      wx.stopPullDownRefresh();
    
   },  
   getRecord(){
      var that=this
        wx.request({
            url:url.samplesUrl+"/"+wx.getStorageSync('sampleId')+"/share/supplier/record",
            method:'GET', 
            data:{
                pageNo:1,
                pageSize:10
            },          
            header: {
               'content-type': 'application/json',
               'authorization':wx.getStorageSync("authorization")
               
            },
            success(res){
                if(res.data.code=="200"){
                    var record=res.data.record
                    for(var item of record){
                        console.log(item.shareTime)
                        var time=item.shareTime
                        var date=time.substr(0,10)
                        
                        var hour=time.substr(11,2)=='00'?0:time.substr(11,2).replace(/\b(0+)/gi,"")
                        var minute=time.substr(14,2)=='00'?0:time.substr(14,2).replace(/\b(0+)/gi,"")
                        var second=time.substr(17,2)=='00'?0:time.substr(17,2).replace(/\b(0+)/gi,"")
                        
                        // var minute=time.substr(14,2).replace(/\b(0+)/gi,"") 
                        // var second=time.substr(17,2).replace(/\b(0+)/gi,"")
                        // console.log(Date.parse(new Date(item.shareTime))/1000)
                        // console.log(date+" "+hour+" "+minute+" "+second)
                        var timestamp =parseInt(new Date(date).getTime() / 1000)+parseInt(hour)*3600+parseInt(minute)*60+parseInt(second)-28800
                        console.log(timestamp)
                         item.time=timestampFormat(timestamp)
                         item.timeSpecific=timestampFormatSpecific(timestamp)
                        
                        // if(timestamp==null||timestamp==""||timestamp.length==0){
                        //    console.log('sjs')
                        //     var time=item.shareTime
                        //     var year=time.substr(0,4)
                        //     var mouth=time.substr(4,2).replace(/\b(0+)/gi,"") 
                        //     var day=time.substr(8,2).replace(/\b(0+)/gi,"") 
                        //     var hour=time.substr(11,2).replace(/\b(0+)/gi,"") 
                        //     var minute=time.substr(14,2).replace(/\b(0+)/gi,"") 
                        //     var second=time.substr(17,2).replace(/\b(0+)/gi,"")
                        //     console.log(year+mouth+day+hour+minute+second) 
                        //     item.time=year+"年"+mouth+"月"+day+"日"
                        //     item.timeSpecific=hour+":"+minute
                        // }
                        // else{
                            // console.log(timestamp)
                            // item.time=timestampFormat(timestamp)
                            // item.timeSpecific=timestampFormatSpecific(timestamp)
                        // }
                       
                        
                    }
                    
                    that.setData({
                        record:record
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
   showDetail(){
       
   }
  
    
})

function timestampFormat( timestamp ) {
    function zeroize( num ) {
        return (String(num).length == 1 ? '0' : '') + num;
    }
 
    var curTimestamp = parseInt(new Date().getTime() / 1000); //当前时间戳
    var timestampDiff = curTimestamp - timestamp; // 参数时间戳与当前时间戳相差秒数
 
    var curDate = new Date( curTimestamp * 1000 ); // 当前时间日期对象
    var tmDate = new Date( timestamp * 1000 );  // 参数时间戳转换成的日期对象
 
    var Y = tmDate.getFullYear(), m = tmDate.getMonth() + 1, d = tmDate.getDate();
    var H = tmDate.getHours(), i = tmDate.getMinutes(), s = tmDate.getSeconds();
 
    if ( timestampDiff < 60 ) { // 一分钟以内
        return "刚刚";
    } else if( timestampDiff < 3600 ) { // 一小时前之内
        return Math.floor( timestampDiff / 60 )+"分";
    } else if ( curDate.getFullYear() == Y && curDate.getMonth()+1 == m && curDate.getDate() == d ) {
        return '今天';
    } else {
        var newDate = new Date( (curTimestamp - 86400) * 1000 ); // 参数中的时间戳加一天转换成的日期对象
        if ( newDate.getFullYear() == Y && newDate.getMonth()+1 == m && newDate.getDate() == d ) {
            return '昨天' ;
        } else if ( curDate.getFullYear() == Y ) {
            return  zeroize(m) + '/' + zeroize(d);
        } else {
            return  Y + '/' + zeroize(m) + '/' + zeroize(d);
        }
    }
}
function timestampFormatSpecific( timestamp ) {
    // console.log(timestamp)
    function zeroize( num ) {
        return (String(num).length == 1 ? '0' : '') + num;
    }
 
    var curTimestamp = parseInt(new Date().getTime() / 1000); //当前时间戳
    var timestampDiff = curTimestamp - timestamp; // 参数时间戳与当前时间戳相差秒数
 
    var curDate = new Date( curTimestamp * 1000 ); // 当前时间日期对象
    var tmDate = new Date( timestamp * 1000 );  // 参数时间戳转换成的日期对象
 
    var Y = tmDate.getFullYear(), m = tmDate.getMonth() + 1, d = tmDate.getDate();
    var H = tmDate.getHours(), i = tmDate.getMinutes(), s = tmDate.getSeconds();
 
    if ( timestampDiff < 60 ) { // 一分钟以内
        return "";
    } else if( timestampDiff < 3600 ) { // 一小时前之内
        return  "钟前";
    } else if ( curDate.getFullYear() == Y && curDate.getMonth()+1 == m && curDate.getDate() == d ) {
        return  zeroize(H) + ':' + zeroize(i);
    } else {
        var newDate = new Date( (curTimestamp - 86400) * 1000 ); // 参数中的时间戳加一天转换成的日期对象
        if ( newDate.getFullYear() == Y && newDate.getMonth()+1 == m && newDate.getDate() == d ) {
            return  zeroize(H) + ':' + zeroize(i);
        } else if ( curDate.getFullYear() == Y ) {
            return   zeroize(H) + ':' + zeroize(i);
        } else {
            return   zeroize(H) + ':' + zeroize(i);
        }
    }
}