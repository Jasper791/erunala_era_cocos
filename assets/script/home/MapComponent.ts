import { _decorator, Asset, AssetManager, AudioClip, AudioSource, Component, director, EventTouch, find, Node, Prefab, resources } from 'cc';
import { util } from '../../common/util/Util';
import { getConfig } from '../../common/Config';
const { ccclass, property } = _decorator;

@ccclass('MapComponent')
export class MapComponent extends Component {

    protected async start() {
        const config = getConfig()
        // 初始化音乐
        this.initMusic().then()
        // 触摸事件开始
        this.node.on(Node.EventType.TOUCH_MOVE , this.onNodeTouchMove , this)
        this.node.on(Node.EventType.TOUCH_END , this.onNodeTouchEnd , this)
    }

    protected onDestroy(): void {
        // 触摸事件销毁
        this.node.off(Node.EventType.TOUCH_MOVE , this.onNodeTouchMove , this)
        this.node.off(Node.EventType.TOUCH_END , this.onNodeTouchEnd , this)
    }

    // 触摸移动场景
    private $lastPositionX = -1
    private onNodeTouchMove(event: EventTouch) {
        const currentPositionX = event.touch.getLocationX()
        if (this.$lastPositionX !== -1) {
            if (Math.abs(this.node.position.x + (currentPositionX - this.$lastPositionX) * 0.8) < 493)
                this.node.setPosition(
                    this.node.position.x + (currentPositionX - this.$lastPositionX) * 0.8 ,
                    this.node.position.y ,
                    this.node.position.z
                )
        }
        this.$lastPositionX = currentPositionX
        return
    }
    private onNodeTouchEnd() {
        this.$lastPositionX = -1
    }

    // 初始化播放音乐
    private async initMusic() {
        const config = getConfig()
        // 音乐们
        const musics = await util.resource.loadDirResource<AudioClip>("music-resource/home" , AudioClip)
        const music = musics[Math.floor(musics.length * Math.random())]
        const audioSource = this.node.getComponent(AudioSource)
        audioSource.clip = music
        audioSource.volume = config.volume * config.volumeDetail.home
        audioSource.play()
    }

    //Backpack Blindbox Challenge Chat Elves  Level   Wallet

    // 打开晶矿场
    public async OpenMiningMap() {
        await util.scene.go("Mining")
    }

    // 打开商店场景
    public async OpenMarketMap() {
        await util.scene.go("Market")
    }

    // 打开盲盒
    public async OpenBlindBoxMap() {
        const blindboxMap = this.node.parent.getChildByName("BlindboxMap")
        blindboxMap.active = true
    }

    // 打开竞技场
    public async OpenBattleMap() {
        const battleMap = this.node.parent.getChildByName("BattleMap")
        battleMap.active = true
    }
    
    // 打开融合
    public async OpenMergeMap() {
        const battleMap = this.node.parent.getChildByName("BattleMap")
        battleMap.active = true
    }

    // 打开繁殖
    public async OpenHatchMap() {
        await util.scene.go("Hatch")
    }

    // 打开强化
    public async OpenStrongMap() {
        await util.scene.go("Strong")
    }

    // 打开技能
    public async OpenSkillMap() {
        await util.scene.go("Skill")
    }

    // 打开出招设置
    public async OpenAttackMap() {
        await util.scene.go("Attack")
    }
}


