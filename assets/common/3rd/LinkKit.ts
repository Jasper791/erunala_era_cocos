
import { _decorator, Component, log } from 'cc'
import { mode, chain_data } from '../../resources/config-rerouce/chain-config'
import { apiHost } from '../config/NetConfig'
import devContractConfig from '../../resources/config-rerouce/contract-config/contract_dev'
import preContractConfig from '../../resources/config-rerouce/contract-config/contract_pre'
const { ccclass, property } = _decorator;

declare var Web3

/** 钱包提供者类型（参考 cocos-mahjong 的 Web3WalletManager.detectProvider） */
export enum WalletProviderType {
    NONE = 'none',
    METAMASK = 'metamask',
    OKX = 'okx',
    TOKENPOCKET = 'tokenpocket',
    TRUST_WALLET = 'trust_wallet',
    COINBASE = 'coinbase',
    BINANCE = 'binance',
    MATH_WALLET = 'math_wallet',
    BITGET = 'bitget',
    UNKNOWN = 'unknown',
}


function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function waitForGlobal(name: string, timeoutMs: number = 10000): Promise<boolean> {
    const start = Date.now()
    while (Date.now() - start < timeoutMs) {
        if (typeof (window as any)[name] !== 'undefined') return true
        await sleep(200)
    }
    return typeof (window as any)[name] !== 'undefined'
}

/**
 * 给任意 Promise 加超时兜底。
 * 钱包插件（如 MetaMask 的后台 service worker）失联时，ethereum.request 返回的
 * Promise 可能永远不 resolve，导致整个初始化/登录流程卡死；这里统一加超时，
 * 超时后抛错，由调用方按失败处理。
 */
function withTimeout<T>(p: Promise<T>, timeoutMs: number, label: string): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        let done = false
        const timer = setTimeout(() => {
            if (done) return
            done = true
            reject(new Error(`[LinkKit] ${label} timeout after ${timeoutMs} ms`))
        }, timeoutMs)
        p.then((v) => {
            if (done) return
            done = true
            clearTimeout(timer)
            resolve(v)
        }).catch((e) => {
            if (done) return
            done = true
            clearTimeout(timer)
            reject(e)
        })
    })
}

/**
 * 选择注入的钱包 provider。
 * 同时安装多个钱包扩展时，window.ethereum 不一定是 MetaMask，
 * 真正的 MetaMask 可能在 window.ethereum.providers 数组里；
 * 选错 provider 会导致所有 RPC 超时（钱包没反应）。
 */
function pickEthereumProvider(): any {
    let eth = (window as any).ethereum
    // 部分钱包（如 OKX）只在 window.okxwallet 上注入
    if (!eth && (window as any).okxwallet) eth = (window as any).okxwallet
    if (!eth) return null
    let chosen = eth
    const list: any[] = eth.providers
    if (Array.isArray(list) && list.length > 1) {
        const mm = list.find((p) => p && p.isMetaMask)
        if (mm) chosen = mm
        console.log(
            "[LinkKit] multiple providers detected:",
            list.length,
            list.map((p) => (p && p.isMetaMask ? 'MetaMask' : 'Other')).join(',')
        )
    }
    let connected = 'n/a'
    try {
        connected = typeof chosen.isConnected === 'function' ? chosen.isConnected() : 'n/a'
    } catch (e) { }
    console.log("[LinkKit] selected provider isMetaMask:", !!(chosen && chosen.isMetaMask), "isConnected:", connected)
    return chosen
}

async function loadScript(src: string, timeoutMs: number = 15000): Promise<boolean> {
    return new Promise((resolve) => {
        if ((window as any).Web3) { resolve(true); return }
        const existing = document.querySelector(`script[src="${src}"]`)
        if (existing) { resolve(true); return }
        const script = document.createElement('script')
        script.src = src
        script.onload = () => resolve(true)
        script.onerror = () => resolve(false)
        script.async = true
        setTimeout(() => resolve(false), timeoutMs)
        document.head.appendChild(script)
    })
}

