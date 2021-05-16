function getPastFormat(DataObj,   dayfirst,dayarr,format,    minutefirst,minutearr,minuteformat) {
    /*
    参数1：Date或时间文本格式如 '2021-03-15' ,
    参数2：year,mothon,day,date可选比如你填的是'mothon'那么如果不超一年将返回X月前，X天前,而如果是'year'则一律返回X年前，X月前，X天前 ;
    参数3：==>  ['年前','月前','天前'] ;
    参数4：如果不是XX年/月/天前,要返回什么格式的时间文本 ;
    参数5：hour,minute,just(刚刚),time可选比如你填的是'minute'那么如果不超一个小时将返回X分钟前，0 刚刚,而如果是'hour'则一律返回X小时前，X分钟前，0 ;
    参数6：==> ['小时前','分钟前','刚刚'] ; 
    参数7：如果不是xx小时/xx分钟/xx天前,1 ;

    使用示例： getPastFormat(new Date(),'year',['年前','月前','天前'],'yyyy-MM-dd','hour',['小时前','分钟前','刚刚'],'hh:mm:ss')
    */  
    var time= Date.parse(new Date());
    var lasttime=(typeof DataObj)=='number'?DataObj:Date.parse(DataObj);

    //超过一天，计算过了几天
    var day=parseInt((time-lasttime)/(1000*60*60*24));
    //不到一天，计算一天过了几分钟
    var minute = Number.parseInt((time-lasttime)<86400000?(time-lasttime)/60000:0); 

    //默认值
    dayfirst?'':dayfirst='date';  minutefirst?'':minutefirst='time'; 

    var returnObj = {};

    //返回指定格式化文本，用到了传入的format
    function formatDate(date, fmt) {
            if (/(y+)/.test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
            }
            let o = {
                'M+': date.getMonth() + 1,
                'd+': date.getDate(),
                'h+': date.getHours(),
                'm+': date.getMinutes(),
                's+': date.getSeconds()
            };
            for (let k in o) {
                if (new RegExp(`(${k})`).test(fmt)) {
                let str = o[k] + '';
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? str : padLeftZero(str));
                }
            }
            return fmt;
    }
    function padLeftZero (str) {
       return ('00' + str).substr(str.length);
    }
    //处理“天时”
    function getDateText() {
        returnObj.type = "date"
        returnObj.typeNumber = formatDate(DataObj.getMinutes? DataObj:new Date(DataObj),format);
    }

    function dayparse(type) {
        returnObj.type = (type==365)?'year':((type==30)?'month':'day')
        returnObj.typeNumber =  Number.parseInt(day/type)+(type==365? (dayarr[0]?dayarr[0]:(day/type)):( type==30? (dayarr[1]?dayarr[1]:(day/type)):(dayarr[2]?dayarr[2]:(day/type)) ))   
    }
    let o = {
        'year':function() { (day>365)? dayparse(365):(day>30? dayparse(30):dayparse(1))},
        'month':function() { (day > 365)? getDateText() :(day>30? dayparse(30):dayparse(1))},
        'day':function() {(day>365)? getDateText() :(day>30? getDateText() :dayparse(1))},
        'date':function() { getDateText() }
    }
    //处理“分时”
    function getTimeText() {
        return  formatDate(DataObj.getMinutes? DataObj:new Date(DataObj),minuteformat);
    }
    function minuteparse(type) {
        returnObj.type=type;
        type=='init'? returnObj.typeNumber = (minutearr[2]?minutearr[2]:0):function() {
            type=='time'? returnObj.typeNumber = getTimeText() : function() {
                type=='hour' ? returnObj.typeNumber = Number.parseInt(minute/60)+(minutearr[0]?minutearr[0]:0) :function() {
                    type=='minute' ? returnObj.typeNumber = Number.parseInt(minute)+ (minutearr[1]?minutearr[1]:0) :''
                }();
            }();
        }();
    }
    let p = { 
        'hour':function() {(minute>60)? minuteparse('hour'):(minute>=1? minuteparse('minute'):minuteparse('init'))},
        'minute':function() { (minute>60)? minuteparse('time'):(minute>=1? minuteparse('minute'):minuteparse('init'))},
        'just':function() { (minute>60)? minuteparse('time'):(minute>=1? minuteparse('time'):minuteparse('init'))},
        'time':function() { minuteparse('time')}
    }

    day==0? p[minutefirst]():o[dayfirst]();
    return returnObj.typeNumber===undefined? DataObj : returnObj;
}
