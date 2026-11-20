import { _decorator, Component, director, find, Node } from 'cc';
import { util } from '../../common/util/Util';
import { LinkKit } from '../../common/3rd/LinkKit';
import SocketClient from '../../common/socket/SocketClient';
import { ser } from '../../serviceLogic/Index';
import LoginServiceNet from '../../serviceNet/LoginServiceNet';
import HeroServiceNet from '../../serviceNet/HeroServiceNet';
import ElvesServiceNet from '../../serviceNet/ElvesServiceNet';
import SystemServiceNet from '../../serviceNet/SystemServiceNet';
import PropServiceNet from '../../serviceNet/PropServiceNet';
import HandleMgr from '../../serviceNet/mgr/HandleMgr';
import LogUtils from '../../common/util/LogUtils';
import UserTokenManager from '../../serviceNet/mgr/UserTokenManager';
const { ccclass, property } = _decorator;

@ccclass('LoginUiComponent')
export class LoginUiComponent extends Component {
    private _ready: Promise<void> = null;
    private _inited: boolean = false;
    private _loggingIn: boolean = false;

    protected onLoad(): void {
        // 兜底捕获初始化异常，避免 _ready 变成 rejected 导致点击时永久卡住
        this._ready = this.initAsync().catch((err) => {
            LogUtils.error("初始化异常，仍允许手动登录:", err);
            this._inited = true;
        });
    }

    /**
     * 等待初始化完成，但设置上限。
     * 钱包插件异常时 LinkKit.init() 可能耗时很久，不能让点击永远无响应。
     */
    private _waitReady(timeoutMs: number): Promise<void> {
        return new Promise<void>((resolve) => {
            if (!this._ready) { resolve(); return; }
            let done = false;
            const finish = (msg?: string) => {
                if (done) return;
                done = true;
                clearTimeout(timer);
                if (msg) LogUtils.warn(msg);
                resolve();
            };
            const timer = setTimeout(() => finish(`等待初始化超时(${timeoutMs}ms)，继续尝试登录`), timeoutMs);
            this._ready.then(() => finish()).catch((err) => finish("初始化失败，继续尝试登录:" + err));
        });
    }

    private async initAsync(): Promise<void> {
        // 协议层与 handler 注册保持串行；socket 连接与钱包 provider 探测无数据依赖，
        // 并行执行避免耗时叠加（LinkKit.init 内部含 CDN 脚本加载与最长 8 秒的 provider 探测）
        try {
            ser.init();
        } catch (err) {
            console.warn("ser init failed:", err);
        }
        try {
            HandleMgr.init();
        } catch (err) {
            console.warn("HandleMgr init failed:", err);
        }
        try {
            HeroServiceNet.registerHandlers()
            ElvesServiceNet.registerHandlers()
        } catch (err) {
            console.warn("ServiceNet handler registration failed:", err);
        }
        await Promise.all([
            SocketClient.ins.connect().catch((err) => {
                console.warn("Socket connect failed:", err);
            }),
            LinkKit.instance.init().catch((err) => {
                console.warn("LinkKit init failed (wallet may not be available):", err);
            }),
        ]);
        this._inited = true;

        if (!SocketClient.ins.isOpen) {
            LogUtils.error("网络连接失败，跳过自动登录");
            util.message.showUpMessage(find("Canvas"), "网络连接失败，请检查网络后重试");
            return;
        }

        if (UserTokenManager.hasToken) {
            LogUtils.log("检测到本地 token，尝试自动登录...");
            const result = await LoginServiceNet.LoginWithToken();
            if (result.success) {
                LogUtils.log("自动登录成功", result);
                this.onLoginSuccess();
            } else if (result.networkError) {
                LogUtils.error("自动登录失败，网络未连接:", result.msg);
                util.message.showUpMessage(find("Canvas"), result.msg || "网络未连接，请稍后重试");
            } else {
                LogUtils.log("自动登录失败，等待用户重新连接钱包:", result.msg);
                // token 失效，停留在 login 场景，提示用户重新连接钱包签名
                util.message.showUpMessage(find("Canvas"), "登录已过期，请重新连接钱包");
            }
        }
    }

    private onLoginSuccess(): void {
        // 登录成功后先拉取合约配置（缓存新鲜则直接用缓存），后续合约交互依赖该配置
        SystemServiceNet.initFromCacheOrQuery();
        HeroServiceNet.queryHeroAll();
        ElvesServiceNet.queryElvesAll();
        PropServiceNet.queryPropAll();
        this.goPreloadForm();
    }

    async goPreloadForm() {
        await util.scene.go("Preload")
    }

    public async onLoginClick() {
        // 防止初始化未完成或重复点击时并发发起多次登录
        if (this._loggingIn) return;
        this._loggingIn = true;
        try {
            if (!this._inited) {
                util.message.showUpMessage(find("Canvas"), "正在连接网络与钱包，请稍候");
                // 最多等 20 秒，超时后继续尝试发起登录（拿不到地址时会返回明确提示）
                await this._waitReady(20000);
            }
            if (!SocketClient.ins.isOpen) {
                util.message.showUpMessage(find("Canvas"), "网络未连接，请稍后重试");
                return;
            }
            LogUtils.log("开始登录...");
            if (!UserTokenManager.hasToken) {
                // 需要唤起钱包授权，先给出可见反馈，避免玩家以为点击没反应
                util.message.showUpMessage(find("Canvas"), "正在唤起钱包，请在钱包插件中确认");
            }
            const result = await LoginServiceNet.Login();
            if (result.success) {
                LogUtils.log("登录成功", result);
                LinkKit.instance.token = result.token;
                LinkKit.instance.address = result.address;
                this.onLoginSuccess();
            } else {
                LogUtils.error("登录失败:", result.msg);
                util.message.showUpMessage(find("Canvas"), result.msg || "登录失败，请重试");
            }
        } finally {
            this._loggingIn = false;
        }
    }
}