async function loadWeb3(): Promise<boolean> {
    if ((window as any).Web3) return true
    const cdnUrls = [
        'https://cdnjs.cloudflare.com/ajax/libs/web3/1.10.0/web3.min.js',
        'https://cdn.jsdelivr.net/npm/web3@1.10.0/dist/web3.min.js',
        'https://unpkg.com/web3@1.10.0/dist/web3.min.js',
    ]
    for (const url of cdnUrls) {
        console.log('[LinkKit] Trying to load web3 from:', url)
        const ok = await loadScript(url, 12000)
        if (ok && (window as any).Web3) {
            console.log('[LinkKit] web3 loaded successfully from:', url)
            return true
        }
    }
    console.error('[LinkKit] All CDN fallbacks failed to load web3.js!')
    return false
}

//返回BigNumber
export function toBN(num: number | string) {
    return LinkKit.instance.web3.utils.toBN(num)
}

//返回Wei
export function toWei(num: number | string) {
    return LinkKit.instance.web3.utils.toWei(num)
}

export class LinkKit {
    private static _instance: LinkKit = null

    static get instance() {
        if (!LinkKit._instance) {
            LinkKit._instance = new LinkKit()
        }
        return LinkKit._instance
    }

    get host(): string {
        return apiHost
    }

    private _token: string
    set token(value: string) {
        if (this._token != value) {
            this._token = value
        }
    }
    get token() {
        return this._token
    }

    private _tokenTime: number = 0
    set tokenTime(value: number) {
        if (this._tokenTime < value) {
            this._tokenTime = value
        }
    }
    get tokenTime() {
        return this._tokenTime
    }

    private _web3: any
    get web3() {
        return this._web3
    }

    private _address: string
    set address(v: string) { this._address = v }
    get address() {
        return this._address
    }

    private _web3Data: any
    get web3Data() {
        return this._web3Data
    }

    private _sig: string
    get sig() {
        return this._sig
    }

    private _configs: any
    get configs() {
        return this._configs
    }

    private _hasWalletProvider: boolean = false
    get hasWalletProvider() { return this._hasWalletProvider }

    private _provider: any
    get provider() { return this._provider || (window as any).ethereum }

    private _isWalletConnected: boolean = false
    private _providerType: WalletProviderType = WalletProviderType.NONE
    /** 当前钱包类型 */
    get providerType() { return this._providerType }

    private _lastWalletError: string = ""
    /** 最近一次获取钱包地址失败的原因，供上层展示 */
    get lastWalletError() { return this._lastWalletError }

    // coin 为18为精度
    private _precisionBvtStr: string = '1000000000000000000'
    get precisionBvtStr(): string {
        return this._precisionBvtStr
    }

    // USDT为6为精度
    private _precisionUsdtStr: string = '1000000'
    get precisionUsdtStr(): string {
        return this._precisionUsdtStr
    }

    divBN(nb: string | number, isUsdt?: boolean): number {
        let precisionStr: string = isUsdt
            ? this._precisionUsdtStr
            : this._precisionBvtStr
        return (
            toBN(nb).mul(toBN('1000')).div(toBN(precisionStr)).toNumber() / 1000
        )
    }

    mulBN(nb: string | number, isUsdt?: boolean): string {
        let precisionStr: string = isUsdt
            ? this._precisionUsdtStr
            : this._precisionBvtStr
        return toBN(nb).mul(toBN(precisionStr)).toString()
    }

