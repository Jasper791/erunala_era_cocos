import { CmdDataModel, MiningCmd } from "./mgr/CmdData";
import HandleMgr from "./mgr/HandleMgr";
import ResponseHelper from "./mgr/ResponseHelper";
import ServiceNetBasic from "./ServiceNetBasic";

export default class MiningServiceNet extends ServiceNetBasic {
  private static registered: boolean = false;

  /** 矿池配置列表 */
  public static miningAll: any = null;
  /** 我的质押记录 */
  public static staking: any = null;
  /** 我的挖矿产出 */
  public static provide: any = null;
  /** 奖励配置 */
  public static rewardConfig: any = null;

  public static registerHandlers(): void {
    if (MiningServiceNet.registered) return;
    MiningServiceNet.registered = true;
    HandleMgr.addHandler(CmdDataModel.MiningCmd, MiningCmd.QueryMiningAll, (d: Uint8Array) => {
      const v = ResponseHelper.parse(d, "Mining.all");
      if (v) MiningServiceNet.miningAll = v;
    });
    HandleMgr.addHandler(CmdDataModel.MiningCmd, MiningCmd.QueryMiningStaking, (d: Uint8Array) => {
      const v = ResponseHelper.parse(d, "Mining.staking");
      if (v) MiningServiceNet.staking = v;
    });
    HandleMgr.addHandler(CmdDataModel.MiningCmd, MiningCmd.QueryMiningProvide, (d: Uint8Array) => {
      const v = ResponseHelper.parse(d, "Mining.provide");
      if (v) MiningServiceNet.provide = v;
    });
    HandleMgr.addHandler(CmdDataModel.MiningCmd, MiningCmd.QueryMiningRewardConfig, (d: Uint8Array) => {
      const v = ResponseHelper.parse(d, "Mining.rewardConfig");
      if (v) MiningServiceNet.rewardConfig = v;
    });
  }

  public static queryMiningAll(): void {
    MiningServiceNet.registerHandlers();
    this.query(CmdDataModel.MiningCmd, MiningCmd.QueryMiningAll, "矿池配置列表");
  }

  public static queryMiningStaking(): void {
    MiningServiceNet.registerHandlers();
    this.query(CmdDataModel.MiningCmd, MiningCmd.QueryMiningStaking, "我的质押记录");
  }

  public static queryMiningProvide(): void {
    MiningServiceNet.registerHandlers();
    this.query(CmdDataModel.MiningCmd, MiningCmd.QueryMiningProvide, "我的挖矿产出");
  }

  public static queryMiningRewardConfig(): void {
    MiningServiceNet.registerHandlers();
    this.query(CmdDataModel.MiningCmd, MiningCmd.QueryMiningRewardConfig, "奖励配置");
  }
}
