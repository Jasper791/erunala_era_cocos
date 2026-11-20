import LogUtils from "../common/util/LogUtils";
import { getConfig, stockConfig } from "../common/Config";
import type { CharacterCreateData } from "../common/game/character/CharacterCreateData";
import { CmdDataModel, HeroCmd } from "./mgr/CmdData";
import HandleMgr from "./mgr/HandleMgr";
import ResponseHelper from "./mgr/ResponseHelper";
import { decodeResponseProto } from "./protocol/ResponseProto";
import ServiceNetBasic from "./ServiceNetBasic";

export default class HeroServiceNet extends ServiceNetBasic {

  private static registered: boolean = false

  /** 最近一次 queryHeroAllPage 分页结果 */
  public static heroAllPage: any = null
  /** 最近一次 queryHeroAction 结果 */
  public static heroAction: any = null
  /** 最近一次 queryHeroOne 结果 */
  public static heroOne: any = null
  /** 最近一次 queryHeroEqualData 结果 */
  public static heroEqualData: any = null
  /** 最近一次 queryHeroEqualDataPage 分页结果 */
  public static heroEqualDataPage: any = null
  /** 最近一次写操作（升级/融合/孵化/改名/经验/血量/激活/铸造/销毁）的响应 */
  public static lastWriteResult: any = null

  public static registerHandlers(): void {
    if (HeroServiceNet.registered) return
    HeroServiceNet.registered = true
    HandleMgr.addHandler(
      CmdDataModel.HeroCmd,
      HeroCmd.QueryHeroAll,
      (data: Uint8Array) => {
        try {
          const res = decodeResponseProto(data)
          LogUtils.log("HeroServiceNet.QueryHeroAll response:", res)
          if (!res.success) return
          const page = typeof res.data === "string" ? JSON.parse(res.data) : res.data
          HeroServiceNet.applyHeroPage(page)
        } catch (e) {
          LogUtils.error("HeroServiceNet.QueryHeroAll error:", e)
        }
      }
    )
    HandleMgr.addHandler(CmdDataModel.HeroCmd, HeroCmd.QueryHeroAllPage, (d: Uint8Array) => {
      const v = ResponseHelper.parse(d, "Hero.queryHeroAllPage")
      if (v) HeroServiceNet.heroAllPage = v
    })
    HandleMgr.addHandler(CmdDataModel.HeroCmd, HeroCmd.QueryHeroEqualDataPage, (d: Uint8Array) => {
      const v = ResponseHelper.parse(d, "Hero.queryHeroEqualDataPage")
      if (v) HeroServiceNet.heroEqualDataPage = v
    })
    HandleMgr.addHandler(CmdDataModel.HeroCmd, HeroCmd.QueryHeroAction, (d: Uint8Array) => {
      const v = ResponseHelper.parse(d, "Hero.queryHeroAction")
      if (v) HeroServiceNet.heroAction = v
    })
    HandleMgr.addHandler(CmdDataModel.HeroCmd, HeroCmd.QueryHeroOne, (d: Uint8Array) => {
      const v = ResponseHelper.parse(d, "Hero.queryHeroOne")
      if (v) HeroServiceNet.heroOne = v
    })
    HandleMgr.addHandler(CmdDataModel.HeroCmd, HeroCmd.QueryHeroEqualData, (d: Uint8Array) => {
      const v = ResponseHelper.parse(d, "Hero.queryHeroEqualData")
      if (v) HeroServiceNet.heroEqualData = v
    })
    // 写操作响应统一缓存到 lastWriteResult，UI 可按需读取 success/msg
    const writeSubCmds: Array<[number, string]> = [
      [HeroCmd.SetHeroAction, "setHeroAction"],
      [HeroCmd.SetHeroUpGrade, "setHeroUpGrade"],
      [HeroCmd.SetHeroMerge, "setHeroMerge"],
      [HeroCmd.SetHeroHatch, "setHeroHatch"],
      [HeroCmd.SetHeroNickName, "setHeroNickName"],
      [HeroCmd.SetHeroExp, "setHeroExp"],
      [HeroCmd.SetHeroHp, "setHeroHp"],
      // MintHero/BurnHero 已移除：铸造/销毁走钱包直签，不再请求服务端代发
    ]
    writeSubCmds.forEach(([subCmd, tag]) => {
      HandleMgr.addHandler(CmdDataModel.HeroCmd, subCmd, (d: Uint8Array) => {
        const v = ResponseHelper.parse(d, `Hero.${tag}`)
        HeroServiceNet.lastWriteResult = { subCmd, ...(v || {}) }
      })
    })
  }

