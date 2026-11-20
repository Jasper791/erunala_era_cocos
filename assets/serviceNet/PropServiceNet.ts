import LogUtils from "../common/util/LogUtils";
import { getConfig, stockConfig } from "../common/Config";
import { CmdDataModel, PropCmd } from "./mgr/CmdData";
import HandleMgr from "./mgr/HandleMgr";
import ResponseHelper from "./mgr/ResponseHelper";
import ServiceNetBasic from "./ServiceNetBasic";

export default class PropServiceNet extends ServiceNetBasic {
  private static registered: boolean = false;

  /** 所有道具列表（最近一次 queryPropAll 结果） */
  public static propList: any[] = [];
  /** 最近一次 queryPropAllPage 分页结果 */
  public static propAllPage: any = null;
  /** 最近一次 queryPropOne 结果 */
  public static propOne: any = null;
  /** 最近一次 queryPropEqualData 结果 */
  public static propEqualData: any = null;
  /** 最近一次 queryPropEqualDataPage 分页结果 */
  public static propEqualDataPage: any = null;

  public static registerHandlers(): void {
    if (PropServiceNet.registered) return;
    PropServiceNet.registered = true;
    HandleMgr.addHandler(CmdDataModel.PropCmd, PropCmd.QueryPropAll, (data: Uint8Array) => {
      const list = ResponseHelper.parseList(data, "Prop.queryPropAll");
      if (list) {
        PropServiceNet.propList = list;
        PropServiceNet.applyPropList(list);
      }
    });
    HandleMgr.addHandler(CmdDataModel.PropCmd, PropCmd.QueryPropAllPage, (d: Uint8Array) => {
      const v = ResponseHelper.parse(d, "Prop.queryPropAllPage");
      if (v) PropServiceNet.propAllPage = v;
    });
    HandleMgr.addHandler(CmdDataModel.PropCmd, PropCmd.QueryPropEqualDataPage, (d: Uint8Array) => {
      const v = ResponseHelper.parse(d, "Prop.queryPropEqualDataPage");
      if (v) PropServiceNet.propEqualDataPage = v;
    });
    HandleMgr.addHandler(CmdDataModel.PropCmd, PropCmd.QueryPropOne, (d: Uint8Array) => {
      const v = ResponseHelper.parse(d, "Prop.queryPropOne");
      if (v) PropServiceNet.propOne = v;
    });
    HandleMgr.addHandler(CmdDataModel.PropCmd, PropCmd.QueryPropEqualData, (d: Uint8Array) => {
      const v = ResponseHelper.parse(d, "Prop.queryPropEqualData");
      if (v) PropServiceNet.propEqualData = v;
    });
  }

  // 将服务端道具列表落到用户背包（propId 补足三位对应客户端道具 id，amount 即数量）
  private static applyPropList(list: any[]): void {
    const config = getConfig();
    config.userData.backpack.length = 0;
    list.forEach((p) => {
      const num = Number(p?.amount ?? 0);
      if (!isFinite(num) || num <= 0) return;
      config.userData.addNewItem(String(p.propId).padStart(3, "0"), num);
    });
    stockConfig();
  }

  // 查询所有道具
  public static queryPropAll(): void {
    PropServiceNet.registerHandlers();
    this.query(CmdDataModel.PropCmd, PropCmd.QueryPropAll, "查询所有道具");
  }

  public static queryPropAllPage(pageNum: number, pageSize: number): void {
    PropServiceNet.registerHandlers();
    this.query(CmdDataModel.PropCmd, PropCmd.QueryPropAllPage, "分页查询所有道具", { pageNum, pageSize });
  }

  public static queryPropEqualDataPage(dataJson: string, pageNum: number, pageSize: number): void {
    PropServiceNet.registerHandlers();
    this.query(CmdDataModel.PropCmd, PropCmd.QueryPropEqualDataPage, "分页条件查询道具", { data: dataJson, pageNum, pageSize });
  }

  public static queryPropOne(propId: string): void {
    PropServiceNet.registerHandlers();
    this.query(CmdDataModel.PropCmd, PropCmd.QueryPropOne, "查询单个道具", { id: propId });
  }

  public static queryPropEqualData(dataJson: string): void {
    PropServiceNet.registerHandlers();
    this.query(CmdDataModel.PropCmd, PropCmd.QueryPropEqualData, "条件查询道具", { data: dataJson });
  }
}
