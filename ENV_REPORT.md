# Cocos Creator 开发环境快照

> 生成时间: 2026-11-07
> 操作系统: Windows 10/11 x64
> 唯一基线: **Creator 3.8.4 + Node 18.20.4**

---

## 〇、版本基线 (全项目唯一标准)

| 组件 | 基线版本 | 来源 |
|------|---------|------|
| Cocos Creator | **3.8.4** | `package.json` → `creator.version` |
| Node.js | **18.20.4** (18 LTS) | `.nvmrc` |
| npm | **10.7.0** | 随 Node 18.20.4 自带 |
| TypeScript | **4.8.4** | `devDependencies` |
| Git | **2.56.0** | 本机 |

> 约定: 本项目只允许用 **Creator 3.8.4** 打开、只允许用 **Node 18.20.x** 构建。
> 本机其他版本 (2.4.14 / 3.6.0 / 3.8.6) 不得用于本工程 —— 用不同 Creator 版本打开会触发全量资源重导入并改写 `library/`，且可能改变脚本 uuid 的解析结果。

---

## 一、Cocos Creator

| 项目 | 值 |
|------|-----|
| 项目指定版本 | **3.8.4** (`package.json` `"creator": "3.8.4"`) |
| 编辑器安装 | 通过 Cocos Dashboard 安装 **3.8.4**，启动前核对关于页版本 |
| 编辑器默认安装目录 | `C:\ProgramData\cocos\editors\Creator\3.8.4\`（本机该目录当前为空，需先安装） |
| Dashboard | `D:\Program Files (x86)\CocosDashboard\` (2.2.2.1515) |
| 编辑器内置运行时 | 随 3.8.4 发布，无需单独安装 |
| 命令行构建 Node | 使用系统 Node **18.20.4**（见第二节） |

---

## 二、Node.js / npm

| 项目 | 值 |
|------|-----|
| 当前系统 Node | **v18.20.4** |
| 当前系统 npm | **10.7.0** |
| Node 路径 | `C:\Program Files\nodejs\node.exe` |
| 版本锁定文件 | `.nvmrc` = `18.20.4` |
| Git | **v2.56.0** |

### 版本一致性要求

Creator 3.8.x 官方推荐 **Node 18 LTS ~ Node 20 LTS**。本项目锁定 **18.20.4**：

- 低于 18：Creator 3.8 构建脚本无法运行
- 高于 20（如 Node 25）：原生模块/构建脚本存在兼容性风险，禁止使用

切换方式:
```powershell
nvm install 18.20.4
nvm use 18.20.4
node --version   # v18.20.4
```

---

## 三、内置工具链 (安装 Creator 3.8.4 后自带，无需单独安装)

| 工具 | 路径 |
|------|------|
| Python 2.7 | `C:\ProgramData\cocos\editors\Creator\3.8.4\resources\tools\Python27-win32\Python27\python.exe` |
| CMake | `C:\ProgramData\cocos\editors\Creator\3.8.4\resources\tools\cmake\bin\cmake.exe` |

---

## 四、项目信息

| 项目 | 值 |
|------|-----|
| 路径 | `F:\web3_pokemon\erunala_era_cocos` |
| 模块 | 2d / ui / animation / audio / video / websocket / spine / tiled-map / physics-2d-box2d |
| 渲染管线 | legacy-pipeline (WebGL + WebGL2) |
| 物理 | physics-2d-box2d |
| 后端 API | `http://192.168.10.8` |

---

## 五、新机器一键搭建

```powershell
# 1. 安装 nvm-windows
#    下载: https://github.com/coreybutler/nvm-windows/releases
nvm install 18.20.4
nvm use 18.20.4
node --version   # 必须是 v18.20.4

# 2. 安装 Git (https://git-scm.com/download/win)

# 3. 安装 Cocos Dashboard (https://www.cocos.com/creator-download)
#    Dashboard 里安装 Creator 3.8.4（不要装 3.8.6 打开本项目）

# 4. 克隆项目
git clone <仓库地址> erunala_era_cocos

# 5. 确认无残留缓存后再导入
#    （仓库里不应提交 library/ 与 temp/）
#    Cocos Dashboard -> 用 3.8.4 导入项目目录

# 6. 校验环境一致性
node -v          # v18.20.4
npm -v           # 10.7.0
# package.json -> creator.version 必须为 3.8.4
```

---

## 六、修复记录

| # | 问题 | 修复 | 状态 |
|---|------|------|------|
| 1 | Login 报错 `Can not find class '0eddbMN6KhK4rxtSvx+N6JC'` | 删除 library/ 和 temp/ | OK |
| 2 | PreloadComponent.ts:18 null 引用 `setProgress` | 同上，连带修复 | OK |
| 3 | Attack.scene 丢失 AttackElvesComponent | `336c0PpphdPG7/qn1M7TAgB` -> `af0a9HQyKhA2bzg8nUfNeiu` | OK |
| 4 | 后端地址缺失 | 新建 `assets/common/serverConfig.ts` | OK |

---

## 七、Cocos UUID 短编码 (内部参考)

Creator 3.x 的 scene/prefab 里，**脚本组件**的 `__type__` 和 ClickEvent 的 `_componentId` 使用 **23 字符**短码：

```
23 字符 = 5 字符 hex 前缀 + 18 字符 base64
├── 前 5 字符: 直接拷贝 UUID hex 的前 5 位
└── 后 18 字符: 剩余 27 个 hex 位，每 3 个 hex (12 bit) 编码为 2 个 base64 字符
               字符表: BASE64_KEYS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
               即 v = parseInt(hex3, 16); 输出 BASE64_KEYS[v >> 6] + BASE64_KEYS[v & 63]
```

> 注意: **资源 uuid**（图片、预制体等）用的是 **22 字符**短码（2 字符 hex 前缀 + 20 字符 base64）。
> 脚本组件 id 绝不能写成 22 字符，否则引擎 `getClassById` 查不到类，编辑器会提示
> "脚本编译失败，该组件将在修正后自动还原"。

已验证配对:
| UUID | 短码 | 组件 |
|------|------|------|
| `ad8c3a45-5c75-440c-8988-9e937ada4631` | `ad8c3pFXHVEDImInpN62kYx` | LoadSceneComponent |
| `44dfdd28-e5ec-b133-ee5b-74c5ad475810` | `44dfd0o5eyxM+5bdMWtR1gQ` | LoginUiComponent |
| `af0a91d0-c8a8-40d9-bce0-f2751f35e8ae` | `af0a9HQyKhA2bzg8nUfNeiu` | AttackElvesComponent |

编码 JS 实现:
```js
const BASE64_KEYS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function compressUuid(uuid) {
    const hex = uuid.replace(/-/g, '').toLowerCase();
    let out = hex.slice(0, 5);              // 保留前 5 位 hex
    for (let i = 5; i < 32; i += 3) {       // 剩余 27 位 hex，每 3 位一组
        const v = parseInt(hex.slice(i, i + 3), 16);
        out += BASE64_KEYS[v >> 6] + BASE64_KEYS[v & 63];
    }
    return out;                              // 23 字符
}
```
