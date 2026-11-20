/**
 * 网络连接统一配置
 *
 * 本文件是游戏端所有「网络连接相关」配置的唯一入口：
 *  - 环境模式 (dev / pre / prod)
 *  - WebSocket 连接地址
 *  - HTTP API 接口地址
 *  - 开发测试账号
 *  - 网络相关常量（心跳间隔、连接超时、空闲超时）
 *
 * 区块链链上数据（chainId / rpcUrl 等）请放在 chain-config.ts，不与网络连接配置混用。
 */

export type EnvMode = 'dev' | 'pre' | 'prod'

/** 当前运行环境：dev / pre / prod */
export const envMode: EnvMode = 'pre'

/**
 * WebSocket 连接地址（按环境区分）
 * 注意：pre/prod 走域名反代，TLS 终结在 443，必须省略 10100 端口（带端口外部不可达）；
 * 容器内部端口仍是 10100，由反代转发。
 */
export const wsConfig: Record<EnvMode, { url: string }> = {
    dev: {
        url: 'ws://192.168.10.8:10100/websocket',
    },
    pre: {
        url: 'wss://ws-connector-pre.pokemontv.org/websocket',
    },
    prod: {
        url: 'wss://ws-connector.pokemontv.org:10100/websocket',
    },
}

/** HTTP API 接口地址（按环境区分，pre 同理省略 6868 端口，由反代 443 转发） */
export const apiConfig: Record<EnvMode, { host: string }> = {
    dev: {
        host: 'http://192.168.10.8:6868/api',
    },
    pre: {
        host: 'https://gate-pre-api.pokemontv.org/api',
    },
    prod: {
        host: 'https://gate-api.pokemontv.org:6868/api',
    },
}

/** 开发测试账号（仅 dev 环境联调使用） */
export const devAccount = {
    token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhZGRyZXNzIjoiMHhkM2MwYjZhYTE1MzhkNjM5OTEyNzg5YmU3MDVmMThiNWZkODlmY2U2IiwiaWQiOjEsImV4cCI6MTczNzIyMzk4NX0.DcJ8uSBltsKl1Ev78GaISOx01HwhiacPAx0bedYOeUM',
    address: '0xd3c0b6aa1538d639912789be705f18b5fd89fce6',
    account: 'test',
    password: '73l8gRjwLftklgfdXT+MdiMEjJwGPVMsyVxe16iYpk8=',
}

/** 网络相关常量 */
export const NET_CONST = {
    /** 心跳间隔（毫秒），需与服务端 IdleProcessSetting.idleTime 协调，小于服务端空闲超时 */
    heartbeatInterval: 15000,
    /** WebSocket 连接超时（毫秒） */
    connectTimeout: 10000,
    /** 服务端空闲超时（秒），与 GameExternal 中 IdleProcessSetting.setIdleTime(90) 保持一致 */
    serverIdleTimeout: 90,
}

/** 当前环境的 WebSocket 地址 */
export const wsUrl: string = wsConfig[envMode].url

/** 当前环境的 HTTP API 地址 */
export const apiHost: string = apiConfig[envMode].host

/**
 * 运行时切换环境说明：
 * wsUrl / apiHost 是模块加载时根据 envMode 计算的常量。
 * 若需在运行时切换环境，请直接通过 wsConfig[mode].url / apiConfig[mode].host 读取，
 * 并在切换后重新建立 WebSocket 连接。
 */

