import { _decorator, Component, find, Prefab, Label } from 'cc';
import { ElvesCreateData } from '../../common/game/elves/ElvesCreateData';
import { ElvesComponent } from '../../resources/prefab-resource/ElvesComponent';
import { ElvesEnum } from '../../common/game/elves/ElvesEnum';
import { getLevelFromRare } from '../../common/game/character/CharacterMateState';
import { getConfig, stockConfig } from '../../common/Config';
import { util } from '../../common/util/Util';
const { ccclass } = _decorator;

// Attack（出招设置）场景的精灵预览/切换/升级/销毁
// 说明：场景按钮原绑定 ElvesDetailCharacterComponent，但该组件依赖详情面板结构
// （Property/UpgradePanel/BackpackPanel/allElvesNode），本场景不存在，强挂必崩，故独立实现
@ccclass('AttackCharacterComponent')
export class AttackCharacterComponent extends Component {
    // 当前展示的精灵组件
    private currentElvesComponent: ElvesComponent = null
    // 当前精灵数据
    private currentData: ElvesCreateData = null
    // 当前下标
    private currentIndex = 0
    // 全部精灵（上阵 + 背包），与 ElvesAllCharacterComponent 同一数据源
    private elvesList: ElvesCreateData[] = []

    protected async start() {
        const config = getConfig()
        this.elvesList = [...config.userData.elvesQueue, ...config.userData.elves]
        if (this.elvesList.length) await this.showCurrent()
    }

    // 展示当前精灵（镜像 ElvesDetailCharacterComponent.initCharacter 的展示方式）
    private async showCurrent() {
        if (this.currentElvesComponent) {
            this.currentElvesComponent.node.destroy()
            this.currentElvesComponent = null
        }
        const data = this.currentData = this.elvesList[this.currentIndex]
        const prefab = await util.resource.loadResource("prefab-resource/Elves", Prefab)
        const node = await util.resource.createNodeByPrefab(prefab)
        node.getChildByName("State").active = false
        node.getChildByName("EnergeMaxEffect").active = false
        const comp = node.getComponent(ElvesComponent)
        await comp.initCharacter({ ...data, isBoss: true, direction: "left", characterScale: 1.3 }, null)
        node.setPosition(0, 0, 0)
        const elvesNode = this.node.getChildByName("ElvesNode")
        elvesNode.addChild(node)
        this.currentElvesComponent = comp
        // 名字与星级
        elvesNode.getChildByName("Name").getComponent(Label).string = comp.state.name.toString()
        elvesNode.getChildByName("Stars").children.forEach((s, i) =>
            s.getChildByName("teamupgrade_icon").active = i < (data.star || 1))
        // 待机（场景节点已激活，可直接播放）
        comp.playCharacterAnimation("standby_loop").then()
    }

    // 点击精灵：随机播放攻击动画
    public playAnimation() {
        this.currentElvesComponent?.playRandomAttackAnimation().then()
    }

    // 下一个
    public async theNext() {
        if (!this.elvesList.length) return
        this.currentIndex = (this.currentIndex + 1) % this.elvesList.length
        await this.showCurrent()
    }

    // 上一个
    public async theLast() {
        if (!this.elvesList.length) return
        this.currentIndex = (this.currentIndex - 1 + this.elvesList.length) % this.elvesList.length
        await this.showCurrent()
    }

    // 升级（沿用 ElvesDetailCharacterComponent 的金币/灵魂消耗公式；
    // 本场景没有升级面板/音效/特效节点，确认后直接升级）
    public async upgradeElves() {
        if (!this.currentData) return
        const rare = getLevelFromRare(ElvesEnum[this.currentData.id].rare)
        const lv = this.currentData.lv
        const gold = Math.ceil(lv * Math.max(lv / 50, 1) * (lv / (lv + 5) + 1) * rare * 100)
        const soul = Math.ceil(lv * Math.max(lv / 50, 1) * (lv / (lv + 15) + 1) * rare * 50)
        const result = await util.message.confirmData(find("Canvas"), {
            message: "升级会消耗" + util.normalData(gold) + "金币和" + util.normalData(soul) + "灵魂，确定要升级吗?",
        })
        if (!result) return
        const config = getConfig()
        if (config.userData.gold < gold || config.userData.soul < soul) {
            return await util.message.confirmData(find("Canvas"), { message: "金币或灵魂不足" })
        }
        config.userData.gold -= gold
        config.userData.soul -= soul
        ;[...config.userData.elvesQueue, ...config.userData.elves].forEach(c => {
            if (c.uuid === this.currentData.uuid) c.lv++
        })
        stockConfig()
        await this.showCurrent()
    }

    // 销毁（上链业务：需调合约销毁 NFT 并等扫链确认，合约方法/bizType 待接入，见 chain_biz 上链枚举）
    public async burnElevs() {
        if (!this.currentData) return
        await util.message.confirmData(find("Canvas"), {
            message: "销毁为链上业务，待合约接入后开放",
        })
    }
}
