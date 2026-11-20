import { sys, Asset, find } from "cc";
import LogUtils from "../util/LogUtils";
import AssetUtils from "../util/AssetUtils";
import { showString } from "../util/message/ShowData";
import { wsUrl, NET_CONST } from "../config/NetConfig";
import ISocket from "./ISocket";
import {
  decodeMyExternalMessage,
  encodeMyExternalMessage,
  MyExternalMessage,
} from "../../serviceNet/protocol/MyExternalMessage";
import HandleMgr from "../../serviceNet/mgr/HandleMgr";
import CmdMgr from "../../serviceNet/mgr/CmdMgr";

type ConnectResolver = () => void;
type ConnectRejecter = (err: any) => void;

const HEARTBEAT_INTERVAL = NET_CONST.heartbeatInterval;
const CONNECT_TIMEOUT = NET_CONST.connectTimeout;

export default class SocketClient implements ISocket {
  private static _ins: SocketClient = null;

  public static get ins(): SocketClient {
    return this._ins == null ? (this._ins = new SocketClient()) : this._ins;
  }

  public SocketState: number = WebSocket.CLOSED;
  public webSocket: WebSocket = null;
  public recvBuf: Uint8Array;

  private connectResolver: ConnectResolver = null;
  private connectRejecter: ConnectRejecter = null;
  private heartbeatTimer: any = null;
  private connectTimer: any = null;

