import { CmdDataModel, MarketCmd } from "./mgr/CmdData";
import HandleMgr from "./mgr/HandleMgr";
import ResponseHelper from "./mgr/ResponseHelper";
import ServiceNetBasic from "./ServiceNetBasic";

export default class MarketServiceNet extends ServiceNetBasic {
  private static registered: boolean = false;

  /** 在售商品列表（最近一次 queryGoodsAll 结果） */
  public static goodsList: any[] = [];
  /** 单个商品（最近一次 queryGoodsOne 结果） */
  public static goodsOne: any = null;

  public static registerHandlers(): void {
    if (MarketServiceNet.registered) return;
    MarketServiceNet.registered = true;
    HandleMgr.addHandler(CmdDataModel.MarketCmd, MarketCmd.QueryGoodsAll, (data: Uint8Array) => {
      const list = ResponseHelper.parseList(data, "Market.queryGoodsAll");
      if (list) MarketServiceNet.goodsList = list;
    });
    HandleMgr.addHandler(CmdDataModel.MarketCmd, MarketCmd.QueryGoodsOne, (data: Uint8Array) => {
      const obj = ResponseHelper.parse(data, "Market.queryGoodsOne");
      if (obj) MarketServiceNet.goodsOne = obj;
    });
  }

  public static queryGoodsAll(): void {
    MarketServiceNet.registerHandlers();
    this.query(CmdDataModel.MarketCmd, MarketCmd.QueryGoodsAll, "查询在售商品列表");
  }

  public static queryGoodsOne(): void {
    MarketServiceNet.registerHandlers();
    this.query(CmdDataModel.MarketCmd, MarketCmd.QueryGoodsOne, "查询单个商品");
  }
}
