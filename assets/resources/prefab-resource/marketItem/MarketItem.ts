import { _decorator, Component, Label, Node, Sprite } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('MarketItem')
export class MarketItem extends Component {
    @property({type:Label, tooltip:'商品名称'})
    public itemName:Label = null

    @property({type:Sprite, tooltip:'商品图片'})
    public itemIcon:Sprite = null

    @property({type:Sprite, tooltip:'币种图标'})
    public icon:Sprite = null

    @property({type:Label, tooltip:'商品价格'})
    public price:Label = null

    @property({type:Label, tooltip:'数量'})
    public num:Label = null

    start() {

    }

    render() {
        
    }

    update(deltaTime: number) {
        
    }
}


