/**
 * 区块链链上配置
 *
 * 仅存放与链相关的数据（chainId / rpcUrl / blockExplorer 等）。
 * 网络连接配置（WebSocket / HTTP API / 测试账号 / 心跳常量）统一放在 NetConfig.ts。
 */
import { envMode, EnvMode } from '../../common/config/NetConfig'

// 向后兼容：旧代码使用 mode 变量
export type { EnvMode }
export const mode: EnvMode = envMode

export const chain_data = {
    dev: {
        chain: {
            chainId: `0x${Number(1319).toString(16)}`,
            chainName: 'AIA Mainnet',
            nativeCurrency: {
                name: 'AIA',
                symbol: 'AIA',
                decimals: 18,
            },
            rpcUrls: ['https://aia-dataseed1.aiachain.org'],
            blockExplorerUrls: ['https://block-explorer.aitd.io/'],
        },
        id: 1319,
        rpcUrl: 'https://aia-dataseed1.aiachain.org',
    },
    pre: {
        chain: {
            chainId: `0x${Number(1319).toString(16)}`,
            chainName: 'AIA',
            nativeCurrency: {
                name: 'AIA',
                symbol: 'AIA',
                decimals: 18,
            },
            rpcUrls: ['https://aia-dataseed1.aiachain.org'],
            blockExplorerUrls: ['https://block-explorer-testnet2.aitd.io/'],
        },
        id: 1319,
        rpcUrl: 'https://aia-dataseed1.aiachain.org',
    },
    prod: {
        chain: {
            chainId: `0x${Number(1319).toString(16)}`,
            chainName: 'AIA Mainnet',
            nativeCurrency: {
                name: 'AIA',
                symbol: 'AIA',
                decimals: 18,
            },
            rpcUrls: ['https://walletrpc.aitd.io'],
            blockExplorerUrls: ['https://block-explorer-testnet2.aitd.io/'],
        },
        id: 1319,
        rpcUrl: 'https://walletrpc.aitd.io',
    },
}

export const chainInfo = chain_data[mode]
