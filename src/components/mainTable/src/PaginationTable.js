/*
 * @fileName: PaginationTable.js
 * @author: 李嘉鹏
 * @date: 2024-07-03 09:24:18
 * @version:
 * @description:分页接口(支持防抖，节流，轮询，loading，错误重试，自动请求/手动请求)
 */
import Pagination from './pagination.js'
import throttle from 'lodash/throttle'
import debounce from 'lodash/debounce'
import { cloneDeep } from 'lodash'
// interface options {
//   ready: Boolean; //(必填)只有当ready为true时，才会发起请求 (有些时候，可能会遇到网络请求相互依赖的情况。例如 B 请求的请求参数，依赖 A 请求的返回结果。这时可以使用 ready 来处理这种依赖关系)
//   manual:Boolean, //（必填）默认情况下，在组件挂载时，自动触发绑定的请求。你可以通过传入 manual 选项，来禁止挂载时的默认请求，然后通过 run()
//   hidePagination: Boolean, //是否有分页(默认有既然false)
//   params?: Object | ((oldParams: R, options: any) => any); //获取接口参数()
//   dataPath?: String; //接口返回数据路径(默认data)
//   pollingInterval?: Number //轮询间隔
//   debounceInterval?:Number; //防抖模式,延迟的毫秒数
//   throttleInterval?: Number; //节流时间间隔,默认开启,赋0就是关闭
//   errorRetryCount: Number; //错误重试次数
//   errorRetryInterval:Number; //错误重试间隔
//   loadingKeep:Number; //loading状态持续时间(如果请求时间少于指定的时间，则最终时间为指定的时间.如果请求时间大于指定的时间，则最终时间为请求的时间) 默认400
//   onSuccess?: (data: T, params: any) => void; //既onBefore
//   onBefore?: (params: any) => void;
//   onError?: (error: Error, params: any) => void;
//   onRes?: (res: R, params: any) => any; //接口返回后返回res时候立即回调 用于修改res的回调（需要return res）
//   mockRes?:()=>any; //mock接口返回数据,用于无接口时候的模拟,优先级大于api接口
// }

export class PaginationTable extends Pagination {
  constructor(api, options) {
    super(options.total || 0, options.pageSize || 20)
    this._replenishOptionsDefaultOptions(options)
    this.api = api
    this.params = {} //接口参数存储
    this.options = options
    //前端页面使用
    this.data = []
    this.loading = false
    this.polling = false //轮询状态
    if (this.options?.manual && this.options?.ready) this.run() //默认加载数据

    //轮询 （要手动销毁）
    this.pollingInterval = null
    if (this.options?.pollingInterval) this.startPolling(this.options.pollingInterval)

    // 防抖
    if (this.options?.debounceInterval) this.run = debounce(this.run.bind(this), this.options.debounceInterval)

    //节流
    if (this.options?.throttleInterval) this.run = throttle(this.run.bind(this), this.options.throttleInterval)

    // 错误重试(次数)
    if (typeof this.options.errorRetryCount == 'number' && this.options.errorRetryCount && this.options.errorRetryCount > 0) this.errorRetryCount = this.options.errorRetryCount
  }

