import { CmdDataModel } from "./mgr/CmdData";
import CmdMgr from "./mgr/CmdMgr";
import SendMgr from "./mgr/SendMgr";
import { encodeRequestProto, RequestProto } from "./protocol/RequestProto";
import UserTokenManager from "./mgr/UserTokenManager";
import LogUtils from "../common/util/LogUtils";

/** query 可选附加参数（写入 RequestProto 对应字段） */
export interface QueryOptions {
  /** 业务主键 id：数字（或数字字符串）写入 proto id 字段，非数字 id 降级放入 Data */
  id?: string | number;
  /** 业务 JSON 数据字符串（写入 proto Data 字段） */
  data?: string;
  /** 分页页码 */
  pageNum?: number;
  /** 分页大小 */
  pageSize?: number;
}

export default class ServiceNetBasic {

  protected static send<T>(
    cmd: CmdDataModel,
    subCmd: number,
    data: T,
    encode: (d: T) => Uint8Array,
    tag: string
  ): boolean {
    LogUtils.log(tag, data);
    return SendMgr.send(CmdMgr.getMergeCmd(cmd, subCmd), encode(data));
  }

  protected static query(
    cmd: CmdDataModel,
    subCmd: number,
    tag: string,
    options?: QueryOptions
  ): boolean {
    const data: RequestProto = {
      Data: options?.data ?? "",
      token: UserTokenManager.token,
      address: UserTokenManager.address,
    };
    if (options) {
      if (options.id !== undefined && options.id !== null && `${options.id}` !== "") {
        const n = Number(options.id);
        if (isFinite(n)) {
          data.id = {
            low: n >>> 0,
            high: Math.floor(n / 4294967296) | 0,
            unsigned: false,
          };
        } else if (options.data === undefined) {
          // 非数字 id（如 uuid）无法写入 int64 id 字段，降级为 Data JSON
          data.Data = JSON.stringify({ id: options.id });
        }
      }
      if (options.pageNum !== undefined) data.pageNum = options.pageNum;
      if (options.pageSize !== undefined) data.pageSize = options.pageSize;
    }
    return ServiceNetBasic.send(cmd, subCmd, data, encodeRequestProto, tag);
  }
}