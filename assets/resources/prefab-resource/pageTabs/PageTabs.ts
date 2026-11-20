import { _decorator, Component, Node, LabelOutline, Sprite, Label, Color } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PageTabs')
export class PageTabs extends Component {
    @property({type: Node,tooltip: '当前选中页签'})

    public currentTab: Node = null;

    onLoad() {
        if(this.currentTab){
            this.currentTab.getComponent(Sprite).enabled = true;
            const labelNode = this.currentTab.getChildByName('Label');
            
           if(labelNode){

            const labelComp = labelNode.getComponent(Label); // 先拿到 Label 组件
            labelComp.color = new Color().fromHEX('#FFFFFF'); 

            const labelOutline = labelNode.getComponent(LabelOutline);
            if(labelOutline){
                labelOutline.enabled = true;
            }
           }
        }
    }

   
}

