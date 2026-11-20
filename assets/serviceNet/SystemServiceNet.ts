import { find } from "cc";
import { chainInfo } from "../resources/config-rerouce/chain-config";
import LogUtils from "../common/util/LogUtils";
import { showString as showUpMessage } from "../common/util/message/ShowData";
import { CmdDataModel, SystemCmd } from "./mgr/CmdData";
import HandleMgr from "./mgr/HandleMgr";
import ResponseHelper from "./mgr/ResponseHelper";
import ServiceNetBasic from "./ServiceNetBasic";

/** 合约配置 localStorage 缓存键（v2：带 timestamp/chainId） */
const CACHE_KEY = "contract_config_cache_v2";
/** 缓存有效期 24h */
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/** 服务端下发的单个合约配置（与 server_cocos SystemAction.queryContractConfigs 返回结构一致） */
export interface ContractEntry {
  address: string;
  chainId: number;
  contractName: string;
  abi: any;
}

/** 服务端下发的合约配置总包 */
export interface ContractConfigs {
  network: string;
  chainId: number;
  contracts: { [key: string]: ContractEntry };
}

interface ContractConfigCache extends ContractConfigs {
  timestamp: number;
}

export default class SystemServiceNet extends ServiceNetBasic {
  private static registered: boolean = false;

  /** 合约配置（network/chainId/contracts） */
  public static contractConfigs: ContractConfigs | null = null;

  public static registerHandlers(): void {
    if (SystemServiceNet.registered) return;
    SystemServiceNet.registered = true;
    HandleMgr.addHandler(CmdDataModel.SystemCmd, SystemCmd.QueryContractConfigs, (d: Uint8Array) => {
      const v = ResponseHelper.parse(d, "System.contractConfigs");
      if (v) {
        SystemServiceNet.contractConfigs = v;
        SystemServiceNet.saveCache(v);
        SystemServiceNet.validateChainId(v);
      }
    });
  }

  public static queryContractConfigs(): void {
    SystemServiceNet.registerHandlers();
    this.query(CmdDataModel.SystemCmd, SystemCmd.QueryContractConfigs, "查询合约配置");
  }

  /**
   * 登录成功后调用：缓存新鲜（<24h 且 chainId 与当前期望链一致）则直接使用，
   * 否则走 queryContractConfigs() 向服务端拉取最新配置。
   */
  public static initFromCacheOrQuery(): void {
    const cached = SystemServiceNet.loadCache();
    if (cached) {
      SystemServiceNet.contractConfigs = cached;
      LogUtils.log("[SystemServiceNet] 使用本地缓存的合约配置, network:", cached.network, "chainId:", cached.chainId);
      return;
    }
    SystemServiceNet.queryContractConfigs();
  }

  /** 合约配置是否已就绪 */
  public static isReady(): boolean {
    return !!SystemServiceNet.contractConfigs && !!SystemServiceNet.contractConfigs.contracts;
  }

  /** 按 contract_key 取合约配置项（address/abi 等），未就绪或无此 key 返回 null */
  public static getContract(key: string): ContractEntry | null {
    const configs = SystemServiceNet.contractConfigs;
    if (!configs || !configs.contracts) return null;
    return configs.contracts[key] || null;
  }

  /** 按 contract_key 取合约地址（如 "HeroService" / "ERA"），取不到返回 null */
  public static getContractAddress(key: string): string | null {
    const entry = SystemServiceNet.getContract(key);
    return entry ? entry.address : null;
  }

  /** 按 contract_key 取合约 ABI（服务端下发为 JSON 字符串时自动解析），取不到返回 null */
  public static getContractAbi(key: string): any | null {
    const entry = SystemServiceNet.getContract(key);
    if (!entry || entry.abi == null) return null;
    if (typeof entry.abi === "string") {
      try {
        return JSON.parse(entry.abi);
      } catch (e) {
        LogUtils.warn(`[SystemServiceNet] ABI 解析失败: ${key}`, e);
        return null;
      }
    }
    return entry.abi;
  }

  /** 写入 localStorage 缓存（附带时间戳） */
  private static saveCache(configs: ContractConfigs): void {
    try {
      const cache: ContractConfigCache = { ...configs, timestamp: Date.now() };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch (e) {
      LogUtils.warn("[SystemServiceNet] 合约配置缓存写入失败:", e);
    }
  }

  /** 读取 localStorage 缓存；过期或链不匹配返回 null */
  private static loadCache(): ContractConfigCache | null {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const cache = JSON.parse(raw) as ContractConfigCache;
      if (!cache || !cache.contracts || !cache.timestamp) return null;
      if (Date.now() - cache.timestamp > CACHE_TTL_MS) return null;
      if (chainInfo && cache.chainId !== chainInfo.id) return null;
      return cache;
    } catch (e) {
      LogUtils.warn("[SystemServiceNet] 合约配置缓存读取失败:", e);
      return null;
    }
  }

  /** 校验下发配置的 chainId 与当前期望链一致，不一致则提示切换网络 */
  private static validateChainId(configs: ContractConfigs): void {
    if (!chainInfo || !configs) return;
    if (Number(configs.chainId) !== Number(chainInfo.id)) {
      LogUtils.warn(`[SystemServiceNet] 合约配置链不匹配: 服务端=${configs.chainId}, 期望=${chainInfo.id}`);
      const canvas = find("Canvas");
      if (canvas) {
        showUpMessage(canvas, `当前钱包网络与游戏合约网络不一致，请切换到 ${chainInfo.chain.chainName}`);
      }
    }
  }
}
