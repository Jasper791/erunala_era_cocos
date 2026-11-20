import { _decorator, Component, director, find, Node, Prefab } from "cc";
import { LoadSceneComponent } from "../../resources/prefab-resource/LoadSceneComponent";
import { util } from "../../common/util/Util";
import { ChallengeComponent } from "./ChallengeComponent";
const { ccclass, property } = _decorator;

@ccclass("ChallengeUiComponent")
export class ChallengeUiComponent extends Component {

  @property(Node)
  public challengeComponentNode: Node

  // 开始渲染
  protected async start() {
    const loadScenesComponent = this.node.parent?.getChildByName("LoadScene")?.getComponent(LoadSceneComponent);
    if (loadScenesComponent) loadScenesComponent.node.active = true;
    loadScenesComponent?.setProgress(70);
    //await this.renderList();
    loadScenesComponent?.setProgress(100);
    await loadScenesComponent?.awaitProgressEnd();
    if (loadScenesComponent) loadScenesComponent.node.active = false;
  }

  //打开英雄挑战榜
  public async openChallengeListByHero() {
    const challengeComponent = this.challengeComponentNode.getComponent(ChallengeComponent)
    challengeComponent.renderChallengeList()
    this.closeBattleBase()
  }

  //打开精灵挑战榜
  public async opentChallengeListByElves() {
    const challengeComponent = this.challengeComponentNode.getComponent(ChallengeComponent)
    challengeComponent.renderChallengeList()
    this.closeBattleBase()
  }

  //打开团队挑战榜
  public async openChallengeListByTeam() {
    const challengeComponent = this.challengeComponentNode.getComponent(ChallengeComponent)
    challengeComponent.renderChallengeList()
    this.closeBattleBase()
  }

  // 打开调整类型面板
  public async openBattleBase() {
    this.node.parent.getChildByName("BattleBase").active = true
  }

  // 打开调整类型面板
  public async closeBattleBase() {
    this.node.parent.getChildByName("BattleBase").active = false
  }

  // 回主界面
  public async goHome() {
    await util.scene.go("Home");
  }
}
