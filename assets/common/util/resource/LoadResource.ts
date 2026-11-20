import { Asset, __private, resources } from "cc"

// 缓存
const cacheMap: Map<string , any> = new Map

// 使用频率
const useRate: Map<string , number> = new Map

// 显式释放低频缓存（替代原顶层 setInterval 定时清理：后台常驻定时器会持续占 CPU，
// 且会无差别清空缓存导致首屏资源被错误释放）。由上层在合适的时机手动调用。
export function releaseCache(): void {
    [...useRate.keys()].forEach(k => {
        if (useRate.get(k) < 10) {
            cacheMap.delete(k)
            useRate.delete(k)
        }
        useRate.set(k , 0)
    })
}

export async function loadResource<T>(path: string , type?: new (...a: any[]) => T , errorFunc?: any): Promise<T|null> {
    type = <any>(type || Asset)
    let r = cacheMap.get(path)
    useRate.set(path , (useRate.get(path) || 0) + 1)
    if (r) return r
    return new Promise(res => {
        resources.load(path as any , type as any , (err , r) => {
            if (err) {
                errorFunc && errorFunc(err)
                return res(null)
            }
            cacheMap.set(path , r)
            res(<any>r)
        })
    })
}
