import { _decorator, Component, Node , Animation} from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BlockEffectComponent')
export class BlockEffectComponent extends Component {

    private animation: Animation

    protected onEnable(): void {
        this.animation = this.getComponent(Animation)
        this.animation.play("blockEffect")
    }

    public async showBlockEffect() {
        this.node.active = true
        return new Promise(res => this.animation.once(Animation.EventType.STOP , () => {
            this.node.active = false
            res(1)
        }))
    }
}


