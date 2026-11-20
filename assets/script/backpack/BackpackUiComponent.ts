import { _decorator, Component, Node, director, find } from "cc";
import { util } from "../../common/util/Util";
import { LoadSceneComponent } from "../../resources/prefab-resource/LoadSceneComponent";
import { BackpackEquipmentComponent } from "./BackpackEquipmentComponent";
import { BackpackBackpackComponent } from "./BackpackBackpackComponent";
import PropServiceNet from "../../serviceNet/PropServiceNet";
import ArmsServiceNet from "../../serviceNet/ArmsServiceNet";
const { ccclass, property } = _decorator;

@ccclass("BackpackUiComponent")
export class BackpackUiComponent extends Component {
  @property(Node)
  equipmentNode: Node;
  @property(Node)
  backpackNode: Node;

  // 开始渲染
  protected async start() {
    const loadScenesComponent = this.node.parent?.getChildByName("LoadScene")?.getComponent(LoadSceneComponent);
    if (loadScenesComponent) loadScenesComponent.node.active = true;
    loadScenesComponent?.setProgress(70);
    this.queryArmsAll()
    this.queryPropAll()
    //await this.rerender()
    loadScenesComponent?.setProgress(100);
    await loadScenesComponent?.awaitProgressEnd();
    if (loadScenesComponent) loadScenesComponent.node.active = false;
  }

  //网络请求 查询钱包地址的背包道具
  public async queryPropAll() {
    await PropServiceNet.queryPropAll();
  }

  //网络请求 查询钱包地址的背包装备
  public async queryArmsAll() {
    await ArmsServiceNet.queryArmsAll();
  }

  // 切换装备
  public async switchEquipment() {
    this.backpackNode.active = false;
    this.equipmentNode.active = true;
    await this.equipmentNode
      .getComponent(BackpackEquipmentComponent)
      .rerender();
  }

  // 切换背包
  public async switchBackpack() {
    this.backpackNode.active = true;
    this.equipmentNode.active = false;
    await this.backpackNode.getComponent(BackpackBackpackComponent).rerender();
  }

  // 返回HOME
  async goHome() {
    await util.scene.go("Home");
  }
}
