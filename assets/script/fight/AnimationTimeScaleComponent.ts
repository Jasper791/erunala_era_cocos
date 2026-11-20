import { _decorator, Component, dragonBones, Label, Node, sp} from 'cc';
import { FightMapComponent } from './FightComponent';
const { ccclass, property } = _decorator;

@ccclass('AnimationTimeScaleComponent')
export class AnimationTimeScaleComponent extends Component {
    @property(Node)
    public fightMapNode: Node
    @property(Node)
    public scaleNode: Node
    // 动画播放速度
    public animationTimeScale: number = 1

    // 改变动画速度
    public changeAniamtionTimeScale() {
        if (this.animationTimeScale < 3) this.animationTimeScale++
        else this.animationTimeScale = 1
        // 获取所有动画
        this.fightMapNode.getComponent(FightMapComponent)
            .allCharacterQueue
            .forEach(characterComponent => characterComponent.setAnimationTimeScale(this.animationTimeScale))
        this.scaleNode.getComponent(Label).string = "x" + this.animationTimeScale
    }
}
