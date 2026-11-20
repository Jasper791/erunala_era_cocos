import {showString as showUpMessage} from "./message/ShowData"
import { loadResource, releaseCache } from "./resource/LoadResource"
import { loadDirResource, releaseDirCache } from "./resource/LoadDirResource"
import { confirmData } from "./message/ConfirmData"
import { loadData } from "./message/LoadData"
import { createNodeByPrefab } from "./resource/CreatNodeByPrefab"
import { goScene } from "./scene/SceneUtil"

export const util = {
    message: {
        showUpMessage ,
        confirmData ,
        loadData
    } ,
    resource: {
        loadResource ,
        loadDirResource ,
        createNodeByPrefab ,
        // 手动释放资源缓存（原 setInterval 定时清理已移除，改为显式调用）
        releaseCache() {
            releaseCache()
            releaseDirCache()
        } ,
    } ,
    scene: {
        go: goScene ,
    } ,

    // 标准化数据（查表：阈值降序 → 除数 + 后缀）
    normalData(data: number): string {
        for (const [threshold, divisor, suffix] of NORMAL_DATA_LEVELS) {
            if (data >= threshold) return (data / divisor).toFixed(2) + suffix
        }
        return parseInt(data + '') + ''
    }
}

// 数字缩写档位表
const NORMAL_DATA_LEVELS: [number, number, string][] = [
    [100000000 , 10000000 , 'E'] ,
    [10000000  , 1000000  , 'B'] ,
    [1000000   , 100000   , 'M'] ,
    [100000    , 10000    , 'W'] ,
    [10000     , 1000     , 'K'] ,
]
