import { _decorator, Component, Label, Node, Prefab, sp, Sprite } from "cc";
const { ccclass, property } = _decorator;

@ccclass("MiningItem")
export class MiningItem extends Component {

  @property({ type: Label, tooltip: "挖矿名称" })
  public itemName: Label = null;

  @property({ type: Sprite, tooltip: "挖矿图片" })
  public itemIcon: Sprite = null;

  @property({ type: Sprite, tooltip: "挖矿图标" })
  public icon: Sprite = null;


  start() {}

  render() {}

  update(deltaTime: number) {}
}
