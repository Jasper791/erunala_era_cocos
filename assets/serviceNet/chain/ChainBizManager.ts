import { EventTarget } from 'cc';
import { LinkKit } from '../../common/3rd/LinkKit';
import ChainBizServiceNet from '../ChainBizServiceNet';

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export enum ChainBizEventName {
  Sent = 'chainbiz-sent',
  Scanned = 'chainbiz-scanned',
  Failed = 'chainbiz-failed',
}

export interface ChainBizSendOptions {
  value?: string | number;
  gas?: number;
  gasPrice?: number;
  isNotLoading?: boolean;
  businessTag?: string;
  pollInterval?: number;
  scanTimeout?: number;
  pushOnStart?: boolean;
  autoPoll?: boolean;
}

export interface ChainBizSentResult {
  receipt: any;
  txHash: string;
}

export interface ChainBizScannedResult {
  receipt: any;
  txHash: string;
  chainBiz: any;
  success: boolean;
  contractKey: string;
  method: string;
  businessTag?: string;
}

export interface ChainBizError {
  stage: 'wallet' | 'onchain' | 'push' | 'scan' | 'unknown';
  message: string;
  receipt?: any;
  txHash?: string;
  chainBiz?: any;
}

export const ChainBizEventBus = new EventTarget();

type ContractConfig = { abi: any[]; address: string; name?: string; contract_source_name?: string };

function normalizeConfig(raw: any): ContractConfig | null {
  if (!raw) return null;
  const abi = raw.abi ?? raw.Abi ?? raw.abiList ?? null;
  const address = raw.address ?? raw.Address ?? null;
  if (!Array.isArray(abi) || !address) return null;
  return { abi, address, name: raw.name, contract_source_name: raw.contract_source_name };
}

function findChainBizRecord(data: any, txHash?: string, businessTag?: string): any | null {
  if (!data) return null;
  const list: any[] = Array.isArray(data)
    ? data
    : (data.list ?? data.chainBizList ?? data.records ?? data.data ?? []);
  if (!Array.isArray(list) || list.length === 0) return null;
  const h = txHash ? txHash.toLowerCase() : null;
  for (const item of list) {
    if (!item) continue;
    const itemHash = (item.txHash ?? item.hash ?? item.transactionHash ?? '').toLowerCase();
    if (h && itemHash === h) return item;
    if (businessTag && item.businessTag === businessTag) return item;
  }
  return null;
}

function isChainBizFinalized(record: any): boolean {
  if (!record) return false;
  const s = (record.status ?? record.State ?? '').toString().toLowerCase();
  return s === 'success' || s === 'done' || s === 'scanned' || s === 'failed' || s === 'error';
}

function isChainBizSuccess(record: any): boolean {
  if (!record) return false;
  const s = (record.status ?? record.State ?? '').toString().toLowerCase();
  return s === 'success' || s === 'done' || s === 'scanned';
}

export class ChainBizManager {
  private static _instance: ChainBizManager | null = null;
  static get instance() {
    if (!ChainBizManager._instance) ChainBizManager._instance = new ChainBizManager();
    return ChainBizManager._instance;
  }

  private _polling: Map<string, boolean> = new Map();

  private constructor() {}

  getContract(contractKey: string): ContractConfig | null {
    const raw = LinkKit.instance.configs?.[contractKey];
    return normalizeConfig(raw);
  }

  getMethodAbi(contractKey: string, method: string): any | null {
    const cfg = this.getContract(contractKey);
    if (!cfg) return null;
    return cfg.abi.find(
      (item: any) => item.type === 'function' && item.name === method
    ) || null;
  }

