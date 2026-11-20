import { _decorator, Component, Label, Node, Prefab, sp, Sprite } from "cc";
import { ElvesCreateData } from "../../common/game/elves/ElvesCreateData";
import { ElvesComponent } from "../../resources/prefab-resource/ElvesComponent";
import { util } from "../../common/util/Util";
const { ccclass, property } = _decorator;

@ccclass("ChallengeItem")
export class ChallengeItem extends Component {
  @property({ type: Label, tooltip: "商品名称" })
  public itemName: Label = null;

  @property({ type: Sprite, tooltip: "商品图片" })
  public itemIcon: Sprite = null;

  @property({ type: Sprite, tooltip: "币种图标" })
  public icon: Sprite = null;

  // 当前精灵数据
  private currentCharacterData: ElvesCreateData;

  // 当前渲染的精灵
  private currentCharacterComponent: ElvesComponent;

  // 加载精灵
  public async initCharacter(character: ElvesCreateData) {
    this.currentCharacterData = character;
    // 精灵预制体
    const elvesPrefab = await util.resource.loadResource(
      "prefab-resource/Elves",
      Prefab
    );
    // 精灵节点
    const elvesNode = await util.resource.createNodeByPrefab(elvesPrefab);
    // 设置精灵
    await elvesNode.getComponent(ElvesComponent).initCharacter(
      {
        ...character,
        direction: "left",
        characterScale: 1.3,
      },
      null
    );
    // 设置位置
    elvesNode.setPosition(0, 0, 0);
    this.node.getChildByName("ElvesNode").addChild(elvesNode);
    this.currentCharacterComponent = elvesNode.getComponent(ElvesComponent);
    // 再次播放动画
    elvesNode
      .getComponent(ElvesComponent)
      .playCharacterAnimation("standby_loop")
      .then();
  }

  // 播放动画
  public playAnimation() {
    if (this.currentCharacterComponent)
      this.currentCharacterComponent.playCharacterAnimation("attack", 1).then();
  }

  start() {}

  render() {}

  update(deltaTime: number) {}
}