  private static applyHeroPage(page: any): void {
    const config = getConfig()
    // 服务端 QueryHeroAll 直接返回英雄数组（非分页对象），需兼容两种形态
    const list = Array.isArray(page) ? page : (page?.heroProtoList || page?.list)
    // 响应结构异常时保留本地数据，避免一次坏包清空全部英雄
    if (!Array.isArray(list)) {
      LogUtils.warn("HeroServiceNet.applyHeroPage 响应不是英雄数组，忽略本次同步")
      return
    }
    config.userData.characters.length = 0
    config.userData.characterQueue.length = 0
    list.forEach((h) => {
      const serverId = String(h.heroId ?? h.id)
      // TODO(临时方案): 服务端英雄编号(100001+)与客户端资源编号(001-006)不一致，
      // 长期方案是服务端扫链(NFT)决定英雄类型后两端对齐；当前运行时映射：减 100000 后按 6 个英雄资源循环
      const n = Number(serverId)
      const id = isFinite(n) && n > 100000 ? String((n - 100001) % 6 + 1).padStart(3, "0") : serverId
      const cc: CharacterCreateData = {
        id,
        serverId,
        lv: h.lv ?? 1,
        star: h.star ?? 1,
        extra: {
          maxHp: h.hp ?? undefined,
          hp: h.hp ?? undefined,
          attack: h.ad ?? undefined,
          defence: h.addef ?? undefined,
        } as any,
      }
      config.userData.addNewCharacter(cc)
    })
    // 上阵编队：英雄站 3X3 阵型前排(row=1)，从左到右 clo=1..3，最多 3 个
    config.userData.characters.forEach((c, idx) => {
      if (idx >= 3) return
      config.userData.characterQueue.push({
        ...c, direction: "left", row: 1, clo: idx + 1,
      })
    })
    stockConfig()
  }

  public static queryHeroAll(): void {
    HeroServiceNet.registerHandlers()
    this.query(CmdDataModel.HeroCmd, HeroCmd.QueryHeroAll, "查询所有英雄")
  }

  public static queryHeroAllPage(pageNum: number, pageSize: number): void {
    HeroServiceNet.registerHandlers()
    this.query(CmdDataModel.HeroCmd, HeroCmd.QueryHeroAllPage, "分页查询所有英雄", { pageNum, pageSize })
  }

  public static queryHeroEqualDataPage(dataJson: string, pageNum: number, pageSize: number): void {
    HeroServiceNet.registerHandlers()
    this.query(CmdDataModel.HeroCmd, HeroCmd.QueryHeroEqualDataPage, "分页条件查询英雄", { data: dataJson, pageNum, pageSize })
  }

  public static queryHeroAction(heroId: string): void {
    HeroServiceNet.registerHandlers()
    this.query(CmdDataModel.HeroCmd, HeroCmd.QueryHeroAction, "查询英雄行为", { id: heroId })
  }

  public static queryHeroOne(heroId: string): void {
    HeroServiceNet.registerHandlers()
    this.query(CmdDataModel.HeroCmd, HeroCmd.QueryHeroOne, "查询单个英雄", { id: heroId })
  }

  public static queryHeroEqualData(dataJson: string): void {
    HeroServiceNet.registerHandlers()
    this.query(CmdDataModel.HeroCmd, HeroCmd.QueryHeroEqualData, "条件查询英雄", { data: dataJson })
  }

  /** 修改英雄激活状态 action */
  public static setHeroAction(heroId: string | number, action: number): void {
    HeroServiceNet.registerHandlers()
    this.query(CmdDataModel.HeroCmd, HeroCmd.SetHeroAction, "修改英雄激活状态",
      { data: JSON.stringify({ heroId, action }) })
  }

  /** 英雄升级（lv+1，hp/ad/addef 按 lv*100 增量） */
  public static setHeroUpGrade(heroId: string | number): void {
    HeroServiceNet.registerHandlers()
    this.query(CmdDataModel.HeroCmd, HeroCmd.SetHeroUpGrade, "英雄升级",
      { data: JSON.stringify({ heroId }) })
  }

  /** 英雄融合（副卡 exp+power 并入主卡，副卡软删） */
  public static setHeroMerge(mainHeroId: string | number, subHeroId: string | number): void {
    HeroServiceNet.registerHandlers()
    this.query(CmdDataModel.HeroCmd, HeroCmd.SetHeroMerge, "英雄融合",
      { data: JSON.stringify({ mainHeroId, subHeroId }) })
  }

  /** 英雄孵化（占位实现，实际繁殖走链上合约） */
  public static setHeroHatch(heroId1: string | number, heroId2: string | number): void {
    HeroServiceNet.registerHandlers()
    this.query(CmdDataModel.HeroCmd, HeroCmd.SetHeroHatch, "英雄孵化",
      { data: JSON.stringify({ heroId1, heroId2 }) })
  }

  /** 修改英雄昵称 */
  public static setHeroNickName(heroId: string | number, nickName: string): void {
    HeroServiceNet.registerHandlers()
    this.query(CmdDataModel.HeroCmd, HeroCmd.SetHeroNickName, "修改英雄昵称",
      { data: JSON.stringify({ heroId, nickName }) })
  }

  /** 修改英雄经验 */
  public static setHeroExp(heroId: string | number, exp: number): void {
    HeroServiceNet.registerHandlers()
    this.query(CmdDataModel.HeroCmd, HeroCmd.SetHeroExp, "修改英雄经验",
      { data: JSON.stringify({ heroId, exp }) })
  }

  /** 修改英雄血量（同步 tmpHp） */
  public static setHeroHp(heroId: string | number, hp: number): void {
    HeroServiceNet.registerHandlers()
    this.query(CmdDataModel.HeroCmd, HeroCmd.SetHeroHp, "修改英雄血量",
      { data: JSON.stringify({ heroId, hp }) })
  }

  // mintHero/burnHero 已移除：英雄铸造/销毁属上链业务，统一走 ChainBizManager.send 钱包直签
}