    public async init() {
        const chainInfo = chain_data[mode]
        const rpcUrl = chainInfo.rpcUrl

        const loaded = await loadWeb3()
        if (!loaded) {
            console.error("[LinkKit] Web3 library failed to load from all CDNs!")
            return
        }

        await this._waitForEthereumProvider()

        try {
            const ethProvider = pickEthereumProvider()
            if (ethProvider) {
                console.log("[LinkKit] Using injected wallet provider")
                this._provider = ethProvider
                this._web3 = new (window as any).Web3(ethProvider)
                this._hasWalletProvider = true

                if (ethProvider.on) {
                    ethProvider.on('accountsChanged', (accs: string[]) => {
                        console.log("[LinkKit] accountsChanged:", accs)
                        // 账号变化时清除连接缓存，下次 connectWallet 会重新读取真实地址
                        this._address = accs && accs[0] ? accs[0] : null
                        this._isWalletConnected = !!(accs && accs.length > 0)
                    })
                    ethProvider.on('chainChanged', () => {
                        console.log("[LinkKit] chainChanged, rechecking...")
                        this.checChainnet()
                    })
                }
            } else if ((window as any).web3 && (window as any).web3.currentProvider) {
                console.log("[LinkKit] Using legacy web3.currentProvider")
                this._provider = (window as any).web3.currentProvider
                this._web3 = new (window as any).Web3(this._provider)
                this._hasWalletProvider = true
            } else {
                console.warn("[LinkKit] No wallet provider found! Falling back to HttpProvider (read-only)")
                this._web3 = new (window as any).Web3(
                    new (window as any).Web3.providers.HttpProvider(rpcUrl)
                )
                this._hasWalletProvider = false
            }
        } catch (err) {
            console.error("[LinkKit] Failed to create Web3 instance:", err)
            throw err
        }

        try {
            await this.checChainnet()
        } catch (err) {
            console.warn("[LinkKit] chain check failed (may be OK for HttpProvider):", err)
        }

        const contractConfig = {
            dev: devContractConfig,
            pre: preContractConfig
        }
        this._configs = contractConfig[mode] || {}

        console.log("[LinkKit] init done. hasWalletProvider:", this._hasWalletProvider, "rpc:", rpcUrl)
    }

    private async _waitForEthereumProvider(timeoutMs: number = 8000): Promise<void> {
        const start = Date.now()
        while (Date.now() - start < timeoutMs) {
            if (typeof (window as any).ethereum !== 'undefined') {
                if ((window as any).ethereum.isConnected && !(window as any).ethereum.isConnected()) {
                    await sleep(300); continue
                }
                console.log("[LinkKit] Found ethereum provider after", Date.now() - start, "ms")
                return
            }
            await sleep(300)
        }
        console.warn("[LinkKit] No ethereum provider detected within", timeoutMs, "ms")
    }

    async checChainnet(): Promise<boolean> {
        const chainInfo = chain_data[mode]
        // init 尚未创建 web3 实例时（如点击发生在钱包初始化过程中）直接跳过，
        // 避免阻塞登录主流程
        if (!this._web3) {
            console.warn("[LinkKit] checChainnet skipped: web3 not ready")
            return false
        }
        // 钱包扩展后台失联时 isConnected() 为 false，此时 RPC 必然超时，直接跳过
        const eth = this.provider
        if (eth && eth.isConnected && !eth.isConnected()) {
            console.warn("[LinkKit] checChainnet skipped: wallet reports disconnected")
            return false
        }
        try {
            const id = await withTimeout(this.web3.eth.getChainId(), 8000, "eth_chainId")
            console.log('[LinkKit] 当前链ID', id, '期望:', chainInfo.id)
            if (id !== chainInfo.id) {
                await this.useAiaMainnet()
                return false
            }
            return true
        } catch (err) {
            console.warn("[LinkKit] checChainnet error:", err)
            return false
        }
    }

    async useAiaMainnet(): Promise<void> {
        const eth = this.provider
        if (!eth) {
            console.warn("[LinkKit] Cannot switch chain: no ethereum provider")
            return
        }
        try {
            const chain = { ...chain_data[mode].chain }
            console.log("[LinkKit] Requesting wallet_addEthereumChain:", chain.chainName)
            await withTimeout(
                eth.request({
                    method: 'wallet_addEthereumChain',
                    params: [chain],
                }),
                20000,
                "wallet_addEthereumChain"
            )
            console.log("[LinkKit] wallet_addEthereumChain succeeded")
        } catch (err) {
            console.warn("[LinkKit] wallet_addEthereumChain may be rejected (user needs to add manually):", err)
        }
    }

