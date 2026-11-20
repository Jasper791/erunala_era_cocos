import { CmdDataModel, TradeTypeCmd } from "./mgr/CmdData";
import HandleMgr from "./mgr/HandleMgr";
import ResponseHelper from "./mgr/ResponseHelper";
import ServiceNetBasic from "./ServiceNetBasic";

export default class TradeTypeServiceNet extends ServiceNetBasic {
  private static registered: boolean = false;

  /** 英雄交易方式配置 */
  public static heroTradeType: any = null;
  /** 精灵交易方式配置 */
  public static elvesTradeType: any = null;
  /** 装备交易方式配置 */
  public static armsTradeType: any = null;
  /** 道具交易方式配置 */
  public static propTradeType: any = null;

  public static registerHandlers(): void {
    if (TradeTypeServiceNet.registered) return;
    TradeTypeServiceNet.registered = true;
    HandleMgr.addHandler(CmdDataModel.TradeTypeCmd, TradeTypeCmd.QueryHeroTradeType, (d: Uint8Array) => {
      const v = ResponseHelper.parse(d, "TradeType.hero");
      if (v) TradeTypeServiceNet.heroTradeType = v;
    });
    HandleMgr.addHandler(CmdDataModel.TradeTypeCmd, TradeTypeCmd.QueryElvesTradeType, (d: Uint8Array) => {
      const v = ResponseHelper.parse(d, "TradeType.elves");
      if (v) TradeTypeServiceNet.elvesTradeType = v;
    });
    HandleMgr.addHandler(CmdDataModel.TradeTypeCmd, TradeTypeCmd.QueryArmsTradeType, (d: Uint8Array) => {
      const v = ResponseHelper.parse(d, "TradeType.arms");
      if (v) TradeTypeServiceNet.armsTradeType = v;
    });
    HandleMgr.addHandler(CmdDataModel.TradeTypeCmd, TradeTypeCmd.QueryPropTradeType, (d: Uint8Array) => {
      const v = ResponseHelper.parse(d, "TradeType.prop");
      if (v) TradeTypeServiceNet.propTradeType = v;
    });
  }

  public static queryHeroTradeType(): void {
    TradeTypeServiceNet.registerHandlers();
    this.query(CmdDataModel.TradeTypeCmd, TradeTypeCmd.QueryHeroTradeType, "英雄交易方式");
  }

  public static queryElvesTradeType(): void {
    TradeTypeServiceNet.registerHandlers();
    this.query(CmdDataModel.TradeTypeCmd, TradeTypeCmd.QueryElvesTradeType, "精灵交易方式");
  }

  public static queryArmsTradeType(): void {
    TradeTypeServiceNet.registerHandlers();
    this.query(CmdDataModel.TradeTypeCmd, TradeTypeCmd.QueryArmsTradeType, "装备交易方式");
  }

  public static queryPropTradeType(): void {
    TradeTypeServiceNet.registerHandlers();
    this.query(CmdDataModel.TradeTypeCmd, TradeTypeCmd.QueryPropTradeType, "道具交易方式");
  }
}
