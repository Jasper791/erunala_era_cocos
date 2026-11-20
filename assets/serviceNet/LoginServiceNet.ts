import { CmdDataModel, LoginCmd } from "./mgr/CmdData";
import { encodeLoginVerifyProto, LoginVerifyProto } from "./protocol/LoginVerifyProto";
import { decodeResponseProto, ResponseProto } from "./protocol/ResponseProto";
import ServiceNetBasic from "./ServiceNetBasic";
import HandleMgr from "./mgr/HandleMgr";
import LogUtils from "../common/util/LogUtils";
import UserTokenManager from "./mgr/UserTokenManager";
import { LinkKit } from "../common/3rd/LinkKit";

export type LoginResult = {
  success: boolean;
  token?: string;
  address?: string;
  needSignature?: boolean;
  message?: string;
  nonce?: string;
  msg?: string;
  /** 请求未发出（网络未连接），此时不应清除本地 token */
  networkError?: boolean;
};

type PendingLoginResolver = (result: LoginResult) => void;
let pendingLoginResolver: PendingLoginResolver = null;
let pendingRegisterResolver: PendingLoginResolver = null;
let pendingLogoutResolver: PendingLoginResolver = null;
let registered: boolean = false;

export default class LoginServiceNet extends ServiceNetBasic {

  private static registerHandlers(): void {
    if (registered) return;
    registered = true;
    HandleMgr.addHandler(CmdDataModel.LoginCmd, LoginCmd.LoginVerify, (data: Uint8Array) => {
      LoginServiceNet.handleLoginResponse(decodeResponseProto(data));
    });
    HandleMgr.addHandler(CmdDataModel.LoginCmd, LoginCmd.LoginVerifyProto, (data: Uint8Array) => {
      LoginServiceNet.handleLoginResponse(decodeResponseProto(data));
    });
    HandleMgr.addHandler(CmdDataModel.LoginCmd, LoginCmd.RegisterVerify, (data: Uint8Array) => {
      LoginServiceNet.handleRegisterResponse(decodeResponseProto(data));
    });
    HandleMgr.addHandler(CmdDataModel.LoginCmd, LoginCmd.Logout, (data: Uint8Array) => {
      LoginServiceNet.handleLogoutResponse(decodeResponseProto(data));
    });
  }

  private static handleRegisterResponse(res: ResponseProto): void {
    LogUtils.log("注册响应", res);
    if (!pendingRegisterResolver) return;
    if (res.success && res.code === 200) {
      pendingRegisterResolver({ success: true, msg: res.msg });
    } else {
      pendingRegisterResolver({ success: false, msg: res.msg || "注册失败" });
    }
    pendingRegisterResolver = null;
  }

  private static handleLogoutResponse(res: ResponseProto): void {
    LogUtils.log("退出响应", res);
    if (!pendingLogoutResolver) return;
    pendingLogoutResolver({ success: res.success && res.code === 200, msg: res.msg });
    pendingLogoutResolver = null;
  }

  private static handleLoginResponse(res: ResponseProto): void {
    LogUtils.log("登录响应", res);
    if (!pendingLoginResolver) return;

    if (res.success && res.code === 200) {
      let dataObj: any = {};
      if (res.data) {
        try { dataObj = typeof res.data === "string" ? JSON.parse(res.data) : res.data; } catch (e) {}
      }
      const token = dataObj.token || "";
      const address = dataObj.address || UserTokenManager.address;
      const account = dataObj.account || UserTokenManager.account;
      if (token && address) {
        UserTokenManager.save(token, address, account);
        LinkKit.instance.token = token;
        LinkKit.instance.address = address;
        pendingLoginResolver({ success: true, token, address, msg: res.msg });
      } else {
        pendingLoginResolver({ success: false, msg: "登录成功但未收到 token" });
      }
    } else if (res.code === 1001) {
      let challengeObj: any = {};
      if (res.data) {
        try { challengeObj = typeof res.data === "string" ? JSON.parse(res.data) : res.data; } catch (e) {}
      }
      pendingLoginResolver({
        success: false,
        needSignature: true,
        message: challengeObj.message || "",
        nonce: challengeObj.nonce || "",
        msg: res.msg,
      });
    } else {
      pendingLoginResolver({ success: false, msg: res.msg || "登录失败" });
    }
    pendingLoginResolver = null;
  }

  private static sendLogin(data: LoginVerifyProto): Promise<LoginResult> {
    return new Promise<LoginResult>((resolve) => {
      if (pendingLoginResolver) {
        resolve({ success: false, msg: "登录请求处理中，请稍后重试" });
        return;
      }
      pendingLoginResolver = resolve;
      const sent = super.send(
        CmdDataModel.LoginCmd,
        LoginCmd.LoginVerifyProto,
        data,
        encodeLoginVerifyProto,
        "登录"
      );
      // 未连接时消息不会发出，立即返回失败，避免登录 Promise 永久挂起
      if (!sent) {
        pendingLoginResolver = null;
        resolve({ success: false, networkError: true, msg: "网络未连接，登录请求发送失败，请稍后重试" });
      }
    });
  }