  /**
   * 调合约 send → 拿到 receipt → 立即返回（不阻塞等扫链）
   * 自动 pushChainBiz 提醒扫链，并后台轮询扫链状态，扫链完成后 emit Scanned / Failed 事件
   *
   * 调用方监听事件：
   *   ChainBizEventBus.on(ChainBizEventName.Scanned, (e: any) => { console.log(e.detail); })
   *
   * @returns { receipt, txHash }  链上确认后立即返回，扫链还在后台跑
   */
  async send(
    contractKey: string,
    method: string,
    args: any[],
    options: ChainBizSendOptions = {}
  ): Promise<ChainBizSentResult> {
    const {
      value = 0,
      gas = 3000000,
      gasPrice,
      isNotLoading = false,
      businessTag,
      pollInterval = 3000,
      scanTimeout = 120000,
      pushOnStart = true,
      autoPoll = true,
    } = options;

    const cfg = this.getContract(contractKey);
    if (!cfg) {
      throw { stage: 'unknown', message: `合约配置不存在: ${contractKey}` } as ChainBizError;
    }

    const sendData: any = { from: LinkKit.instance.address ?? undefined, value };
    if (gas) sendData.gas = gas;
    if (gasPrice) sendData.gasPrice = gasPrice;

    let receipt: any = null;
    let txHash: string = '';

    try {
      receipt = await this._sendAsync(cfg.abi, cfg.address, method, args, sendData, isNotLoading);
      txHash = receipt?.transactionHash ?? '';
      console.log(`[ChainBiz] ${contractKey}.${method} tx sent, hash=${txHash}`);
    } catch (err: any) {
      throw { stage: 'onchain', message: err?.message ?? '链上 send 失败', receipt, txHash } as ChainBizError;
    }

    if (!txHash) {
      throw { stage: 'onchain', message: 'receipt 中无 transactionHash', receipt } as ChainBizError;
    }

    const sentDetail: ChainBizSentResult = { receipt, txHash };
    ChainBizEventBus.emit(ChainBizEventName.Sent, new CustomEvent(ChainBizEventName.Sent, { detail: sentDetail }));

    if (pushOnStart) {
      try { ChainBizServiceNet.pushChainBiz(); } catch {}
    }

    if (autoPoll) {
      this._startBackgroundPoll(txHash, businessTag, contractKey, method, pollInterval, scanTimeout, receipt);
    }

    return sentDetail;
  }

  /**
   * 仅调链上合约 send，完全不管扫链、不 pushChainBiz、不启动后台轮询
   * fire-and-forget 场景用
   */
  async sendOnly(
    contractKey: string,
    method: string,
    args: any[],
    options: ChainBizSendOptions = {}
  ): Promise<ChainBizSentResult> {
    const cfg = this.getContract(contractKey);
    if (!cfg) throw { stage: 'unknown', message: `合约配置不存在: ${contractKey}` } as ChainBizError;

    const sendData: any = { from: LinkKit.instance.address ?? undefined, value: options.value ?? 0 };
    if (options.gas) sendData.gas = options.gas;
    if (options.gasPrice) sendData.gasPrice = options.gasPrice;

    const receipt = await this._sendAsync(cfg.abi, cfg.address, method, args, sendData, options.isNotLoading);
    const txHash = receipt?.transactionHash ?? '';
    return { receipt, txHash };
  }

  /**
   * 手动启动/重启后台扫链轮询
   * 用于 sendOnly 后想追扫链结果、或之前 send 过但事件丢了手动补启动
   */
  trackTx(
    txHash: string,
    businessTag?: string,
    pollInterval = 3000,
    scanTimeout = 120000,
    contractKey?: string,
    method?: string,
    receipt?: any
  ): void {
    try { ChainBizServiceNet.pushChainBiz(); } catch {}
    this._startBackgroundPoll(txHash, businessTag, contractKey ?? '', method ?? '', pollInterval, scanTimeout, receipt);
  }