    /** 按钱包注入的标记识别钱包类型 */
    detectProvider(): WalletProviderType {
        const eth = this.provider
        if (!eth) return WalletProviderType.NONE
        if (eth.isCoinbaseWallet || (window as any).isCoinbaseBrowser) return WalletProviderType.COINBASE
        if (eth.isBinance || typeof (window as any).BinanceChain !== 'undefined') return WalletProviderType.BINANCE
        if (eth.isOkxWallet || typeof (window as any).okxwallet !== 'undefined') return WalletProviderType.OKX
        if (eth.isTokenPocket) return WalletProviderType.TOKENPOCKET
        if (eth.isMathWallet) return WalletProviderType.MATH_WALLET
        if (eth.isBitKeep) return WalletProviderType.BITGET
        if (eth.isTrustWallet || eth.isTrust) return WalletProviderType.TRUST_WALLET
        if (eth.isMetaMask) return WalletProviderType.METAMASK
        return WalletProviderType.UNKNOWN
    }

    /** 是否有可用的钱包提供者 */
    isWalletAvailable(): boolean {
        return this.detectProvider() !== WalletProviderType.NONE
    }

    /** 读取当前活动账号（eth_accounts，不弹授权窗），用于校验缓存地址是否过期 */
    private async _getCurrentAccount(eth: any): Promise<string> {
        try {
            const accounts = await withTimeout<string[]>(eth.request({ method: 'eth_accounts' }), 10000, "eth_accounts")
            return Array.isArray(accounts) && accounts.length > 0 ? accounts[0] : ''
        } catch (err) {
            console.warn("[LinkKit] eth_accounts failed:", err)
            return ''
        }
    }

    /**
     * 连接钱包并返回地址（对齐 cocos-mahjong 的 connectWallet）
     * 1. 每次都真实向钱包读取账号，不复用可能过期的缓存
     * 2. 缓存地址先用 eth_accounts 校验，不一致则重新授权
     * 3. 4100 / -32603 / not connected 等错误退避重试
     */
    async connectWallet(): Promise<string | null> {
        const eth = this.provider
        if (!eth || typeof eth.request !== 'function') {
            this._lastWalletError = "未检测到钱包插件，请安装 MetaMask 后刷新页面"
            console.error("[LinkKit]", this._lastWalletError)
            return null
        }

        if (this._isWalletConnected && this._address) {
            const current = await this._getCurrentAccount(eth)
            if (current && current.toLowerCase() === this._address.toLowerCase()) {
                return this._address
            }
            console.warn("[LinkKit] 缓存地址与当前账号不一致，重新连接:", this._address, "->", current)
            this._isWalletConnected = false
            this._address = null
        }

        // MV3 钱包（MetaMask）后台 service worker 空闲约 30 秒即被浏览器挂起，
        // 此时 isConnected() 返回 false 属正常休眠态——任何 eth.request 都会唤醒后台。
        // 不能据此直接判死，否则页面打开稍久（worker 休眠后）就永远连不上钱包。
        // 这里用 6 秒超时的 eth_chainId 探测唤醒：醒来 → 继续正常流程；
        // 探测都失败 → 扩展真正坏掉（如重载后残留旧 content script），快速给出重载提示。
        if (eth.isConnected && !eth.isConnected()) {
            try {
                await withTimeout(eth.request({ method: 'eth_chainId' }), 6000, "eth_chainId wake-up")
                console.log("[LinkKit] wake-up probe OK, wallet background recovered")
            } catch (probeErr) {
                this._lastWalletError = "钱包扩展后台失联，请重新加载 MetaMask 扩展（浏览器扩展页刷新）或重启浏览器后刷新本页面重试"
                console.error("[LinkKit]", this._lastWalletError, probeErr)
                return null
            }
        }

        try {
            await this.checChainnet()
        } catch (err) {
            console.warn("[LinkKit] checChainnet error (non-fatal):", err)
        }

        try {
            // 整体最长等待 90 秒（用户需要在钱包里手动确认）
            const accounts: string[] = await withTimeout(
                this._requestAccountsWithRetry(eth, 3, 1000),
                90000,
                "connectWallet"
            )

            if (!accounts || accounts.length === 0) {
                this._lastWalletError = "钱包未返回账号，请在钱包中解锁并授权本页面"
                console.error("[LinkKit]", this._lastWalletError)
                return null
            }

            this._providerType = this.detectProvider()
            this._address = accounts[0]
            this._isWalletConnected = true
            this._lastWalletError = ""
            console.log("[LinkKit] 钱包连接成功 address:", this._address, "provider:", this._providerType)
            return this._address
        } catch (err: any) {
            const errMsg = err && err.message ? String(err.message) : ""
            // 扩展重载/升级后页面残留旧 content script，会持续报这个错且无法自愈
            if (errMsg.includes("Could not establish connection") || errMsg.includes("Receiving end does not exist")) {
                this._lastWalletError = "钱包扩展后台失联，请重新加载 MetaMask 扩展或重启浏览器后刷新本页面重试"
            } else {
                this._lastWalletError = err && err.message
                    ? `钱包连接失败：${err.message}`
                    : "钱包无响应，请检查钱包插件是否被禁用/失联后重试"
            }
            console.error("[LinkKit]", this._lastWalletError, err)
            return null
        }
    }

