import { _decorator, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

const MessageEnum = [
    "小提示\n不同阵营之间存在克制关系\n好好运用它会有奇效哦" ,
    "小提示\n神圣系对深渊系会造成额外20%的伤害" ,
    "小提示\n机械系对自然系会造成额外20%的伤害" ,
    "小提示\n暗夜系对神圣系会造成额外20%的伤害" ,
    "小提示\n单挑情况下，刺客要比法师强悍的多\n但是有队友的话，情况就不一样了"
]

@ccclass('LoadSceneComponent')
export class LoadSceneComponent extends Component {
    @property(Node)
    private progressValueNode: Node
    @property(Node)
    private MessageValueNode: Node

    // 进度条
    private progress = 0

    // 等待事件
    private awaitQueue: any[] = []

    // 设置进度条 num 0 - 1
    public setProgress(num: number) {
        this.progress = num
    }

    // 等待加载完成
    public async awaitProgressEnd() {
        if (this.hasComplete) return
        return new Promise(res => this.awaitQueue.push(res))
    }

    private hasComplete = false

    private lastTime = 5

    protected update(dt: number): void {
        if (this.hasComplete) return
        // 改变提示消息
        if (this.lastTime >= 5) {
            this.lastTime = 0
            this.MessageValueNode.getComponent(Label).string =
                MessageEnum[Math.floor(MessageEnum.length * Math.random())]
        }
        this.lastTime += dt

        const valueNode = this.progressValueNode
        if (valueNode.scale.x < (this.progress / 100)) {
            return valueNode.setScale(
                valueNode.scale.x + ((this.progress > valueNode.scale.x) ? 1 : -1) * 0.01 ,
                valueNode.scale.y ,
                valueNode.scale.z
            )
        }
        if (valueNode.scale.x >= 1) {
            this.hasComplete = true
            this.awaitQueue.forEach(res => res())
            if (this.node.isValid) this.node.active = false
        }
    }

}


