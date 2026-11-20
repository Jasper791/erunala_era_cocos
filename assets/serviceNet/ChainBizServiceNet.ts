import { CmdDataModel, ChainBizCmd } from "./mgr/CmdData";
import HandleMgr from "./mgr/HandleMgr";
import ResponseHelper from "./mgr/ResponseHelper";
import ServiceNetBasic from "./ServiceNetBasic";

export default class ChainBizServiceNet extends ServiceNetBasic {
  private static registered: boolean = false;

  /** 最近一次上链业务查询/推送结果（ResponseHelper 已解析为数组） */
  public static chainBizData: any[] = [];

  /** queryChainBizAsync 的等待回调；同一次响应可结束多个并发查询 */
  private static queryWaiters = new Set<(list: any[]) => void>();

  public static registerHandlers(): void {
    if (ChainBizServiceNet.registered) return;
    ChainBizServiceNet.registered = true;
    HandleMgr.addHandler(CmdDataModel.ChainBizCmd, ChainBizCmd.QueryChainBiz, (d: Uint8Array) => {
      const v = ResponseHelper.parseList(d, "ChainBiz.query");
      if (v) {
        ChainBizServiceNet.chainBizData = v;
        const waiters = Array.from(ChainBizServiceNet.queryWaiters);
        ChainBizServiceNet.queryWaiters.clear();
        waiters.forEach((w) => w(v));
      }
    });
    HandleMgr.addHandler(CmdDataModel.ChainBizCmd, ChainBizCmd.DeleteChainBiz, (d: Uint8Array) => {
      const v = ResponseHelper.parseList(d, "ChainBiz.delete");
      if (v) ChainBizServiceNet.chainBizData = v;
    });
    HandleMgr.addHandler(CmdDataModel.ChainBizCmd, ChainBizCmd.PushChainBiz, (d: Uint8Array) => {
      const v = ResponseHelper.parseList(d, "ChainBiz.push");
      if (v) ChainBizServiceNet.chainBizData = v;
    });
  }

  public static queryChainBiz(): void {
    ChainBizServiceNet.registerHandlers();
    this.query(CmdDataModel.ChainBizCmd, ChainBizCmd.QueryChainBiz, "查询上链业务");
  }

  /** 查询并等待响应返回列表（超时兜底返回当前缓存） */
  public static queryChainBizAsync(timeoutMs: number = 5000): Promise<any[]> {
    ChainBizServiceNet.registerHandlers();
    return new Promise((resolve) => {
      const finish = (list: any[]) => {
        clearTimeout(timer);
        ChainBizServiceNet.queryWaiters.delete(finish);
        resolve(list);
      };
      const timer = setTimeout(() => {
        finish(ChainBizServiceNet.chainBizData || []);
      }, timeoutMs);
      ChainBizServiceNet.queryWaiters.add(finish);
      const sent = this.query(CmdDataModel.ChainBizCmd, ChainBizCmd.QueryChainBiz, "查询上链业务");
      if (!sent) finish(ChainBizServiceNet.chainBizData || []);
    });
  }

  /** 删除中间状态记录（uuid 原样放入 RequestProto.Data，与服务端 getData() 对齐） */
  public static deleteChainBiz(uuid: string): void {
    ChainBizServiceNet.registerHandlers();
    this.query(CmdDataModel.ChainBizCmd, ChainBizCmd.DeleteChainBiz, "删除上链业务", { data: uuid });
  }

  public static pushChainBiz(): void {
    ChainBizServiceNet.registerHandlers();
    this.query(CmdDataModel.ChainBizCmd, ChainBizCmd.PushChainBiz, "推送提醒上链");
  }
}
