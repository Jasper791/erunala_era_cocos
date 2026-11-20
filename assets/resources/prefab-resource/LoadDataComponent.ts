import { _decorator, Component, Label, math, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('LoadDataComponent')
export class LoadDataComponent extends Component {

    @property(Node)
    loadMagicNode: Node

    update(deltaTime: number) {
        this.loadMagicNode.angle = this.loadMagicNode.angle + deltaTime * 150
    }

    protected onDisable(): void {
        this.node.destroy()
    }

    setContent(content?: string) {
        if (content) this.loadMagicNode.getComponent(Label).string = content
    }
}


