import { director, find } from "cc"
import { loadData } from "../message/LoadData"
import { releaseCache } from "../resource/LoadResource"
import { releaseDirCache } from "../resource/LoadDirResource"

// 防止重复点击/并发切换
let switching = false

/**
 * 场景切换（对齐 LegendOfWarcraftHeroes 的方案）：
 * 1. 弹出"加载中"遮罩（LoadData 转圈）
 * 2. 后台 preloadScene 预载目标场景资源
 * 3. 预载完成后关闭遮罩，再 loadScene 切换（资源已在缓存，切换无卡顿）
 *
 * @param sceneName 目标场景名
 * @param content   遮罩上的提示文案（可选）
 */
export async function goScene(sceneName: string, content?: string): Promise<void> {
    if (switching) return
    switching = true
    let close: Function = null
    try {
        close = await loadData(find("Canvas"), content)
        await new Promise<void>(res => {
            director.preloadScene(sceneName, null, () => res())
        })
    } finally {
        if (close) close()
        switching = false
    }
    director.loadScene(sceneName)
    // 切场景后清理低频资源缓存（只清 Map 引用，不释放引擎 asset，被清资源下次会重新加载）
    releaseCache()
    releaseDirCache()
}
