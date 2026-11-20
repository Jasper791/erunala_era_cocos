import LogUtils from "../common/util/LogUtils";
import { getConfig, stockConfig } from "../common/Config";
import type { ElvesCreateData } from "../common/game/elves/ElvesCreateData";
import { CmdDataModel, ElvesCmd } from "./mgr/CmdData";
import HandleMgr from "./mgr/HandleMgr";
import ResponseHelper from "./mgr/ResponseHelper";
import { decodeResponseProto } from "./protocol/ResponseProto";
import ServiceNetBasic from "./ServiceNetBasic";

export default class ElvesServiceNet extends ServiceNetBasic {

  private static registered: boolean = false

  /** 最近一次 queryElvesAllPage 分页结果 */
  public static elvesAllPage: any = null
  /** 最近一次 queryElvesOne 结果 */
  public static elvesOne: any = null
  /** 最近一次 queryElvesEqualData 结果 */
  public static elvesEqualData: any = null
  /** 最近一次 queryElvesEqualDataPage 分页结果 */
  public static elvesEqualDataPage: any = null

  public static registerHandlers(): void {
    if (ElvesServiceNet.registered) return
    ElvesServiceNet.registered = true
    HandleMgr.addHandler(
      CmdDataModel.ElvesCmd,
      ElvesCmd.QueryElvesAll,
      (data: Uint8Array) => {
        try {
          const res = decodeResponseProto(data)
          LogUtils.log("ElvesServiceNet.QueryElvesAll response:", res)
          if (!res.success) return
          const page = typeof res.data === "string" ? JSON.parse(res.data) : res.data
          ElvesServiceNet.applyElvesPage(page)
        } catch (e) {
          LogUtils.error("ElvesServiceNet.QueryElvesAll error:", e)
        }
      }
    )
    HandleMgr.addHandler(CmdDataModel.ElvesCmd, ElvesCmd.QueryElvesAllPage, (d: Uint8Array) => {
      const v = ResponseHelper.parse(d, "Elves.queryElvesAllPage")
      if (v) ElvesServiceNet.elvesAllPage = v
    })
    HandleMgr.addHandler(CmdDataModel.ElvesCmd, ElvesCmd.QueryElvesEqualDataPage, (d: Uint8Array) => {
      const v = ResponseHelper.parse(d, "Elves.queryElvesEqualDataPage")
      if (v) ElvesServiceNet.elvesEqualDataPage = v
    })
    HandleMgr.addHandler(CmdDataModel.ElvesCmd, ElvesCmd.QueryElvesOne, (d: Uint8Array) => {
      const v = ResponseHelper.parse(d, "Elves.queryElvesOne")
      if (v) ElvesServiceNet.elvesOne = v
    })
    HandleMgr.addHandler(CmdDataModel.ElvesCmd, ElvesCmd.QueryElvesEqualData, (d: Uint8Array) => {
      const v = ResponseHelper.parse(d, "Elves.queryElvesEqualData")
      if (v) ElvesServiceNet.elvesEqualData = v
    })
  }

  private static applyElvesPage(page: any): void {
    const config = getConfig()
    // 服务端 QueryElvesAll 直接返回精灵数组（非分页对象），需兼容两种形态
    const list: any[] = Array.isArray(page) ? page : (page?.elvesProtoList || page?.list || [])
    config.userData.elves.length = 0
    config.userData.elvesQueue.length = 0
    list.forEach((e) => {
      const serverId = String(e.elvesId ?? e.id)
      // TODO(临时方案): 服务端精灵编号(200001+)与客户端资源编号(001-003)不一致，
      // 长期方案是服务端扫链(NFT)决定精灵类型后两端对齐；当前运行时映射：减 200000 后按 3 个精灵资源循环
      const n = Number(serverId)
      const id = isFinite(n) && n > 200000 ? String((n - 200001) % 3 + 1).padStart(3, "0") : serverId
      const ec: ElvesCreateData = {
        id,
        serverId,
        lv: e.lv ?? 1,
        star: e.star ?? 1,
        extra: {
          maxHp: e.hp ?? undefined,
          hp: e.hp ?? undefined,
          attack: e.ad ?? undefined,
          defence: e.addef ?? undefined,
        } as any,
      }
      config.userData.addNewElves(ec)
    })
    // 上阵编队：精灵站 3X3 阵型中后排(row=2/3)，从左到右 clo=1..3，最多 6 个
    const queueMax = Math.min(6, config.userData.elves.length)
    for (let i = 0; i < queueMax; i++) {
      const e = config.userData.elves[i]
      config.userData.elvesQueue.push({
        ...e, direction: "left",
        row: Math.floor(i / 3) + 2,
        clo: (i % 3) + 1,
      })
    }
    stockConfig()
  }

  public static queryElvesAll(): void {
    ElvesServiceNet.registerHandlers()
    this.query(CmdDataModel.ElvesCmd, ElvesCmd.QueryElvesAll, "查询所有精灵")
  }

  public static queryElvesAllPage(pageNum: number, pageSize: number): void {
    ElvesServiceNet.registerHandlers()
    this.query(CmdDataModel.ElvesCmd, ElvesCmd.QueryElvesAllPage, "分页查询所有精灵", { pageNum, pageSize })
  }

  public static queryElvesEqualDataPage(dataJson: string, pageNum: number, pageSize: number): void {
    ElvesServiceNet.registerHandlers()
    this.query(CmdDataModel.ElvesCmd, ElvesCmd.QueryElvesEqualDataPage, "分页条件查询精灵", { data: dataJson, pageNum, pageSize })
  }

  public static queryElvesOne(elvesId: string): void {
    ElvesServiceNet.registerHandlers()
    this.query(CmdDataModel.ElvesCmd, ElvesCmd.QueryElvesOne, "查询单个精灵", { id: elvesId })
  }

  public static queryElvesEqualData(dataJson: string): void {
    ElvesServiceNet.registerHandlers()
    this.query(CmdDataModel.ElvesCmd, ElvesCmd.QueryElvesEqualData, "条件查询精灵", { data: dataJson })
  }
}