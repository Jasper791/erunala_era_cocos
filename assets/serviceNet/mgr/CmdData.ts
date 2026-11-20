export default class CmdData {}

export enum CmdDataModel {
  NoNO = 0,
  LoginCmd = 1,
  HeroCmd = 2,
  ElvesCmd = 3,
  ArmsCmd = 4,
  PropCmd = 5,
  MarketCmd = 6,
  TradeTypeCmd = 7,
  ChainBizCmd = 8,
  BlindBoxCmd = 9,
  MiningCmd = 10,
  BattleCmd = 11,
  PveBattleCmd = 12,
  SystemCmd = 13,
}

export enum LoginCmd {
  LoginVerifyProto = 0,
  LoginVerify = 1,
  RegisterVerify = 2,
  Logout = 3,
  Response = 4,
}

export enum HeroCmd {
  QueryHeroAllPage = 0,
  QueryHeroAll = 1,
  QueryHeroEqualDataPage = 2,
  QueryHeroAction = 3,
  QueryHeroOne = 4,
  QueryHeroEqualData = 5,
  SetHeroAction = 6,
  SetHeroUpGrade = 7,
  SetHeroMerge = 8,
  SetHeroHatch = 9,
  SetHeroNickName = 10,
  SetHeroExp = 11,
  SetHeroHp = 12,
  // MintHero/BurnHero(13/14) 已移除：服务端不再代发合约，铸造/销毁走客户端钱包直签 + 扫链确认
}

export enum ElvesCmd {
  QueryElvesAllPage = 0,
  QueryElvesAll = 1,
  QueryElvesEqualDataPage = 2,
  QueryElvesOne = 3,
  QueryElvesEqualData = 4,
}

export enum ArmsCmd {
  QueryArmsAllPage = 0,
  QueryArmsAll = 1,
  QueryArmsEqualDataPage = 2,
  QueryArmsOne = 3,
  QueryArmsEqualData = 4,
}

export enum PropCmd {
  QueryPropAllPage = 0,
  QueryPropAll = 1,
  QueryPropEqualDataPage = 2,
  QueryPropOne = 3,
  QueryPropEqualData = 4,
}

export enum MarketCmd {
  QueryGoodsAll = 0,
  QueryGoodsOne = 1,
}

export enum TradeTypeCmd {
  QueryHeroTradeType = 0,
  QueryElvesTradeType = 1,
  QueryArmsTradeType = 2,
  QueryPropTradeType = 3,
}

export enum ChainBizCmd {
  QueryChainBiz = 0,
  DeleteChainBiz = 1,
  PushChainBiz = 2,
}

export enum BlindBoxCmd {
  HeroBlindBox = 0,
  ElvesBlindBox = 1,
  ArmsBlindBox = 2,
  PropBlindBox = 3,
  QueryBoxList = 4,
  QueryPurchaseLogPage = 5,
  QueryOpenLogPage = 6,
}

export enum MiningCmd {
  QueryMiningAll = 0,
  QueryMiningStaking = 1,
  QueryMiningProvide = 2,
  QueryMiningRewardConfig = 3,
}

export enum BattleCmd {
  QueryBattleGroup = 0,
  QueryBattleHeroAll = 1,
  QueryBattleElvesAll = 2,
  QueryBattleTeamAll = 3,
  QueryBattleHeroLog = 4,
  QueryBattleElvesLog = 5,
  QueryBattleTeamLog = 6,
  QueryBattleTradeType = 7,
}

export enum PveBattleCmd {
  CreatePveBattle = 0,
  JoinPveBattle = 1,
  NextRound = 2,
  SettlePveBattle = 3,
  QueryPveBattleRoom = 4,
  QuickFinishPveBattle = 5,
  RoundResultPush = 200,
  BattleEndPush = 201,
}

export enum SystemCmd {
  QueryContractConfigs = 0,
}