  /**
   * 链上只读调用（封装 LinkKit.call 为 Promise）
   */
  async call(
    contractKey: string,
    method: string,
    args: any[] = [],
    isNotLoading = true
  ): Promise<any> {
    const cfg = this.getContract(contractKey);
    if (!cfg) throw new Error(`合约配置不存在: ${contractKey}`);
    return new Promise<any>((resolve, reject) => {
      LinkKit.instance.call(
        cfg.abi, cfg.address, method, args,
        (result: any) => resolve(result),
        null as any,
        isNotLoading
      ).then((ok) => {
        if (!ok) reject(new Error(`${contractKey}.${method} call 失败`));
      }).catch(reject);
    });
  }

  private _sendAsync(
    abi: any[],
    address: string,
    method: string,
    args: any[],
    sendData: any,
    isNotLoading: boolean
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      let settled = false;
      const cb = (receipt: any) => {
        if (settled) return;
        settled = true;
        resolve(receipt);
      };
      LinkKit.instance.send(abi, address, method, args, sendData, cb, null as any, isNotLoading)
        .then((ok) => {
          if (!ok && !settled) {
            settled = true;
            reject(new Error(`链上 send 返回 false (method=${method})`));
          }
        })
        .catch((err) => {
          if (!settled) {
            settled = true;
            reject(err);
          }
        });
    });
  }

  private _startBackgroundPoll(
    txHash: string,
    businessTag: string | undefined,
    contractKey: string,
    method: string,
    pollInterval: number,
    scanTimeout: number,
    receipt?: any
  ): void {
    if (this._polling.get(txHash)) {
      console.warn(`[ChainBiz] tx=${txHash} 已在扫链轮询中，跳过重复启动`);
      return;
    }
    this._polling.set(txHash, true);

    this._pollScanned(txHash, businessTag, pollInterval, scanTimeout)
      .then((record) => {
        this._polling.delete(txHash);
        const success = isChainBizSuccess(record);
        const detail: ChainBizScannedResult = {
          receipt: receipt ?? null,
          txHash,
          chainBiz: record,
          success,
          contractKey,
          method,
          businessTag,
        };
        const eventName = success ? ChainBizEventName.Scanned : ChainBizEventName.Failed;
        ChainBizEventBus.emit(eventName, new CustomEvent(eventName, { detail }));
      })
      .catch((err: any) => {
        this._polling.delete(txHash);
        console.warn(`[ChainBiz] 扫链轮询异常 tx=${txHash}:`, err?.message);
        const detail: ChainBizScannedResult = {
          receipt: receipt ?? null,
          txHash,
          chainBiz: null,
          success: false,
          contractKey,
          method,
          businessTag,
        };
        ChainBizEventBus.emit(ChainBizEventName.Failed, new CustomEvent(ChainBizEventName.Failed, { detail }));
      });
  }

  private async _pollScanned(
    txHash: string,
    businessTag: string | undefined,
    pollInterval: number,
    scanTimeout: number
  ): Promise<any> {
    const deadline = Date.now() + scanTimeout;
    let lastSnapshot: any = null;
    let unchangedCount = 0;

    while (Date.now() < deadline) {
      try {
        ChainBizServiceNet.queryChainBiz();
      } catch (err: any) {
        console.warn('[ChainBiz] queryChainBiz failed:', err?.message);
      }

      await sleep(Math.max(500, Math.min(pollInterval, 3000)));

      const snap = ChainBizServiceNet.chainBizData;
      if (snap !== lastSnapshot) {
        unchangedCount = 0;
        lastSnapshot = snap;
      } else {
        unchangedCount++;
      }

      const record = findChainBizRecord(snap, txHash, businessTag);
      if (record && isChainBizFinalized(record)) {
        return record;
      }

      if (unchangedCount >= 5) {
        try { ChainBizServiceNet.pushChainBiz(); } catch {}
        unchangedCount = 0;
      }

      await sleep(pollInterval);
    }

    const last = findChainBizRecord(lastSnapshot, txHash, businessTag);
    if (last) return last;
    throw new Error(`扫链超时 (${scanTimeout}ms)`);
  }
}

export default ChainBizManager;