  private buildHeartbeatPacket(): Uint8Array {
    return encodeMyExternalMessage({ cmdMerge: 0 });
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.SocketState !== WebSocket.OPEN) return;
      try {
        this.webSocket.send(this.buildHeartbeatPacket());
      } catch (e) {
        LogUtils.error("心跳发送失败", e);
      }
    }, HEARTBEAT_INTERVAL);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private clearConnectTimeout(): void {
    if (this.connectTimer) {
      clearTimeout(this.connectTimer);
      this.connectTimer = null;
    }
  }

  public async connect(ws: string = wsUrl): Promise<void> {
    if (this.SocketState === WebSocket.OPEN) {
      LogUtils.log("Socket 已连接，跳过 connect");
      return;
    }
    if (this.SocketState === WebSocket.CONNECTING) {
      LogUtils.log("Socket 正在连接中，等待 onopen");
      return new Promise<void>((resolve, reject) => {
        this.connectResolver = resolve;
        this.connectRejecter = reject;
      });
    }

    try {
      LogUtils.log("SocketClient.connect →", ws);
      if (sys.isNative) {
        let cacert: Asset = await AssetUtils.loadResSync("ssl/cacert", Asset);
        if (!cacert) {
          LogUtils.error("ssl/cacert 资源加载失败，无法建立原生平台 WebSocket 连接");
          return;
        }
        let pemUrl: string = cacert.nativeUrl;
        this.webSocket = new (WebSocket as any)(ws, null, pemUrl);
      } else {
        this.webSocket = new WebSocket(ws);
      }
      this.SocketState = WebSocket.CONNECTING;
      this.webSocket.binaryType = "arraybuffer";

      return new Promise<void>((resolve, reject) => {
        this.connectResolver = resolve;
        this.connectRejecter = reject;

        this.connectTimer = setTimeout(() => {
          LogUtils.error("SocketClient.connect 超时 (" + CONNECT_TIMEOUT + "ms)");
          this.SocketState = WebSocket.CLOSED;
          if (this.webSocket) {
            try { this.webSocket.close(); } catch (e) {}
            this.webSocket = null;
          }
          if (this.connectRejecter) {
            this.connectRejecter(new Error("WebSocket connect timeout"));
            this.connectResolver = null;
            this.connectRejecter = null;
          }
        }, CONNECT_TIMEOUT);

        this.webSocket.onopen = (ev) => {
          this.clearConnectTimeout();
          this.onopen(ev);
          if (this.connectResolver) {
            this.connectResolver();
            this.connectResolver = null;
            this.connectRejecter = null;
          }
        };
        this.webSocket.onerror = (ev) => {
          this.clearConnectTimeout();
          this.onerror(ev);
          this.SocketState = WebSocket.CLOSED;
          if (this.connectRejecter) {
            this.connectRejecter(new Error("WebSocket onerror"));
            this.connectResolver = null;
            this.connectRejecter = null;
          }
        };
        this.webSocket.onclose = (ev) => {
          this.clearConnectTimeout();
          this.onclose(ev);
          this.SocketState = WebSocket.CLOSED;
        };
        this.webSocket.onmessage = this.onmessage.bind(this);
      });
    } catch (err) {
      LogUtils.error("WebSocket connect error:", err);
      this.SocketState = WebSocket.CLOSED;
      this.clearConnectTimeout();
      if (this.connectRejecter) {
        this.connectRejecter(err);
        this.connectResolver = null;
        this.connectRejecter = null;
      }
    }
  }

  public onopen(event: Event): void {
    this.SocketState = WebSocket.OPEN;
    this.startHeartbeat();
    LogUtils.log("onopen ✓ 心跳启动", event);
  }

  /** 当前 socket 是否已连接 */
  public get isOpen(): boolean {
    return this.SocketState === WebSocket.OPEN
      && !!this.webSocket
      && this.webSocket.readyState === WebSocket.OPEN;
  }

  /** 发送消息，返回是否已成功交给 socket（未连接时返回 false，避免调用方一直等待响应） */
  public send(pbBuff: Uint8Array): boolean {
    if (!this.webSocket || this.webSocket.readyState !== WebSocket.OPEN) {
      LogUtils.error("网络未连接，消息发送失败 readyState=", this.webSocket?.readyState);
      return false;
    }
    if (!pbBuff) {
      LogUtils.error("没有数据");
      return false;
    }
    this.webSocket.send(pbBuff);
    return true;
  }

  public onmessage(event: MessageEvent): void {
    try {
      const recvData = new Uint8Array(<ArrayBuffer>event.data);
      const data: MyExternalMessage = decodeMyExternalMessage(recvData);
      // cmdMerge=0 为心跳回包，直接跳过，避免控制台每 15 秒刷一条日志
      if (!data || data.cmdMerge === 0) return;
      const cmd = CmdMgr.getCmd(data.cmdMerge);
      const subCmd = CmdMgr.getSubCmd(data.cmdMerge);
      LogUtils.log("[SocketClient.onmessage] cmdMerge=0x" + data.cmdMerge?.toString(16) + " cmd=" + cmd + " subCmd=" + subCmd + " responseStatus=" + data.responseStatus + " dataContent=" + (data.dataContent ? ("<Uint8Array len=" + data.dataContent.length + ">") : "undefined"));
      if (!data.dataContent && data.responseStatus !== undefined && data.responseStatus !== 0) {
        LogUtils.warn("[SocketClient] dataContent 为空！validMsg=" + data.validMsg);
      }
      HandleMgr.packageHandler(cmd, subCmd, data.dataContent || new Uint8Array(0));
    } catch (e) {
      // 单条坏包或单个业务处理器异常不能冒泡到全局，影响后续消息分发
      LogUtils.error("[SocketClient] 消息解码或分发失败", e);
    }
  }

  public close(): void {
    this.stopHeartbeat();
    if (this.webSocket) this.webSocket.close();
  }

  public onclose(event: CloseEvent): void {
    this.stopHeartbeat();
    this.SocketState = WebSocket.CLOSED;
    LogUtils.log("onclose 心跳停止", event);
    // 连接尚未建立就收到 onclose 时，必须结束 connect 的等待，否则调用方永久挂起
    if (this.connectRejecter) {
      this.connectRejecter(new Error(`WebSocket closed before connected, code=${event.code}`));
      this.connectResolver = null;
      this.connectRejecter = null;
    }
    this.showDisconnectTip();
  }

  public onerror(event: Event): void {
    LogUtils.log("onerror", event);
    this.SocketState = WebSocket.CLOSED;
  }

  private showDisconnectTip(): void {
    const canvas = find("Canvas");
    if (canvas) showString(canvas, "网络连接已断开", { r: 240, g: 60, b: 60 });
  }
}