    /** 带退避重试的 eth_requestAccounts（对应 mahjong 的 _retryWithBackoff） */
    private async _requestAccountsWithRetry(eth: any, maxRetries: number, baseDelay: number): Promise<string[]> {
        let lastError: any = null
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`[LinkKit] Requesting eth_requestAccounts ... (第 ${attempt}/${maxRetries} 次)`)
                const accounts = await withTimeout<string[]>(
                    eth.request({ method: 'eth_requestAccounts' }),
                    45000,
                    "eth_requestAccounts"
                )
                if (!Array.isArray(accounts) || accounts.length === 0) {
                    throw new Error("未获取到账户列表")
                }
                return accounts
            } catch (err: any) {
                lastError = err
                const code = err && (err.code || (err.data && err.data.code))
                const msg = (err && err.message) ? String(err.message) : ""
                const retryable = code === 4100 || code === -32603 ||
                    msg.includes("No active wallet") || msg.includes("wallet not found") ||
                    msg.includes("not connected") ||
                    // MV3 后台刚被唤醒的瞬间首包可能报这类错，重试即可恢复
                    msg.includes("Could not establish connection") ||
                    msg.includes("Receiving end does not exist")
                console.warn("[LinkKit] eth_requestAccounts 失败:", code || "N/A", msg)
                // 用户主动拒绝（4001）或已有未完成弹窗（-32002）不重试
                if (!retryable || attempt >= maxRetries) {
                    throw err
                }
                await sleep(baseDelay * attempt)
            }
        }
        throw lastError || new Error("钱包请求失败")
    }

    /** 获取钱包地址（内部改用 connectWallet，保证每次都是钱包里的真实地址） */
    async getWalletAddress(): Promise<string | null> {
        return this.connectWallet()
    }

    async getAddress(msg: string): Promise<any> {
        const address = await this.getWalletAddress()
        if (!address) {
            return null
        }

        const signature = await this.personalSign(msg, address)
        if (!signature) {
            console.error("[LinkKit] personalSign failed, address was:", address)
            return null
        }

        this._sig = `${signature}`
        this._web3Data = {
            address: address,
            sig: signature,
        }
        console.log("[LinkKit] getAddress + sign SUCCESS")
        return this._web3Data
    }

    async personalSign(msg: string, address: string): Promise<string | null> {
        const eth = this.provider
        if (!eth || typeof eth.request !== 'function') {
            console.error("[LinkKit] Cannot sign without wallet provider!")
            return null
        }

        try {
            // 等待用户在钱包中确认签名，超时时间放宽；避免钱包插件失联时永久挂起
            const signature = await withTimeout<string>(
                eth.request({
                    method: 'personal_sign',
                    params: [msg, address],
                }),
                120000,
                "personal_sign"
            )
            return typeof signature === 'string' && signature.length > 0 ? signature : null
        } catch (err) {
            console.error("[LinkKit] personalSign failed:", err)
            return null
        }
    }

    private sign(msg: string, address: string) {
        return new Promise(async (resolve) => {
            try {
                let signature = await this.web3.eth.personal.sign(msg, address, "")
                resolve(signature)
            } catch (error) {
                console.log('sign error:', error)
                resolve(null)
                // //链上拒绝交易
                // UIRoot.instance.onLoadingFinish(true)
                // UIRoot.instance.alertLinkCancel()
                return
            }
        })
    }

    private async changeAddress(): Promise<boolean> {
        try {
            const data = await this.web3.eth.getAccounts()
            const address = data && data[0] ? data[0].toLowerCase() : null
            return !!address && address === this.web3Data?.address?.toLowerCase()
        } catch (error) {
            console.warn('[LinkKit] getAccounts failed:', error)
            return false
        }
    }

    /**
   * 获取合约地址
   * @param abi
   * @param address
   */
    async contract(abi: any[], address: string) {
        const contract = new this.web3.eth.Contract(abi, address)
        const addressValid = await this.changeAddress()
        if (!addressValid) {
            throw new Error('钱包账户未授权、已切换或尚未完成签名')
        }
        return contract
    }

    /**
     * 链上数据 call
     * @param abi abi
     * @param address address
     * @param method 方法名称
     * @param arg 方法参数
     * @param callBack 回调函数
     * @param callbackTarget 回调作用域
     * @param isNotLoading 是否不显示loading
     * @returns 是否成功
     */
    call(
        abi: any[],
        address: string,
        method: string,
        arg: any[],
        callBack: Function,
        callbackTarget: EventTarget,
        isNotLoading?: boolean
    ): Promise<boolean> {
        if (!isNotLoading) {
            // UIRoot.instance.onLoadingStart(this)
        }
        return new Promise(async resolve => {
            try {
                const contract = await this.contract(abi, address)
                console.log('method', method)
                if (!contract.methods[method]) {
                    console.warn(`call undefined method: ${method}`)
                    if (!isNotLoading) {
                        // UIRoot.instance.onLoadingFinish(this)
                    }
                    resolve(false)
                    return
                }
                contract.methods[method](...arg).call((err, result) => {
                    if (err) {
                        resolve(false)
                        console.warn(`call method failed : ${method}`)
                        if (!isNotLoading) {
                            // UIRoot.instance.onLoadingFinish(this)
                        }
                        return
                    }

                    if (callBack) {
                        callBack.call(callbackTarget, result)
                    }
                    if (!isNotLoading) {
                        // UIRoot.instance.onLoadingFinish(this)
                    }
                    resolve(true)
                })
            } catch (error) {
                console.log('contract error:', error)
                resolve(false)
            }

        })
    }

    /**
    * 链上数据 send
    * @param abi abi
    * @param address address
    * @param method 方法名
    * @param arg 方法参数
    * @param sendData data数据
    * @param callBack 回调
    * @param callbackTarget 回调作用域
    * @param isNotLoading 是否不显示loading
    * @returns 是否成功
    */
    send(
        abi: any[],
        address: string,
        method: string,
        arg: any[],
        sendData: any,
        callBack: Function,
        callbackTarget: EventTarget,
        isNotLoading?: boolean
    ): Promise<boolean> {
        if (!isNotLoading) {
            // UIRoot.instance.onLoadingStart(this)
        }

        // let cb = callBack
        // let cbTarget = callbackTarget
        // let res = null

        try {
            return new Promise(async resolve => {
                try {
                    // 检测是否为polygon链
                    let isPolygonMainnet: boolean = await this.checChainnet()
                    if (!isPolygonMainnet) {
                        if (!isNotLoading) {
                            // UIRoot.instance.onLoadingFinish(this)
                        }
                        resolve(false)
                        return
                    }

                    const price = await this.web3.eth.getGasPrice()
                    // cc.log('price', price)
                    let newPrice =
                        Number(LinkKit.instance.web3.utils.toWei('20', 'gwei')) +
                        Number(price)
                    // cc.log('newPrice', newPrice)
                    // this.web3.eth.gasPrice = newPrice

                    const contract = await this.contract(abi, address)
                    if (!contract.methods[method]) {
                        console.warn(`send undefined method: ${method}`)
                        if (!isNotLoading) {
                            // UIRoot.instance.onLoadingFinish(this)
                        }
                        resolve(false)
                        return
                    }
                    console.log(method + ' running...')
                    contract.methods[method](...arg)
                        // .send(sendData)
                        .send({
                            from: LinkKit.instance.address,
                            gasPrice: newPrice,
                            gasLimit: 3000000,
                            ...sendData
                        })
                        .once('receipt', result => {
                            console.log('send complete, method: ', method)
                            if (callBack) {
                                callBack.call(callbackTarget, result)
                            }
                            if (!isNotLoading) {
                                // UIRoot.instance.onLoadingFinish(this)
                            }
                            resolve(true)
                        })
                        .on('confirmation', (no, b) => {
                            // 交易成功以 receipt 为准，避免重复 resolve
                        })
                        .on('error', result => {
                            console.warn(
                                `send fail, method: ${method}, receipt: ${result}`
                            )
                            if (!isNotLoading) {
                                // UIRoot.instance.onLoadingFinish(this)
                            }
                            //链上拒绝交易
                            // UIRoot.instance.alertLinkCancel()
                            resolve(false)
                        })
                } catch (error) {
                    console.warn(`send error: ${error}`)
                    resolve(false)
                }
            })
        } catch (error) {
            console.warn(`tryCatch error: ${error}`)
            if (!isNotLoading) {
                // UIRoot.instance.onLoadingFinish(this)
            }
            // 取消操作
            // UIRoot.instance.alertLinkCancel()
            return Promise.resolve(false)
        }
    }

    private buildUrl(handler, obj?: any): string {
        var params = []
        for (var p in obj) {
            params.push(
                encodeURIComponent(p) + '=' + encodeURIComponent(obj[p])
            )
        }

        if (obj) {
            return this.host + handler + '?' + params.join('&')
        } else {
            return this.host + handler
        }
    }
    //是否授权中
    private _isAuthing: boolean = false

    // 地址鉴权
    async verify(): Promise<boolean> {
        if (this._isAuthing) {
            return false
        }
        console.log('verify...')
        this._isAuthing = true

        try {
            const address = await this.connectWallet()
            if (!address) return false

            const challenge = await this.Post<{ nonce: string; message: string }>(
                '/auth/nonce',
                { address }
            )
            if (!challenge?.nonce || !challenge.message) return false

            const signature = await this.personalSign(challenge.message, address)
            if (!signature) return false

            const response = await this.Post<{ token: string }>(
                '/auth/verify',
                { address, sig: signature, nonce: challenge.nonce }
            )
            console.log('/auth/verify', response)
            if (!response?.token) return false

            this.address = address
            this._sig = signature
            this._web3Data = { address, sig: signature }
            this.token = response.token
            this.tokenTime = new Date().getTime() + 14 * 60 * 1000
            return true
        } catch (error) {
            console.warn('[LinkKit] verify failed:', error)
            return false
        } finally {
            this._isAuthing = false
        }
    }

    async Post<T>(handler: string, params?: any): Promise<T> {
        // 检查授权时间
        const currentTime = new Date().getTime()
        if (currentTime >= this.tokenTime && this.token) {
            await this.verify()
        }

        return new Promise<T>(resolve => {
            const xhr = new XMLHttpRequest()
            xhr.timeout = 5000
            xhr.ontimeout = () => {
                console.warn(`[LinkKit] Post 请求超时: ${handler}`)
                resolve(null)
            }
            xhr.onerror = () => {
                console.warn(`[LinkKit] Post 网络错误: ${handler}`)
                resolve(null)
            }

            xhr.onreadystatechange = () => {
                if (xhr.readyState == 4) {
                    if (xhr.status >= 200 && xhr.status <= 207) {
                        // cc.log('Post-responseText===', xhr.responseText)
                        try {
                            const res = JSON.parse(xhr.responseText)
                            if (res.code != 1) {
                                log('res.code', res.code)
                                resolve(null)
                            } else {
                                resolve(res.data)
                            }
                        } catch (error) {
                            console.warn('[LinkKit] Post 返回非 JSON 数据:', error)
                            resolve(null)
                        }
                    } else {
                        log('xhr.status', xhr.status)
                        resolve(null)
                    }
                }
            }
            xhr.open('POST', this.host + handler, true)
            xhr.setRequestHeader('content-type', 'application/json')
            console.log('token: ', this.token)
            if (this.token) {
                xhr.setRequestHeader('Token', this.token)
                xhr.setRequestHeader('jwt_token', this.token)
            }
            xhr.send(JSON.stringify(params))
        })
    }

    Get(handler: string, params?: any): Promise<any> {
        const url = this.buildUrl(handler, params)
        return new Promise(resolve => {
            const xhr = new XMLHttpRequest()
            xhr.timeout = 5000
            xhr.ontimeout = () => {
                console.warn(`[LinkKit] Get 请求超时: ${handler}`)
                resolve(null)
            }
            xhr.onerror = () => {
                console.warn(`[LinkKit] Get 网络错误: ${handler}`)
                resolve(null)
            }
            xhr.onreadystatechange = () => {
                if (xhr.readyState == 4) {
                    if (xhr.status >= 200 && xhr.status <= 207) {
                        // cc.log('Get-responseText', xhr.responseText)
                        try {
                            const res = JSON.parse(xhr.responseText)
                            if (res.code != 1) {
                                log('res.code', res.code)
                                resolve(null)
                            } else {
                                resolve(res.data)
                            }
                        } catch (error) {
                            console.warn('[LinkKit] Get 返回非 JSON 数据:', error)
                            resolve(null)
                        }
                    } else {
                        log('xhr.status', xhr.status)
                        resolve(null)
                    }
                }
            }
            xhr.open('GET', url, true)
            xhr.setRequestHeader('content-type', 'application/json')
            // console.log('token: ', this.token)
            if (this.token) {
                xhr.setRequestHeader('Token', this.token)
            }
            xhr.send()
        })
    }

    async Put(handler: string, params?: any): Promise<any> {
        // 检查授权时间
        const currentTime = new Date().getTime()
        if (currentTime >= this.tokenTime && this.token) {
            await this.verify()
        }

        return new Promise<any>(resolve => {
            const xhr = new XMLHttpRequest()
            xhr.timeout = 5000
            xhr.ontimeout = () => {
                console.warn(`[LinkKit] Put 请求超时: ${handler}`)
                resolve({ rc: 1000 })
            }
            xhr.onerror = () => {
                console.warn(`[LinkKit] Put 网络错误: ${handler}`)
                resolve({ rc: 1000 })
            }
            xhr.onreadystatechange = () => {
                if (xhr.readyState == 4) {
                    if (xhr.status >= 200 && xhr.status <= 207) {
                        // cc.log('Put-responseText===', xhr.responseText)
                        try {
                            const res = JSON.parse(xhr.responseText)
                            if (res.code != 1) {
                                log('res.code', res.code)
                                resolve({ rc: res.code })
                            } else {
                                resolve({ rc: res.code, data: res.data })
                            }
                        } catch (error) {
                            console.warn('[LinkKit] Put 返回非 JSON 数据:', error)
                            resolve({ rc: 1000 })
                        }
                    } else {
                        log('xhr.status', xhr.status)
                        resolve({ rc: 1000 })
                    }
                }
            }
            xhr.open('PUT', this.host + handler, true)
            xhr.setRequestHeader('content-type', 'application/json')
            // console.log('token: ', this.token)
            if (this.token) {
                xhr.setRequestHeader('Token', this.token)
            }
            xhr.send(JSON.stringify(params))
        })
    }

    // 是否自己的地址
    isSelfAddress(address: string) {
        return !!address && !!this._address
            && address.toLocaleLowerCase() === this._address.toLocaleLowerCase()
    }

    isAddress(address: string): boolean {
        return this.web3.utils.isAddress(address)
    }

}