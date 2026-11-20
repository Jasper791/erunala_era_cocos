import { _decorator, Component, director, find, Node, Prefab } from "cc";
import { util } from "../../common/util/Util";
import { getConfig } from "../../common/Config";
import { ElvesCreateData } from "../../common/game/elves/ElvesCreateData";
import { ElvesAvatarComponent } from "../../resources/prefab-resource/ElvesAvatarComponent";
import { ChallengeItem } from "../../resources/prefab-resource/ChallengeItem";
const { ccclass, property } = _decorator;

@ccclass("ChallengeComponent")
export class ChallengeComponent extends Component {
  
  @property({ type: Node, tooltip: "scrollView" })
  public scrollView: Node = null;

  @property({ type: Prefab, tooltip: "挑战Item" })
  public ChallengeItem: Prefab = null;

  @property({ type: Node, tooltip: "列表容器" })
  public content: Node = null;

  @property({ type: Node, tooltip: "详情" })
  public detail: Node = null;

  // 当前队列
  public allElvesData: ElvesCreateData[] = [];
  // uuid对应的所有ElvesAvatarComponent
  public allElvesComponent: Map<number, ElvesAvatarComponent> = new Map();

  //加载挑战榜数据
  public async renderChallengeList() {
    const prefab = await util.resource.loadResource(
      "prefab-resource/ChallengeItem",
      Prefab
    );
    this.content?.children.forEach((c) => c.destroy());
    this.content?.removeAllChildren();

    const config = getConfig();
    
    // 预制体
    const elvesAvatarPrefab = await util.resource.loadResource(
      "prefab-resource/ElvesAvatar",
      Prefab
    );
    // 所有的待渲染角色
    this.allElvesData = [
      ...config.userData.elvesQueue,
      ...config.userData.elves,
    ];

    // 遍历所有
    for (const elves of this.allElvesData) {
      let avatarComponent = this.allElvesComponent.get(elves.uuid);

      const node = await util.resource.createNodeByPrefab(prefab);
      node.name="ChallengeItem_"+elves.uuid
      node.getComponent(ChallengeItem).initCharacter(elves)
      this.content?.addChild(node);
      // 打开详情
      node.on("click", () => {
        this.detail.active = true;
      });
    }
  }

  // 关闭详情
  public closeDetail() {
    this.detail.active = false;
  }
}
