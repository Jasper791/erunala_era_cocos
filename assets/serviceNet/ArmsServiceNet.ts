import { ArmsCmd, CmdDataModel } from "./mgr/CmdData";
import HandleMgr from "./mgr/HandleMgr";
import ResponseHelper from "./mgr/ResponseHelper";
import ServiceNetBasic from "./ServiceNetBasic";
import { getConfig, stockConfig } from "../common/Config";
import { EquipmentEnum } from "../common/game/equipment/EquipmentEnum";

export default class ArmsServiceNet extends ServiceNetBasic {
  private static registered: boolean = false;

  /** 所有装备列表（最近一次 queryArmsAll 结果） */
  public static armsList: any[] = [];
  /** 最近一次 queryArmsAllPage 分页结果 */
  public static armsAllPage: any = null;
  /** 最近一次 queryArmsOne 结果 */
  public static armsOne: any = null;
  /** 最近一次 queryArmsEqualData 结果 */
  public static armsEqualData: any = null;
  /** 最近一次 queryArmsEqualDataPage 分页结果 */
  public static armsEqualDataPage: any = null;

  public static registerHandlers(): void {
    if (ArmsServiceNet.registered) return;
    ArmsServiceNet.registered = true;
    HandleMgr.addHandler(CmdDataModel.ArmsCmd, ArmsCmd.QueryArmsAll, (data: Uint8Array) => {
      const list = ResponseHelper.parseList(data, "Arms.queryArmsAll");
      if (list) {
        ArmsServiceNet.armsList = list;
        ArmsServiceNet.applyArmsList(list);
      }
    });
    HandleMgr.addHandler(CmdDataModel.ArmsCmd, ArmsCmd.QueryArmsAllPage, (d: Uint8Array) => {
      const v = ResponseHelper.parse(d, "Arms.queryArmsAllPage");
      if (v) ArmsServiceNet.armsAllPage = v;
    });
    HandleMgr.addHandler(CmdDataModel.ArmsCmd, ArmsCmd.QueryArmsEqualDataPage, (d: Uint8Array) => {
      const v = ResponseHelper.parse(d, "Arms.queryArmsEqualDataPage");
      if (v) ArmsServiceNet.armsEqualDataPage = v;
    });
    HandleMgr.addHandler(CmdDataModel.ArmsCmd, ArmsCmd.QueryArmsOne, (d: Uint8Array) => {
      const v = ResponseHelper.parse(d, "Arms.queryArmsOne");
      if (v) ArmsServiceNet.armsOne = v;
    });
    HandleMgr.addHandler(CmdDataModel.ArmsCmd, ArmsCmd.QueryArmsEqualData, (d: Uint8Array) => {
      const v = ResponseHelper.parse(d, "Arms.queryArmsEqualData");
      if (v) ArmsServiceNet.armsEqualData = v;
    });
  }

  /**
   * 把服务端装备列表写入 config.userData.equipments（BackpackEquipmentComponent 从 config 读取渲染）。
   * TODO(临时方案): 服务端装备编号(300001+)与客户端资源编号(equipment-resource/001-004)不一致，
   * 长期方案是服务端扫链(NFT)决定装备类型后两端对齐；当前运行时映射：减 300000 后按已注册装备类型数循环
   */
  private static applyArmsList(list: any[]): void {
    const config = getConfig();
    config.userData.equipments.length = 0;
    const typeCount = Object.keys(EquipmentEnum).length || 4;
    list.forEach((a) => {
      const serverId = String(a.armsId ?? a.id);
      const n = Number(serverId);
      const id = isFinite(n) && n > 300000 ? String((n - 300001) % typeCount + 1).padStart(3, "0") : serverId;
      config.userData.addNewEquipment(id, a.lv ?? 1, a.name);
    });
    stockConfig();
  }

  // 查询所有装备
  public static queryArmsAll(): void {
    ArmsServiceNet.registerHandlers();
    this.query(CmdDataModel.ArmsCmd, ArmsCmd.QueryArmsAll, "查询所有装备");
  }

  public static queryArmsAllPage(pageNum: number, pageSize: number): void {
    ArmsServiceNet.registerHandlers();
    this.query(CmdDataModel.ArmsCmd, ArmsCmd.QueryArmsAllPage, "分页查询所有装备", { pageNum, pageSize });
  }

  public static queryArmsEqualDataPage(dataJson: string, pageNum: number, pageSize: number): void {
    ArmsServiceNet.registerHandlers();
    this.query(CmdDataModel.ArmsCmd, ArmsCmd.QueryArmsEqualDataPage, "分页条件查询装备", { data: dataJson, pageNum, pageSize });
  }

  public static queryArmsOne(armsId: string): void {
    ArmsServiceNet.registerHandlers();
    this.query(CmdDataModel.ArmsCmd, ArmsCmd.QueryArmsOne, "查询单个装备", { id: armsId });
  }

  public static queryArmsEqualData(dataJson: string): void {
    ArmsServiceNet.registerHandlers();
    this.query(CmdDataModel.ArmsCmd, ArmsCmd.QueryArmsEqualData, "条件查询装备", { data: dataJson });
  }
}
