import LogUtils from "../../common/util/LogUtils";
import { decodeResponseProto, ResponseProto } from "../protocol/ResponseProto";

/**
 * 通用服务端响应解析工具
 *
 * 服务端业务响应统一为 ResponseProto，其中 data 字段为 JSON 字符串。
 * 本工具封装「解码 → 成功校验 → JSON 解析」三步，供各 ServiceNet 复用，
 * 避免在每个 Handler 里重复写 try/catch + JSON.parse。
 */
export default class ResponseHelper {
  /**
   * 解析响应为 JSON 对象/数组
   * @param data 原始字节
   * @param tag  日志标签（出错时打印）
   * @returns 解析后的 JSON，失败返回 null
   */
  static parse(data: Uint8Array, tag: string): any | null {
    try {
      const res: ResponseProto = decodeResponseProto(data);
      if (!res.success) {
        LogUtils.warn(`[${tag}] 服务端返回失败:`, res.msg);
        return null;
      }
      return typeof res.data === "string" ? JSON.parse(res.data) : res.data;
    } catch (e) {
      LogUtils.error(`[${tag}] 响应解析失败:`, e);
      return null;
    }
  }

  /** 解析响应为数组（非数组返回 null） */
  static parseList(data: Uint8Array, tag: string): any[] | null {
    const parsed = ResponseHelper.parse(data, tag);
    return Array.isArray(parsed) ? parsed : null;
  }
}