  // 手动触发请求  extraParams对象
  async run(extraParams = {}) {
    if (!this.options || !this.options.ready) return // 只有ready为true时，才会发起请求
    this.loading = true
    const startTime = Date.now()
    try {
      await this._currentParams() // 生成当前接口的this.params
      if (this.options?.onBefore) await this.options.onBefore(this.params, this.options)
      // 接口参数（这是分页接口，参数一定是对象）
      let tempParams = { ...this.params }
      if (!this.options?.hidePagination) {
        const page = { pageIndex: this.pageIndex, pageSize: this.pageSize }
        tempParams = { ...tempParams, ...page }
      }
      tempParams = { ...tempParams, ...extraParams }
      console.log('接口参数', this.params, tempParams)
      let apiPage = this.options?.mockRes ? this.options.mockRes : this.api
      let res = await apiPage(tempParams)
      console.log('PaginationTable接口返回', res)
      if (res?.code !== 0) return console.error(res.msg || '接口异常')
      const dataKey = this.options?.dataPath || 'data'
      if (this.options?.onRes) res[dataKey] = this.options.onRes(cloneDeep(res), this.options) || res[dataKey]
      const data = res[dataKey]
      if (!data || !Array.isArray(data)) return console.error('分页数据非数组')
      this.data = data
      console.log('接口请求成功', this.data)
      if (!this.options?.hidePagination) this.total = Number(res?.count) || 0
      if (this.options?.onSuccess) this.options.onSuccess(this.data)
      if (this.options?.errorRetryCount) this._errorRetryReset() //放在最后
      return res
    } catch (error) {
      if (this.options?.errorRetryCount && this.options?.errorRetryCount > 0) {
        await this._errorRetry(error, this.params)
      } else {
        console.error(`接口请求异常==>${this.api}`, error)
        if (this.options?.onError) this.options.onError(error, this.params)
        this._resetData()
      }
    } finally {
      if (!this.options?.loadingKeep) {
        this.loading = false
      } else {
        const elapsedTime = Date.now() - startTime
        const remainingTime = this.options?.loadingKeep - elapsedTime
        if (remainingTime > 0) {
          setTimeout(() => {
            this.loading = false
          }, remainingTime)
        } else {
          this.loading = false
        }
      }
    }
  }

  //更新页面 pageIndex = 1
  refresh() {
    this.pageIndex = 1
    this.run()
  }

  //补充额外的默认参数
  _replenishOptionsDefaultOptions(options) {
    const optionsKeys = Object.keys(options)
    if (!optionsKeys.includes('manual')) options.manual = true
    if (!optionsKeys.includes('ready')) options.ready = true
    if (!optionsKeys.includes('throttleInterval')) options.throttleInterval = 1000
    if (!optionsKeys.includes('loadingKeep')) options.loadingKeep = 400
  }

  // 重置数据
  _resetData() {
    this.data = []
    this.total = 0
    this.pageIndex = 1
  }

  // 接口报错
  async _errorRetry(error, params) {
    if (this.errorRetryCount <= 0) {
      this._errorRetryReset()
      this._resetData()
      if (this.options?.onError) this.options.onError(error, this.params)
      return console.error('接口请求异常', error)
    } else {
      console.error(`错误重试剩余次数:${this.errorRetryCount}`)
      this.errorRetryCount--
      console.log('0000000次数', this.errorRetryCount)
      // 增加延迟  错误重试间隔
      if (this.options.errorRetryInterval) await new Promise(resolve => setTimeout(resolve, this.options.errorRetryInterval))
      return this.run(params)
    }
  }

  // 错误重试次数重置
  _errorRetryReset() {
    this.errorRetryCount = this.options.errorRetryCount
  }

  async _currentParams() {
    if (!this.options?.params) return this.params
    if (typeof this.options?.params == 'function') {
      this.params = await this.options.params(this.params, this.options)
    } else if (typeof this.options?.params == 'object') {
      this.params = this.options.params
    }
    return this.params
  }

  // 是否可以发起请求状态修改
  readyChange(bool) {
    //false ==> true时候默认执行一次。true ==> true不执行run （防止run被多次调用）
    if (!this.options.ready) {
      this.options.ready = bool
      if (bool) this.run()
    } else {
      this.options.ready = bool
    }
  }

  // 开始轮询函数，interval指定轮询间隔，单位毫秒(启用后记得销毁轮询)
  startPolling(interval = 5000) {
    if (this.polling) return // 避免重复启动轮询
    this.polling = true
    this.pollingInterval = setInterval(() => {
      this.run()
    }, interval)
  }

  // 停止轮询函数
  stopPolling() {
    this.polling = false
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
      this.pollingInterval = null
    }
  }
}
