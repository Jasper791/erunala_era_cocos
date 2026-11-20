import { sys } from "cc";
import { apiHost } from "../../common/config/NetConfig";
import UserTokenManager from "../mgr/UserTokenManager";

/**
 * 服务端 HTTP REST API 封装
 *
 * Base URL 取自 NetConfig.apiHost（按 dev/pre/prod 环境区分，已含 /api 前缀）。
 * 服务端响应统一为 ResponseVO: { code, success, message, data }。
 * 所有接口失败时 console.warn 并 resolve(null)（不 reject），UI 层需对 null 容错。
 */
export default class HttpApi {

  private static buildUrl(path: string, params?: Record<string, any>): string {
    let url = apiHost + path;
    if (params) {
      const qs = Object.keys(params)
        .filter((k) => params[k] !== undefined && params[k] !== null)
        .map((k) => encodeURIComponent(k) + "=" + encodeURIComponent(String(params[k])))
        .join("&");
      if (qs) url += "?" + qs;
    }
    return url;
  }

  private static get(path: string, params?: Record<string, any>): Promise<any> {
    const url = HttpApi.buildUrl(path, params);
    return new Promise<any>((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.timeout = sys.isNative ? 15000 : 10000;
      xhr.onreadystatechange = () => {
        if (xhr.readyState !== 4) return;
        try {
          if (xhr.status >= 200 && xhr.status <= 207) {
            const res = JSON.parse(xhr.responseText);
            if (res && (res.success === true || res.code === 200 || res.code === 1)) {
              resolve(res.data !== undefined ? res.data : res);
            } else {
              console.warn(`[HttpApi] ${path} 返回失败:`, res?.code, res?.message ?? res?.msg);
              resolve(null);
            }
          } else {
            console.warn(`[HttpApi] ${path} HTTP 状态异常:`, xhr.status);
            resolve(null);
          }
        } catch (e) {
          console.warn(`[HttpApi] ${path} 响应解析失败:`, e);
          resolve(null);
        }
      };
      xhr.ontimeout = () => {
        console.warn(`[HttpApi] ${path} 请求超时`);
        resolve(null);
      };
      xhr.onerror = () => {
        console.warn(`[HttpApi] ${path} 网络错误`);
        resolve(null);
      };
      xhr.open("GET", url, true);
      xhr.setRequestHeader("content-type", "application/json");
      const token = UserTokenManager.token;
      if (token) xhr.setRequestHeader("Token", token);
      xhr.send();
    });
  }

  /** 查询地址下的英雄列表 */
  static getHeroList(address: string): Promise<any> {
    return HttpApi.get("/hero/list", { address });
  }

  /** 查询单个英雄详情 */
  static getHeroOne(heroId: string, address: string): Promise<any> {
    return HttpApi.get(`/hero/${encodeURIComponent(heroId)}`, { address });
  }

  /** 查询地址下的英雄数量 */
  static getHeroCount(address: string): Promise<any> {
    return HttpApi.get("/hero/count", { address });
  }

  /** 英雄交易配置 */
  static getTradeConfigHero(): Promise<any> {
    return HttpApi.get("/trade/config/hero");
  }

  /** 精灵交易配置 */
  static getTradeConfigElves(): Promise<any> {
    return HttpApi.get("/trade/config/elves");
  }

  /** 装备交易配置 */
  static getTradeConfigArms(): Promise<any> {
    return HttpApi.get("/trade/config/arms");
  }

  /** 道具交易配置 */
  static getTradeConfigProp(): Promise<any> {
    return HttpApi.get("/trade/config/prop");
  }

  /** 盲盒记录列表（分页） */
  static getBlindBoxList(address: string, pageNum: number, pageSize: number): Promise<any> {
    return HttpApi.get("/blindbox/list", { address, pageNum, pageSize });
  }

  /** 单个盲盒记录详情 */
  static getBlindBoxOne(uuid: string, address: string): Promise<any> {
    return HttpApi.get(`/blindbox/${encodeURIComponent(uuid)}`, { address });
  }

  /** 系统合约配置（含链上地址与 ABI） */
  static getSystemContracts(network?: string, includeAbi?: boolean): Promise<any> {
    return HttpApi.get("/system/contracts", { network, includeAbi });
  }

  /** 系统合约配置健康检查 */
  static getSystemContractsHealth(network?: string): Promise<any> {
    return HttpApi.get("/system/contracts/health", { network });
  }

  /** 查询地址下的挖矿质押列表 */
  static getMiningStaking(address: string): Promise<any> {
    return HttpApi.get("/mining/staking", { address });
  }

  /** 查询钱包 nonce */
  static getWalletNonce(address: string): Promise<any> {
    return HttpApi.get("/wallet/nonce", { address });
  }
}
