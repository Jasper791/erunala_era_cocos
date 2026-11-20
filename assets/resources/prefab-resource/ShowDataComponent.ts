import { _decorator, Component, error, Label, Node, Prefab, resources } from 'cc';
const { ccclass, property } = _decorator;
import {Option} from "./../../common/util/message/ShowData"

@ccclass('ShowDataComponent')
export class ShowDataComponent extends Component {

    private speed: number = 1

    public setLabelString(s: string , option: Option = {}) {
        const label = this.getComponent(Label)
        label.string = s
        if (option.fontSize) {
            label.fontSize = option.fontSize
            label.lineHeight = option.fontSize
        }
        label.color.set(option.r || 255, option.g || 255, option.b || 255)
        this.node.setScale(
            option.scaleX || 1 ,
            option.scaleY || 1 ,
            1
        )
        this.speed = option.speed || 1
    }

    private num = 0
    protected update(dt: number): void {
        if (++this.num > (60 / this.speed)) {
            this.node.parent.removeChild(this.node)
            this.node.destroy()
        }
        this.node.setPosition(
            this.node.position.x ,
            this.node.position.y + dt * 150 * this.speed,
            this.node.position.z ,
        )
    }
}


