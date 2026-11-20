import { _decorator, Component, Label, Node , EventTouch , Toggle} from 'cc';
const { ccclass, property } = _decorator;
import {Option} from "./../../common/util/message/ConfirmData"

@ccclass('ConfirmDataComponent')
export class ConfirmDataComponent extends Component {

    @property(Node)
    messageNode: Node

    @property(Node)
    titleNode: Node

    @property(Node)
    toggleMessageNode: Node

    public readonly sureQueue: any[] = []
    public readonly cancelQueue: any[] = []

    public readonly toggleEventQueue: any[] = []

    setContent(content: Option) {
        const label = this.messageNode.getComponent(Label)
        label.string = content.message

        if (content.fontSize) {
            label.fontSize = content.fontSize
            label.lineHeight = content.fontSize
        }
        if (content.title) {
            this.titleNode.getComponent(Label).string = content.title
        }
        label.color.set(content.r || 255, content.g || 255, content.b || 255)
        this.node.setScale(
            content.scaleX || 1,
            content.scaleY || 1,
            1
        )

        if (!content.toggleMessage) return this.node.getChildByName("Toggle").active = false
        this.toggleMessageNode.getComponent(Label).string = content.toggleMessage
        this.toggleEventQueue.push(content.toggleChangeEvent || (() => null))

    }


    onSure() {
        this.node.parent.removeChild(this.node)
        this.sureQueue.forEach(res => res())
        this.node.destroy()
    }

    onCancel() {
        this.node.parent.removeChild(this.node)
        this.cancelQueue.forEach(res => res())
        this.node.destroy()
    }

    onToggleBeClick(customEventData: EventTouch) {
        const toggleNode = this.node.getChildByName("Toggle")
        this.toggleEventQueue.forEach(call => call(!toggleNode.getComponent(Toggle).isChecked))
    }
}


