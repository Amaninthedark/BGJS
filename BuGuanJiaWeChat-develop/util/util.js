function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function bd_gc(lat, lon) {
   var x = lon - 0.0065;
   var y = lat - 0.006;
   var x_pi = 3.14159265358979324 * 3000.0 / 180.0;
   var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_pi);
   var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_pi);
   var tempLon = z * Math.cos(theta);
   var tempLat = z * Math.sin(theta);
   return [tempLat, tempLon];
}
function bd_gc_arr(str) {
  var x = str.split(',')[0] - 0.0065;
  var y = str.split(',')[1] - 0.006;
  var x_pi = 3.14159265358979324 * 3000.0 / 180.0;
  var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_pi);
  var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_pi);
  var tempLon = z * Math.cos(theta);
  var tempLat = z * Math.sin(theta);
  return [tempLon, tempLat];
}
function gc_bd_str(str){
  var x = str.split(',')[0];
  var y = str.split(',')[1];
  var x_pi = 3.14159265358979324 * 3000.0 / 180.0;
  var z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * x_pi);
  var theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * x_pi);
  var lon = z * Math.cos(theta) + 0.0065;
  var lat = z * Math.sin(theta) + 0.006;
  return lon + ',' + lat
}

//华海定制判断
function huahai_test(company_id) {

  var company_id_array = [13962,8496];

  var result = '';

  return result = company_id_array.indexOf(Number(company_id)) != -1;
}

module.exports = {
  formatTime,
  bd_gc,
  gc_bd_str,
  bd_gc_arr,
  huahai_test
}

