import { Market } from "./market/Index"


// 数据交互层
export class Service {
     private _market: Market = null
     get market () {
        return this._market
     }

     init() {
        this._market = new Market()
     }

     clean() {
        this._market = null
     }
}

export const ser = new Service()