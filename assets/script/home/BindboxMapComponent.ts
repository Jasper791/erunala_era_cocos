import { _decorator, Component, director, find, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BindboxMapComponent')
export class BindboxMapComponent extends Component {

    public closeBindBoxMap() {
        this.node.active = false
    }
}


