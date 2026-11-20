/**
 * 上链业务类型枚举（chain_biz.bizType）
 *
 * 枚举依据：assets/resources/config-rerouce/contract-config/contract_dev.ts 中
 * 21 个合约 ABI 的「玩家可主动发起（非 owner/admin）的可写函数」逐一归并。
 * 服务端 ChainBiz 注释兼容：0=盲盒 1=英雄。
 * 编号按合约域分段，每段预留扩展位；扫链端与服务端 moveBizType 映射需与本表对齐。
 */

export enum ChainBizType {
  // ===== 盲盒/英雄（NiuNiu 721 / ChuSheng / MangHe）=====
  /** 开盲盒出生 ChuSheng.born(boxId) */
  BlindBoxBorn = 0,
  /** 英雄铸造 NiuNiu.mint / mintNormall / mintNormallWithParents / mintNormalAdultWithoutParents */
  HeroMint = 1,
  /** 英雄销毁 NiuNiu.burn(tokenId) */
  HeroBurn = 2,
  /** 英雄升星 NiuNiu.upGradeStar(tokenId) */
  HeroUpgradeStar = 3,
  /** 英雄成长 NiuNiu.growUp(tokenId)（牛栏内成长为 NiuLan.growUp，共用本类型） */
  HeroGrowUp = 4,
  /** 英雄加经验 NiuNiu.addExp(tokenId, amount) */
  HeroAddExp = 5,
  /** 英雄转移 NiuNiu.transferFrom / safeTransferFrom */
  HeroTransfer = 6,

  // ===== 代币（BVT/BVG/USDT 共用，用 chain_biz.symbol 区分币种）=====
  /** 授权 approve(spender, amount)（市场/商店购买前置） */
  TokenApprove = 10,
  /** 转账 transfer(recipient, amount) */
  TokenTransfer = 11,

  // ===== 道具（DaoJu 1155 / DaoJuShangDian）=====
  /** 道具销毁 DaoJu.burn / burnBatch */
  ItemBurn = 20,
  /** 道具转移 DaoJu.safeTransferFrom / safeBatchTransferFrom */
  ItemTransfer = 21,
  /** 道具商店购买 DaoJuShangDian.buyItem(itemId, amount) */
  ItemShopBuy = 22,
  /** 使用道具 NiuLan.useItem / NiuNaiChang.userItem */
  ItemUse = 23,

  // ===== 星球卡（XingQiu721）=====
  /** 星球卡换肤/改类型 XingQiu721.changeType(tokenId, type) */
  PlanetCardChangeType = 30,
  /** 星球卡销毁 XingQiu721.burn(tokenId) */
  PlanetCardBurn = 31,

  // ===== 牛栏养成（NiuLan）=====
  /** 放入牛栏 putIn(tokenId) */
  StablePutIn = 40,
  /** 取出牛栏 putOut(tokenId) */
  StablePutOut = 41,
  /** 喂养 feed(tokenId, amount, types) */
  StableFeed = 42,
  /** 充能 charge / chargeWithItem */
  StableCharge = 43,
  /** 购买牛栏 buyStable() */
  StableBuy = 44,
  /** 牛栏合成 compoundCattle(tokenId)（HeCheng.compoundCattle 共用本类型） */
  StableCompound = 45,
  /** 碎片合成 HeCheng.compoundShred() */
  CompoundShred = 46,

  // ===== 繁育（JiaoPei）=====
  /** 交配 mating(myTokenId, targetTokenID) [payable] */
  Mating = 50,
  /** 自交 selfMating(tokenId1, tokenId2) [payable] */
  SelfMating = 51,
  /** 上架交配位 upLoad(tokenId, price) */
  MatingUpLoad = 52,
  /** 下架交配位 offSale(tokenId) */
  MatingOffSale = 53,

  // ===== 交易市场（JiaoYi_721）=====
  /** 挂单出售 sell(goodsType, tokenId, tradeType, price) */
  MarketSell = 60,
  /** 取消挂单 cancelSell(goodsType, tokenId) */
  MarketCancelSell = 61,
  /** 代币购买 erc20Purchase(goodsType, tokenId) */
  MarketPurchaseToken = 62,
  /** 主币购买 mainCoinPurchase(goodsType, tokenId) [payable] */
  MarketPurchaseCoin = 63,

  // ===== 星球（CREATE_XingQiu）=====
  /** 创建星球 createNewPlanet(tokenId) */
  PlanetCreate = 70,
  /** 绑定星球 bondPlanet(tokenId) */
  PlanetBond = 71,
  /** 升级星球 upGradePlanet(tokenId) */
  PlanetUpgrade = 72,
  /** 申请/取消联邦星球 applyFederalPlanet / cancelApply */
  PlanetApplyFederal = 73,
  /** 领取税收 claimTax(amount) */
  PlanetClaimTax = 74,
  /** 支付/取消租金 payRent / cancelRent */
  PlanetRent = 75,
  /** 拔出星球卡 pullOutPlanetCard(tokenId) */
  PlanetPullCard = 76,
  /** 领取战斗奖励 claimBattleReward(planetId, 签名) */
  PlanetClaimBattleReward = 77,

  // ===== 牛奶场质押（NiuNaiChang）=====
  /** 质押 stake(tokenId, energyCost) */
  MilkStake = 80,
  /** 解押 unStake(tokenId) */
  MilkUnStake = 81,
  /** 领取全部牛奶 claimAllMilk() */
  MilkClaim = 82,
  /** 续期 renewTime(tokenId, energyCost) */
  MilkRenew = 83,
  /** 徽章合成 compoundBadge / batchCompoundBadgeShred */
  MilkCompoundBadge = 84,

