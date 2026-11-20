import { BattleCmd, CmdDataModel } from "./mgr/CmdData";
import HandleMgr from "./mgr/HandleMgr";
import ResponseHelper from "./mgr/ResponseHelper";
import ServiceNetBasic from "./ServiceNetBasic";

export default class BattleServiceNet extends ServiceNetBasic {
  private static registered: boolean = false;

  /** 战斗分组配置 */
  public static battleGroup: any = null;
  /** 我的英雄战斗记录 */
  public static heroBattles: any = null;
  /** 我的精灵战斗记录 */
  public static elvesBattles: any = null;
  /** 我的组队记录 */
  public static teamBattles: any = null;
  /** 英雄战斗日志 */
  public static heroLog: any = null;
  /** 精灵战斗日志 */
  public static elvesLog: any = null;
  /** 组队战斗日志 */
  public static teamLog: any = null;
  /** 战斗支付方式 */
  public static tradeType: any = null;

  public static registerHandlers(): void {
    if (BattleServiceNet.registered) return;
    BattleServiceNet.registered = true;
    const reg = (sub: BattleCmd, tag: string, set: (v: any) => void) =>
      HandleMgr.addHandler(CmdDataModel.BattleCmd, sub, (d: Uint8Array) => {
        const v = ResponseHelper.parse(d, tag);
        if (v) set(v);
      });
    reg(BattleCmd.QueryBattleGroup, "Battle.group", (v) => (BattleServiceNet.battleGroup = v));
    reg(BattleCmd.QueryBattleHeroAll, "Battle.heroAll", (v) => (BattleServiceNet.heroBattles = v));
    reg(BattleCmd.QueryBattleElvesAll, "Battle.elvesAll", (v) => (BattleServiceNet.elvesBattles = v));
    reg(BattleCmd.QueryBattleTeamAll, "Battle.teamAll", (v) => (BattleServiceNet.teamBattles = v));
    reg(BattleCmd.QueryBattleHeroLog, "Battle.heroLog", (v) => (BattleServiceNet.heroLog = v));
    reg(BattleCmd.QueryBattleElvesLog, "Battle.elvesLog", (v) => (BattleServiceNet.elvesLog = v));
    reg(BattleCmd.QueryBattleTeamLog, "Battle.teamLog", (v) => (BattleServiceNet.teamLog = v));
    reg(BattleCmd.QueryBattleTradeType, "Battle.tradeType", (v) => (BattleServiceNet.tradeType = v));
  }

  public static queryBattleGroup(): void {
    BattleServiceNet.registerHandlers();
    this.query(CmdDataModel.BattleCmd, BattleCmd.QueryBattleGroup, "查询战斗分组配置");
  }

  public static queryBattleHeroAll(): void {
    BattleServiceNet.registerHandlers();
    this.query(CmdDataModel.BattleCmd, BattleCmd.QueryBattleHeroAll, "我的英雄战斗记录");
  }

  public static queryBattleElvesAll(): void {
    BattleServiceNet.registerHandlers();
    this.query(CmdDataModel.BattleCmd, BattleCmd.QueryBattleElvesAll, "我的精灵战斗记录");
  }

  public static queryBattleTeamAll(): void {
    BattleServiceNet.registerHandlers();
    this.query(CmdDataModel.BattleCmd, BattleCmd.QueryBattleTeamAll, "我的组队记录");
  }

  public static queryBattleHeroLog(): void {
    BattleServiceNet.registerHandlers();
    this.query(CmdDataModel.BattleCmd, BattleCmd.QueryBattleHeroLog, "英雄战斗日志");
  }

  public static queryBattleElvesLog(): void {
    BattleServiceNet.registerHandlers();
    this.query(CmdDataModel.BattleCmd, BattleCmd.QueryBattleElvesLog, "精灵战斗日志");
  }

  public static queryBattleTeamLog(): void {
    BattleServiceNet.registerHandlers();
    this.query(CmdDataModel.BattleCmd, BattleCmd.QueryBattleTeamLog, "组队战斗日志");
  }

  public static queryBattleTradeType(): void {
    BattleServiceNet.registerHandlers();
    this.query(CmdDataModel.BattleCmd, BattleCmd.QueryBattleTradeType, "战斗支付方式");
  }
}
