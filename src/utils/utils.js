import moment from 'moment'
const utils = {
    isString: function(StringToCheck) {
        return Object.prototype.toString.call(StringToCheck) === '[object String]'
    },
    isNumber: function(NumberToCheck) {
        return Object.prototype.toString.call(NumberToCheck) === '[object Number]'
    },
    isObject: function(ObjectToCheck) {
        return Object.prototype.toString.call(ObjectToCheck) === '[object Object]'
    },
    isArray: function(ArrayToCheck) {
        return Object.prototype.toString.call(ArrayToCheck) === '[object Array]'
    },
    isFunction: function(FunctionToCheck) {
        return Object.prototype.toString.call(FunctionToCheck) === '[object Function]'
    },
    isObjectNull: function(ObjectToCheck) {
        return Object.keys(ObjectToCheck).length > 0
    },
    // 是否是空对象
    isNullObject: function(ObjectToCheck) {
        return Object.keys(ObjectToCheck).length > 0
    },
    /**
     * [apiUrl api接口路径处理]
     * @Author   szh
     * @DateTime 2017-12-06
     * @param    {String}   url [请求接口地址]
     * @return   {String}       [加上api前缀的请求接口地址]
     */
    apiUrl: function(url) {
        let regx = /^\/{1,}/g
        url = url.replace(regx, '')
        return `/api/${url}`
    },
    mobileApiUrl: function(url) {
        let regx = /^\/{1,}/g
        url = url.replace(regx, '')
        return `/m/api/${url}`
    },
    /**
     * [valueToMoment antd时间组件在传值需要moment]
     * @Author   szh
     * @DateTime 2017-12-06
     * @param    {null||Str||Arr}   value  [时间变成字符串后的值]
     * @param    {String}           format [时间格式，可选]
     * @return   {null||Str||Arr}          [根据value决定返回值类型]
     */
    valueToMoment: function(value, format = 'YYYY-MM-DD') {
        if (value === null || value === undefined) return value
        if (utils.isArray(value)) {
            let temp = []
            value.forEach(v => {
                // 在选择日期后，使用清除日期按钮删除选择时间后返回的值是['', '']
                // 转化成moment会导致日期组件出现NaN
                // 需要返回null
                if (v.length > 0) {
                    temp.push(moment(v, format))
                }
            })
            if (temp.length === 0) return null
            return temp
        } else {
            if (utils.isString(value)) {
                if (value.split(' ').length > 1) {
                    return moment(value, 'YYYY-MM-DD HH:mm:ss')
                } else {
                    return moment(value, 'YYYY-MM-DD')
                }
            } else {
                return moment(value, format)
            }
        }
    },
    /**
     * [momentToValue moment对象转为格式化字符串]
     * @Author   szh
     * @DateTime 2017-12-11
     * @param    {Obj||Arr}   moment [moment对象或者包含moment对象的数组]
     * @param    {String}     format [格式化]
     * @return   {Str||Arr}          [根据moment传入的类型返回]
     */
    momentToValue: function(moment, format = 'YYYY-MM-DD') {
        if (utils.isArray(moment)) {
            let temp = []
            moment.forEach(m => {
                temp.push(m.format(format))
            })
            return temp
        } else {
            return moment.format(format)
        }
    },
    /**
     * [resetObject 处理后台返回存在对象的表格数据]
     * @Author   szh
     * @DateTime 2017-12-11
     * @param    {Object}   objectToHandle [后台返回的存在关联模型查询数据]
     * @return   {Obejct}                  [把关联模型的数据整合到当前对象的数据]
     */
    resetObject: function(objectToHandle) {
        // 如果当前对象的属性中存在对象，则将属性中的对象的属性变为当前对象的属性
        let obj = {}
        for (let i in objectToHandle) {
            if (objectToHandle[i] === null || objectToHandle[i] === undefined) {
                obj[i] = objectToHandle[i]
                continue
            }
            if (utils.isObject(objectToHandle[i])) {
                obj = Object.assign({}, obj, utils.resetObject(objectToHandle[i]))
            } else {
                obj[i] = objectToHandle[i]
            }
        }
        return obj
    },
    /**
     * [formatDate 返回当前日期时间]
     * @Author   szh
     * @DateTime 2017-12-11
     * @param    {Boolean}  hasTime [是否显示时间，默认不显示]
     * @return   {String}           [格式化后的时间]
     */
    formatDate: function(hasTime = false) {
        let now = new Date()
        let dateStr = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`
        if (hasTime) {
            dateStr += ` ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`
        }
        return dateStr
    },
    /**
     * [getTime 返回时间戳]
     * @Author   szh
     * @DateTime 2018-01-09
     * @param    {String}   date [日期字符串]
     * @return   {Number}        [时间戳]
     */
    getTime: function(date = utils.formatDate()) {
        return new Date(date).getTime()
    },
    /**
     * [getBase64 获取图片的base64]
     * @Author   szh
     * @DateTime 2017-12-12
     * @param    {Object}   img      [file文件对象]
     * @param    {Function} callback [回调]
     */
    getBase64: function(img, callback) {
        const reader = new FileReader()
        reader.addEventListener('load', () => callback(reader.result))
        reader.readAsDataURL(img)
    },

    /**
     * [transformValue 表单值转换]
     * @Author   szh
     * @DateTime 2017-12-05
     * @param    {String}              field [表单字段]
     * @param    {str||num||bool}      value [当前值，可以是任何基本类型的值]
     * @return   {all}                       [返回所有类型的值]
     */
    transformValue: function(field, value) {
        if (value === null && field === 'font_size') return 'middle'
        if (value === null && field === 'skin') return 'default'
        if (value === null || value === undefined) return null
        let v
        if (field.indexOf('date') > -1) {
            // 日期组件的value必须使用moment
            v = utils.valueToMoment(value)
        } else if (field.indexOf('price') > -1) {
            if (utils.isArray(value)) {
                v = {number1: value[0], number2: value[1]}
            } else {
                v = parseFloat(value)
            }
        } else {
            v = value
        }
        return v
    },
    // 格式化后台返回的日期
    reFormatDate: function(date, format = 'YYYY-MM-DD HH:mm:ss') {
        if (date !== null) {
            return moment(date).format(format)
        } else {
            return null
        }
    },
    // 根据当前获取侧边栏的
    siderKeysUrl: function(str) {
        let arr = str.split('/')
        let openKeys = ''
        let selectedKeys = ''
        for (var i = 0; i < arr.length; i++) {
            if (i === 0 || i === 1 || i >= 4) {
                continue
            }
            if (i === 2) {
                openKeys = `/${arr[i]}`
            }
            selectedKeys += `/${arr[i]}`
        }
        return {openKeys: openKeys, selectedKeys: selectedKeys}
    },
    /**
     * [parseUrlSearch 结构化url地址中的search]
     * @Author   szh
     * @DateTime 2018-03-30
     * @param    {String}   search url地址中的search
     * @return   {Object}          地址search的对象结构
     */
    parseUrlSearch: function(search) {
        if (search.indexOf('=') > -1) {
            let searchArr = search.substr(1).split('&'),
                urlSearch = {}
            searchArr.forEach(sa => {
                let arr = sa.split('=')
                urlSearch[arr[0]] = arr[1]
            })
            return urlSearch
        } else {
            return {}
        }
    },
    /**
     * [stringifyUrlSearch 字符串化search对象]
     * @Author   szh
     * @DateTime 2018-03-30
     * @param    {Object}   urlSearch [search对象]
     * @return   {String}             [返回由?开头的search字符串]
     */
    stringifyUrlSearch: function(urlSearch) {
        let search = '?'
        Object.keys(urlSearch).forEach((s, idx) => {
            if (idx > 0) {
                search += `&${s}=${urlSearch[s]}`
            } else {
                search += `${s}=${urlSearch[s]}`
            }
        })
        return search
    }
}

module.exports = utils