  // ===== 皮肤/徽章（PiFu / HuiZhang / PiFuShangCheng）=====
  /** 购买皮肤 PiFuShangCheng.buySkin(skinId, payWith) */
  SkinBuy = 90,
  /** 开皮肤盲盒 openSkinBox(amount) */
  SkinOpenBox = 91,
  /** 皮肤合成 compoundSkin / compoundSuperSkin / batchCompoundSkin */
  SkinCompound = 92,
  /** 徽章销毁 HuiZhang.burn(tokenId) */
  BadgeBurn = 93,

  // ===== 公会商城（GonghuiShangCheng）=====
  /** 普通购买 buyNormal(itemID, amount) */
  GuildBuyNormal = 100,
  /** 限购购买 buyLimit(itemID, amount) */
  GuildBuyLimit = 101,

  // ===== UR宝箱（BaoXiang）=====
  /** 开宝箱 openBox(boxId, amount) */
  UrBoxOpen = 110,

  // ===== 邮件/推荐/战斗（YouJian / TuiJian / ZhanDou）=====
  /** 领取邮件奖励 claimMail(...)（带签名） */
  MailClaim = 120,
  /** 绑定推荐关系 TuiJian.bondInvitor / YouJian.bond */
  ReferBond = 121,
  /** 战斗上报 ZhanDou.userFight / upLoadFight（带签名） */
  FightUpload = 122,
  /** 战斗领奖 ZhanDou.claimReward(rounds) */
  FightClaim = 123,

  // ===== 科技树（KeJiShu）=====
  /** 购买科技 buyTec / buyTecBatch */
  TechBuy = 130,
}

/** bizType → 展示名（Task 场景列表用） */
export const ChainBizTypeLabel: Record<number, string> = {
  [ChainBizType.BlindBoxBorn]: "开盲盒",
  [ChainBizType.HeroMint]: "英雄铸造",
  [ChainBizType.HeroBurn]: "英雄销毁",
  [ChainBizType.HeroUpgradeStar]: "英雄升星",
  [ChainBizType.HeroGrowUp]: "英雄成长",
  [ChainBizType.HeroAddExp]: "英雄加经验",
  [ChainBizType.HeroTransfer]: "英雄转移",
  [ChainBizType.TokenApprove]: "代币授权",
  [ChainBizType.TokenTransfer]: "代币转账",
  [ChainBizType.ItemBurn]: "道具销毁",
  [ChainBizType.ItemTransfer]: "道具转移",
  [ChainBizType.ItemShopBuy]: "道具购买",
  [ChainBizType.ItemUse]: "使用道具",
  [ChainBizType.PlanetCardChangeType]: "星球卡换肤",
  [ChainBizType.PlanetCardBurn]: "星球卡销毁",
  [ChainBizType.StablePutIn]: "放入牛栏",
  [ChainBizType.StablePutOut]: "取出牛栏",
  [ChainBizType.StableFeed]: "喂养",
  [ChainBizType.StableCharge]: "充能",
  [ChainBizType.StableBuy]: "购买牛栏",
  [ChainBizType.StableCompound]: "牛栏合成",
  [ChainBizType.CompoundShred]: "碎片合成",
  [ChainBizType.Mating]: "交配",
  [ChainBizType.SelfMating]: "自交",
  [ChainBizType.MatingUpLoad]: "上架交配位",
  [ChainBizType.MatingOffSale]: "下架交配位",
  [ChainBizType.MarketSell]: "市场挂单",
  [ChainBizType.MarketCancelSell]: "取消挂单",
  [ChainBizType.MarketPurchaseToken]: "代币购买",
  [ChainBizType.MarketPurchaseCoin]: "主币购买",
  [ChainBizType.PlanetCreate]: "创建星球",
  [ChainBizType.PlanetBond]: "绑定星球",
  [ChainBizType.PlanetUpgrade]: "升级星球",
  [ChainBizType.PlanetApplyFederal]: "联邦星球申请",
  [ChainBizType.PlanetClaimTax]: "领取税收",
  [ChainBizType.PlanetRent]: "星球租金",
  [ChainBizType.PlanetPullCard]: "拔出星球卡",
  [ChainBizType.PlanetClaimBattleReward]: "领取战斗奖励",
  [ChainBizType.MilkStake]: "牛奶场质押",
  [ChainBizType.MilkUnStake]: "牛奶场解押",
  [ChainBizType.MilkClaim]: "领取牛奶",
  [ChainBizType.MilkRenew]: "质押续期",
  [ChainBizType.MilkCompoundBadge]: "徽章合成",
  [ChainBizType.SkinBuy]: "购买皮肤",
  [ChainBizType.SkinOpenBox]: "开皮肤盲盒",
  [ChainBizType.SkinCompound]: "皮肤合成",
  [ChainBizType.BadgeBurn]: "徽章销毁",
  [ChainBizType.GuildBuyNormal]: "公会商城购买",
  [ChainBizType.GuildBuyLimit]: "公会限购购买",
  [ChainBizType.UrBoxOpen]: "开UR宝箱",
  [ChainBizType.MailClaim]: "领取邮件奖励",
  [ChainBizType.ReferBond]: "绑定推荐关系",
  [ChainBizType.FightUpload]: "战斗上报",
  [ChainBizType.FightClaim]: "战斗领奖",
  [ChainBizType.TechBuy]: "购买科技",
}

/** chain_biz.state → 展示文案（与服务端 ChainBiz 注释一致：0发起 1待查阅 2上链中 3失败 4拒绝 5完成） */
export const ChainBizStateText: Record<number, string> = {
  0: "已发起",
  1: "待查阅",
  2: "上链中",
  3: "上链失败",
  4: "已拒绝签名",
  5: "已完成",
}
