import { LinkKit } from "../../common/3rd/LinkKit"

// 商店数据逻辑
export class Market {

    private _list = null
    public get list() {
        return this._list
    }

    async loaderList() {
        const res = await LinkKit.instance.Get('/', { test: 'xxx' })
        console.log('response==>', res)
        this._list = []
    }
}