  static async LoginWithToken(): Promise<LoginResult> {
    LoginServiceNet.registerHandlers();
    if (!UserTokenManager.hasToken) {
      return { success: false, msg: "无本地 token" };
    }
    LogUtils.log("尝试用本地 token 自动登录 address=", UserTokenManager.address);
    const result = await LoginServiceNet.sendLogin({
      token: UserTokenManager.token,
      address: UserTokenManager.address,
    });
    if (!result.success) {
      // 网络问题导致请求未发出：保留本地 token，直接返回
      if (result.networkError) return result;
      // token 失效（过期/不匹配/服务端返回失败），清除本地缓存，
      // 避免后续流程继续使用失效 token
      LogUtils.warn("token 自动登录失败，清除本地 token:", result.msg);
      UserTokenManager.clear();
      LinkKit.instance.token = "";
      LinkKit.instance.address = "";
    }
    return result;
  }

  static async LoginWithSignature(): Promise<LoginResult> {
    LoginServiceNet.registerHandlers();

    // 必须先从钱包真实读取当前地址（会唤起钱包授权），
    // 不能复用本地缓存的 UserTokenManager.address，否则可能用过期地址去请求服务端
    const address = await LinkKit.instance.connectWallet();

    if (!address) {
      // 使用 LinkKit 记录的具体失败原因（未安装/插件失联/无响应），便于定位
      return { success: false, msg: LinkKit.instance.lastWalletError || "无法获取钱包地址，请确认 MetaMask 已连接并开启" };
    }

    let result = await LoginServiceNet.sendLogin({ address });

    if (result.success) return result;

    // 网络问题导致请求未发出：不要清除本地登录态
    if (result.networkError) return result;

    if (result.needSignature && result.message) {
      let signature: string = "";
      try {
        signature = await LinkKit.instance.personalSign(result.message, address);
      } catch (e) {
        return { success: false, msg: "钱包签名被拒绝或失败，请在 MetaMask 中签名后重试" };
      }

      if (!signature) {
        return { success: false, msg: "签名失败，请在 MetaMask 中确认签名请求" };
      }

      result = await LoginServiceNet.sendLogin({
        address,
        signature,
        nonce: result.nonce,
      });

      if (!result.success) {
        UserTokenManager.clear();
      }
      return result;
    }

    UserTokenManager.clear();
    return result;
  }

  static async Login(): Promise<LoginResult> {
    LoginServiceNet.registerHandlers();

    if (UserTokenManager.hasToken) {
      const tokenResult = await LoginServiceNet.LoginWithToken();
      if (tokenResult.success) return tokenResult;
      // 网络未连接时不再回退去唤起钱包
      if (tokenResult.networkError) return tokenResult;
      LogUtils.log("token 自动登录失败，回退到钱包签名:", tokenResult.msg);
    }

    return await LoginServiceNet.LoginWithSignature();
  }

  /**
   * 账号密码注册（服务端 RegisterVerify）
   * @param account 账号
   * @param password 密码
   * @param address 可选，绑定钱包地址（缺省服务端用 account 作为 address）
   */
  static async Register(account: string, password: string, address?: string): Promise<LoginResult> {
    LoginServiceNet.registerHandlers();
    if (!account || !password) {
      return { success: false, msg: "账号或密码不能为空" };
    }
    return new Promise<LoginResult>((resolve) => {
      if (pendingRegisterResolver) {
        resolve({ success: false, msg: "注册请求处理中，请稍后重试" });
        return;
      }
      pendingRegisterResolver = resolve;
      const sent = super.send(
        CmdDataModel.LoginCmd,
        LoginCmd.RegisterVerify,
        { account, password, address } as LoginVerifyProto,
        encodeLoginVerifyProto,
        "注册"
      );
      if (!sent) {
        pendingRegisterResolver = null;
        resolve({ success: false, networkError: true, msg: "网络未连接，注册请求发送失败" });
      }
    });
  }

  /**
   * 退出登录（服务端 Logout）
   * 清除服务端 Redis token + 本地 token 缓存 + LinkKit 状态。
   */
  static async Logout(): Promise<LoginResult> {
    LoginServiceNet.registerHandlers();
    const address = UserTokenManager.address;
    const result = await new Promise<LoginResult>((resolve) => {
      if (pendingLogoutResolver) {
        resolve({ success: false, msg: "退出请求处理中，请稍后重试" });
        return;
      }
      pendingLogoutResolver = resolve;
      const sent = super.send(
        CmdDataModel.LoginCmd,
        LoginCmd.Logout,
        { address, token: UserTokenManager.token } as LoginVerifyProto,
        encodeLoginVerifyProto,
        "退出登录"
      );
      if (!sent) {
        pendingLogoutResolver = null;
        resolve({ success: false, networkError: true, msg: "网络未连接，退出请求发送失败" });
      }
    });
    // 无论服务端是否成功，本地一律清除登录态
    UserTokenManager.clear();
    LinkKit.instance.token = "";
    LinkKit.instance.address = "";
    return result;
  }
}