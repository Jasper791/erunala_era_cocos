import { _decorator, Component, director, find, Node, Prefab } from "cc";
import { util } from "../../common/util/Util";
import { getConfig } from "../../common/Config";
import { MiningItem } from "../../resources/prefab-resource/MiningItem";
const { ccclass, property } = _decorator;

@ccclass("Mining")
export class Mining extends Component {

  @property({ type: Node, tooltip: "scrollView" })
  public scrollView: Node = null;

  @property({ type: Prefab, tooltip: "挖矿Item" })
  public MiningItem: Prefab = null;

  @property({ type: Node, tooltip: "列表容器" })
  public content: Node = null;

  @property({ type: Node, tooltip: "详情" })
  public detail: Node = null;

  protected async start() {
    this.renderList()
  }

  async renderList() {
    const prefab = await util.resource.loadResource(
      "prefab-resource/MiningItem",
      Prefab
    );
    this.content?.children.forEach((c) => c.destroy());
    this.content?.removeAllChildren();

    for (var i = 0; i <= 5; i++) {
      const node = await util.resource.createNodeByPrefab(prefab);
      this.content?.addChild(node);
      // 打开详情
      node.on("click", () => {
        console.log("show detail");
        this.detail.active = true;
      });
    }
  }

  // 关闭详情
  public closeDetail() {
    this.detail.active = false;
  }
}
