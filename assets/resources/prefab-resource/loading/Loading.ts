import { _decorator, Component, Node, tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('NewComponent')
export class NewComponent extends Component {
    @property({type:Node, tooltip:'动画组件'})
    loadingAni:Node = null

    protected onLoad(): void {
        tween(this.loadingAni).by(2, {angle:-360}).repeatForever().start()
    }

    start() {

    }

    update(deltaTime: number) {
        
    }
}


