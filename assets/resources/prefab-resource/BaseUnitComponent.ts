import { _decorator, Animation, Asset, AudioClip, AudioSource, Component, dragonBones, error, Label, Node, resources, sp, Sprite, SpriteFrame } from 'cc';
import type { FightMapComponent } from '../../script/fight/FightComponent';
import { BottomAttackPosition, BottomPosition, TopAttackPosition, TopPosition } from '../../script/fight/FightPosition';
import { UnitState } from '../../common/game/UnitState';
import { UnitMateState } from '../../common/game/UnitMateState';
import { CampEnum, getCampHurtRate } from '../../common/game/UnitCampEnum';
import { EquipmentCreateData } from '../../common/game/equipment/EquipmentCreateData';
import { util } from '../../common/util/Util';
import { Option, showString } from '../../common/util/message/ShowData';
import { getConfig } from '../../common/Config';

export type UnitAnimationName = "rest"|"attack"|"dead"|"skill"|"hurt"|"relife"|"hit"|"run_loop"|"skill1"|"skill2"|"standby_loop"|"win_loop"

// 单位创建信息（角色/精灵通用）
export interface UnitCreateData {
    // 单位id
    id: string
    // 等级
    lv: number
    // uuid唯一实体id
    uuid?: number
    // 星级
    star?: number
    // 左侧还是右侧
    direction?: "left"|"right"
    // 纵坐标
    row?: number
    // 横坐标
    clo?: number
    // 是否是boss
    isBoss?: boolean
    // 装备们
    equipments?: EquipmentCreateData[]
    // 额外属性
    extra?: Partial<UnitState<any>>
    // 缩放
    characterScale?: number
}

// 战斗单位组件基类（角色/精灵通用）
export abstract class BaseUnitComponent extends Component {
    // 动画速度
    protected $animationTimeScale: number = 1
    // 战斗地图组件
    protected $fightMap: FightMapComponent
    // 当前位置
    protected $direction: "left"|"right"
    public get direction() { return this.$direction }
    // 当前坐标
    protected $coordinate: {row: number , clo: number}
    public get coordinate() { return this.$coordinate }
    // 当前状态
    protected $state: UnitState<any>
    public get state() { return this.$state }
    // 等待队列
    public awaitQueue: Promise<any>[] = []

    // 资源实际存在的动画名列表（initAnimation 时记录，用于随机攻击动画等按可用性过滤）
    protected $availableAnimations: string[] = []

    // 动画播完后的待机动作名（角色 rest / 精灵 standby_loop）
    protected restAnimation: UnitAnimationName = "rest"

    // 受伤动画名（精灵资源里是 hit，子类覆盖）
    protected hurtAnimation: UnitAnimationName = "hurt"
    // 死亡动画名（精灵资源没有 dead，防御逻辑会跳过播放直接隐藏节点）
    protected deadAnimation: UnitAnimationName = "dead"

    // 单位资源目录（character-resource / elves-resource）
    // TODO(资源编号临时方案): initAnimation 按 resourceDir + "/" + id 拼接资源路径，id 即
    // 001-006/001-003 的临时目录编号，后期随目录归类优化一并调整（见 CharacterEnum/ElvesEnum 的 TODO）
    protected abstract get resourceDir(): string
    // 按 id 取元数据
    protected abstract getMateData(id: string): UnitMateState<any>
    // 创建状态实例
    protected abstract createState(data: UnitCreateData): UnitState<any>
    // 自己种类的存活队列
    public abstract getOwnLiveQueue(fightMap: FightMapComponent): Set<any>
    // 自己种类的死亡队列
    protected abstract getOwnDeadQueue(fightMap: FightMapComponent): Set<any>

    // 初始化单位
    public async initCharacter(unitCreateData: UnitCreateData , fightMap: FightMapComponent) {
        unitCreateData.row = unitCreateData.row > 3 ? 3 : unitCreateData.row
        unitCreateData.row = unitCreateData.row < 1 ? 1 : unitCreateData.row
        unitCreateData.clo = unitCreateData.clo > 3 ? 3 : unitCreateData.clo
        unitCreateData.clo = unitCreateData.clo < 1 ? 1 : unitCreateData.clo
        unitCreateData.extra = unitCreateData.extra || {}
        // 元数据
        const unitMateData = this.getMateData(unitCreateData.id)
        // 防御：无元数据的单位id（旧缓存/未对齐的服务端编号）销毁节点并跳过创建，避免单个坏单位导致整个战斗场景崩溃
        if (!unitMateData) {
            error(`[BaseUnitComponent] 单位 id=${unitCreateData.id} 无对应元数据，跳过创建`)
            this.node.destroy()
            return false
        }
        // 设置fightmap
        this.$fightMap = fightMap
        // 设置坐标
        this.$coordinate = {
            row: unitCreateData.row ,
            clo: unitCreateData.clo
        }
        const stateNode = this.node.getChildByName("State")
        // 等级
        stateNode.getChildByName("Level").getComponent(Label).string =
            "Lv: " + unitCreateData.lv
        // 加载阵营图标
        await new Promise((res) => {
            resources.loadDir(
                "ui-resource/camp/" ,
                (err , dir) => {
                    res(null)
                    if (err) return error(err)
                    dir.forEach(v => {
                        let name = unitCreateData.extra.camp && unitCreateData.extra.camp.split(" ")[1]
                        name = name || unitMateData.camp.split(" ")[1]
                        if (name !== CampEnum.ORDINARY.split(" ")[1]) {
                            stateNode.getChildByName("Camp").setScale(0.8 , 0.8 , 1.0)
                        }
                        if (v.name === name && v instanceof SpriteFrame)
                            stateNode.getChildByName("Camp").getComponent(Sprite).spriteFrame = v
                    })
                }
            )
        })
        // 方位
        this.$direction = unitCreateData.direction
        // 缩放程度
        this.node.getChildByName("DrangoNode").setScale(
            (unitCreateData.characterScale || 1) * 0.3 * (this.$direction === "left" ? -1 : 1) * (unitMateData.animationDirection === "left" ? 1 : -1) * unitMateData.animationScale,
            (unitCreateData.characterScale || 1) * 0.3 * unitMateData.animationScale,
            (unitCreateData.characterScale || 1) * 0.3 * unitMateData.animationScale,
        )
        // boss标志
        if (unitCreateData.isBoss) {
            stateNode.getChildByName("IsBoss").active = true
            this.node.setScale(
                this.node.scale.x * 1.2 ,
                this.node.scale.y * 1.2 ,
                this.node.scale.z * 1.2 ,
            )
        }
        // 初始化状态
        this.$state = this.createState(unitCreateData)
        // 获取位置
        if (unitCreateData.row && unitCreateData.clo) {
            const positionTable = this.$direction === "left" ? BottomPosition : TopPosition
            const position = positionTable[unitCreateData.row - 1][unitCreateData.clo - 1]
            this.node.setPosition(
                position.x,
                position.y,
                this.node.position.z,
            )
        }
        // 初始化音乐
        await this.initMusic()

        // 初始化动画
        await this.initAnimation(unitCreateData)

        // 首次更新ui
        this.updateUi()
        return true
    }

    // 更新ui
    public updateUi(): void {
        // 设置状态条的信息
        const stateNode = this.node.getChildByName("State")
        // buff 框
        const buffIconNod = stateNode.getChildByName("BuffIcon")
        // buff显示设置 遍历所有属性并且设置增益或虚弱buff图标
        Object.keys(this.$state).forEach(async (k) => {
            if (typeof this.$state[k] !== "number") return
            const upIconNode = buffIconNod.getChildByName(k + "_up")
            const downIconNode = buffIconNod.getChildByName(k + "_down")
            if (!upIconNode || !downIconNode) return
            // 如果相等
            if (this.$state[k] === this.$state.ordinaryCharacterState[k]) {
                buffIconNod.getChildByName(k + "_up").active = false
                buffIconNod.getChildByName(k + "_down").active = false
                return
            }
            // 如果要大于原始数值的化
            if (this.$state[k] > this.$state.ordinaryCharacterState[k]) {
                buffIconNod.getChildByName(k + "_up").active = true
                buffIconNod.getChildByName(k + "_down").active = false
            } else {
                buffIconNod.getChildByName(k + "_up").active = false
                buffIconNod.getChildByName(k + "_down").active = true
            }
        })
        // 眩晕判断
        if (this.$state.otherState.isDizziness) buffIconNod.getChildByName("dizziness").active = true
        else buffIconNod.getChildByName("dizziness").active = false
        // 睡眠判断
        if (this.$state.otherState.isSleep) buffIconNod.getChildByName("sleep").active = true
        else buffIconNod.getChildByName("sleep").active = false
        // 恐惧判断
        if (this.$state.otherState.isFrighten) buffIconNod.getChildByName("frighten").active = true
        else buffIconNod.getChildByName("frighten").active = false
        // 烧伤判断
        if (this.$state.otherState.isBurn)  buffIconNod.getChildByName("burn").active = true
        else buffIconNod.getChildByName("burn").active = false
        // 中毒判断
        if (this.$state.otherState.isPoison)  buffIconNod.getChildByName("poison").active = true
        else buffIconNod.getChildByName("poison").active = false
        // 魅惑判断
        if (this.$state.otherState.isCharm)  buffIconNod.getChildByName("charm").active = true
        else buffIconNod.getChildByName("charm").active = false
        // 沉默判断
        if (this.$state.otherState.isSilent)  buffIconNod.getChildByName("silent").active = true
        else buffIconNod.getChildByName("silent").active = false
        // 生命和能量条节点
        const hpValueNode = stateNode.getChildByName("MaxHp").getChildByName("Value")
        const energyValueNode = stateNode.getChildByName("MaxEnerge").getChildByName("Value")
        // 数据合理化
        if (this.$state.hp < 0) {
            this.$state.hp = 0
            // 死亡
            this.dead()
        }
        if (this.$state.hp > this.$state.maxHp) this.$state.hp = this.$state.maxHp
        if (this.$state.energy < 0) this.$state.energy = 0
        if (this.$state.energy > this.$state.maxEnergy) this.$state.energy = this.$state.maxEnergy
        Object.keys(this.$state.otherState).forEach(k => {
            if (this.$state.otherState[k] < 0)
                this.$state.otherState[k] = 0
        })
        // 进度条展示
        hpValueNode.setScale(
            this.$state.hp / this.$state.maxHp , hpValueNode.scale.y , hpValueNode.scale.z
        )
        energyValueNode.setScale(
            this.$state.energy / this.$state.maxEnergy , energyValueNode.scale.y , energyValueNode.scale.z
        )
        // 满能量特效是否展示
        if (this.$state.energy >= this.$state.maxEnergy)
            this.node.getChildByName("EnergeMaxEffect").active = true
        else this.node.getChildByName("EnergeMaxEffect").active = false
    }

    // 根据传入的队列获取敌方队列
    public getEnemyQueue(queue: Set<any>): Set<any> {
        const newSet = new Set<any>()
        queue.forEach(c => { if (c.$direction !== this.$direction) newSet.add(c) })
        return newSet
    }

    // 根据传入的队列获取友军队列
    public getFriendQueue(queue: Set<any>): Set<any> {
        const newSet = new Set<any>()
        queue.forEach(c => { if (c.$direction === this.$direction) newSet.add(c) })
        return newSet
    }

    // 回合行动
    public async beginAction() {
        // 是否还有敌人
        if (this.getEnemyQueue(this.getOwnLiveQueue(this.$fightMap)).size <= 0 || this.state.hp <= 0) return
        // 眩晕不行动
        if (this.$state.otherState.isDizziness > 0) {
            if (this.$fightMap.playAnimation)
                showString(this.node, "眩晕，无法行动", {scaleX: 0.6, scaleY: 0.6})
            return
        }
        // 休眠不行动
        if (this.$state.otherState.isSleep > 0) {
            if (this.$fightMap.playAnimation)
                showString(this.node, "睡得正香，别打扰他哦", {scaleX: 0.6, scaleY: 0.6})
            return
        }
        // 恐惧有65%的概率不出手
        if ((this.$state.otherState.isFrighten > 0) && Math.random() < 0.65) {
            if (this.$fightMap.playAnimation)
                showString(this.node, "害怕", {scaleX: 0.6, scaleY: 0.6})
            return
        }

        // 设置层级最高
        const currentSiblingIndex = this.node.getSiblingIndex()
        this.node.setSiblingIndex(99999)
        // 是否释放技能
        if (
            this.$state.energy >= this.$state.maxEnergy &&
            ((this.state.otherState.isSilent <= 0))
        ) {
            if (this.$fightMap.playAnimation) {
                await this.$state.skillBehavior(this , this.$fightMap)
            }
            this.$state.energy = 0
            this.updateUi()
            await this.$state.skillSettleAccount(this , this.$fightMap)
        } else {
            if (this.$state.energy >= this.$state.maxEnergy)
                this.showString("沉默" , {r: 200 , g: 200 , b: 200})
            if (this.$fightMap.playAnimation) {
                await this.$state.attackBehavior(this , this.$fightMap)
            }
            this.$state.energy += 20
            await this.$state.attackSettleAccount(this , this.$fightMap)
            this.updateUi()
        }
        // 还原层级
        this.node.setSiblingIndex(currentSiblingIndex)
        // 更新自己的ui
        this.updateUi()
        // 400毫秒缓冲
        if (this.$fightMap.playAnimation) await new Promise(res => setTimeout(res, 400 / this.$animationTimeScale))
        // 调用结束函数
        await this.state.afterAction(this , this.$fightMap)
    }

    // 播放单位动画函数
    public async playCharacterAnimation(
        name: UnitAnimationName ,
        times?: number ,
        awaitAnimation: boolean = true ,
        complete: any = null
    ) {
        if (this.$fightMap && !this.$fightMap.playAnimation) return
        // 资源缺少该动画时直接跳过（先执行完成回调），避免 complete 永不触发导致回合流程卡死
        if (this.$availableAnimations.length && !this.$availableAnimations.includes(name)) {
            complete && complete()
            return true
        }
        let track: sp.spine.TrackEntry
        let animationControl: dragonBones.ArmatureDisplay|sp.Skeleton
        if (this.$state.mateData.animationType === "DragonBones") {
            animationControl =
                this.node.getChildByName("DrangoNode").getComponent(dragonBones.ArmatureDisplay);
            animationControl.playAnimation(name , times)
        } else if (this.$state.mateData.animationType === "Spine") {
            animationControl =
                this.node.getChildByName("DrangoNode").getComponent(sp.Skeleton);
            track = animationControl.setAnimation(0 , name , false)
        }

        return new Promise(res => {
            if (!awaitAnimation) res(true)
            if (animationControl instanceof dragonBones.ArmatureDisplay) {
                animationControl.once(dragonBones.EventObject.COMPLETE , () => {
                    if (animationControl instanceof dragonBones.ArmatureDisplay)
                        animationControl.playAnimation("rest" , -1)
                    complete && complete()
                    res(true)
                } , this)
            } else if (animationControl instanceof sp.Skeleton) {
                animationControl.setCompleteListener((trackEntry: sp.spine.TrackEntry) => {
                    let spineAnimationName: any = trackEntry.animation.name ? trackEntry.animation.name : "";
                    if(name === spineAnimationName && animationControl instanceof sp.Skeleton) {
                        animationControl.setAnimation(0 , this.restAnimation , true)
                        complete && complete();
                        res(1)
                    }
                    return
                })
            }
            return
        })
    }

    // 设置动画速度
    public setAnimationTimeScale(scale: number) {
        this.$animationTimeScale = scale
        // 动画获取
        let animationControl: dragonBones.ArmatureDisplay|sp.Skeleton
        if (this.$state.mateData.animationType === "DragonBones") {
            animationControl =
                this.node.getChildByName("DrangoNode").getComponent(dragonBones.ArmatureDisplay);
        } else if (this.$state.mateData.animationType === "Spine") {
            animationControl =
                this.node.getChildByName("DrangoNode").getComponent(sp.Skeleton);
        }
        animationControl.timeScale = this.$animationTimeScale
        // 音乐速度
        this.node.getComponent(AudioSource)
    }

    // 被伤害
    public async beHurt(
        target: BaseUnitComponent|null ,
        hurt: number ,
        extra?: Partial<UnitState<any>>
    ): Promise<number> {
        // 伤害浮动
        hurt += hurt * (Math.random() < 0.5 ? 1 : -1) * (Math.random() * 0.07)
        // 魅惑以后伤害降低20%
        hurt *= (target.$state.otherState.isCharm > 0 ? 0.8 : 1)
        // 睡眠醒来
        this.$state.otherState.isSleep = 0
        // 获取临时护甲和格挡率
        let block = this.$state.block
        let defence = this.$state.defence
        // 穿甲生效
        if (target)
            defence -= defence * (target.$state.pierce / (target.$state.pierce + 1000))
        // 格挡生效 否则播放受伤动画
        if (Math.random() * 200 < block) {
            defence *= 1.8
            // 播放格挡动画
            if (this.$fightMap.playAnimation) {
                const blockEffect = this.node.getChildByName("BlockEffect")
                const blockEffectAnimation = blockEffect.getComponent(Animation)
                blockEffect.active = true
                blockEffectAnimation.play("blockEffect")
                blockEffectAnimation.getState(blockEffectAnimation.clips[0].name)
                    .speed = this.$animationTimeScale
                blockEffectAnimation
                    .once(Animation.EventType.STOP , () => blockEffect.active = false)
            }
        } else if (this.$fightMap.playAnimation)
            await this.playCharacterAnimation(this.hurtAnimation , 1 , false)
        // 阵营生效
        let campAdd = 1
        if (target) {
            campAdd = getCampHurtRate(this , target)
            hurt *= campAdd
        }
        // 伤害计算
        let injury = Math.ceil((-hurt * (defence / (defence + 250)) + hurt))
        this.$state.hp -= injury
        // 播放文字
        if (this.$fightMap.playAnimation) {
            this.showString(
                (campAdd > 1 ? "克制" : (campAdd < 1 ? "微弱" : "")) + "-" + injury ,
                {r: 240 , g: 15 , b: 15 , fontSize: 28 , speed: this.$animationTimeScale}
            )
        }

        // 额外加成
        this.extra(extra)

        this.updateUi()

        // 返回伤害值
        return injury
    }

    // 被治疗
    public async beCure(
        target: BaseUnitComponent ,
        cure: number ,
        extra?: Partial<UnitState<any>>
    ): Promise<number> {
        // 治疗浮动
        cure += cure * (Math.random() < 0.5 ? 1 : -1) * (Math.random() * 0.04)
        // 临时治疗效率
        const curePercent = this.$state.curePercent * target.$state.curePercent
        cure = Math.ceil(curePercent * cure)

        this.$state.hp += cure

        // 播放文字 和治疗动画
        if (this.$fightMap.playAnimation) {
            const cureEffect = this.node.getChildByName("CureEffect")
            const cureEffectAnimation = cureEffect.getComponent(sp.Skeleton)
            cureEffect.active = true
            cureEffectAnimation.timeScale = this.$animationTimeScale
            cureEffectAnimation.setAnimation(0 , "animation" , true)
            cureEffectAnimation.setCompleteListener((trackEntry: sp.spine.TrackEntry) => {
                let spineAnimationName: any = trackEntry.animation.name ? trackEntry.animation.name : "";
                if("animation" === spineAnimationName) cureEffect.active = false
                return
            })
            this.showString(
                (curePercent > 1 ? "高效" : (curePercent < 1 ? "低效" : "")) + "+" + cure ,
                {r: 15 , g: 240 , b: 15 , fontSize: 28 , speed: this.$animationTimeScale}
            )
        }

        // 额外加成
        this.extra(extra)

        this.updateUi()

        return cure
    }

    // 被眩晕
    public async beDizziness(
        target: BaseUnitComponent ,
        round: number ,
        extra?: Partial<UnitState<any>> ,
        complete?: any
    ) {
        if (await this.state.onDeBuff(this , "isDizziness" , this.$fightMap)) {
            if (await this.state.onDizziness(target , this.$fightMap)) {
                this.$state.otherState.isDizziness++
                await this.$fightMap.listenRoundEvent(round , () => {
                    this.$state.otherState.isDizziness--
                    complete && complete()
                })
            }
        }

        this.extra(extra)

        this.updateUi()
    }

    // 被休眠
    public async beSleep(
        target: BaseUnitComponent ,
        round: number ,
        extra?: Partial<UnitState<any>> ,
        complete?: any
    ) {
        if (await this.state.onDeBuff(this , "isSleep" , this.$fightMap)) {
            if (await this.state.onSleep(target , this.$fightMap)) {
                this.$state.otherState.isSleep++
                await this.$fightMap.listenRoundEvent(round , () => {
                    this.$state.otherState.isSleep--
                    complete && complete()
                })
            }
        }

        this.extra(extra)

        this.updateUi()
    }

    // 被恐惧
    public async beFrighten(
        target: BaseUnitComponent ,
        round: number ,
        extra?: Partial<UnitState<any>> ,
        complete?: any
    ) {
        if (await this.state.onDeBuff(this , "isSleep" , this.$fightMap)) {
            this.$state.otherState.isFrighten++
            await this.$fightMap.listenRoundEvent(round , () => {
                this.$state.otherState.isFrighten--
                complete && complete()
            })
        }

        this.extra(extra)

        this.updateUi()
    }

    // 被烧伤
    public async beBurn(
        target: BaseUnitComponent ,
        round: number ,
        extra?: Partial<UnitState<any>> ,
        complete?: any
    ) {
        if (await this.state.onDeBuff(this , "isBurn" , this.$fightMap)) {
            this.$state.otherState.isBurn++
            await this.$fightMap.listenRoundEvent(round , () => {
                this.$state.otherState.isBurn--
                complete && complete()
            })
        }

        this.extra(extra)

        this.updateUi()
    }

    // 被中毒
    public async bePoison(
        target: BaseUnitComponent ,
        round: number ,
        extra?: Partial<UnitState<any>> ,
        complete?: any
    ) {
        if (await this.state.onDeBuff(this , "isPoison" , this.$fightMap)) {
            this.$state.otherState.isPoison++
            await this.$fightMap.listenRoundEvent(round , () => {
                this.$state.otherState.isPoison--
                complete && complete()
            })
        }

        this.extra(extra)

        this.updateUi()
    }

    // 被魅惑
    public async beCharm(
        target: BaseUnitComponent ,
        round: number ,
        extra?: Partial<UnitState<any>> ,
        complete?: any
    ) {
        if (await this.state.onDeBuff(this , "isCharm" , this.$fightMap)) {
            this.$state.otherState.isCharm++
            await this.$fightMap.listenRoundEvent(round , () => {
                this.$state.otherState.isCharm--
                complete && complete()
            })
        }

        this.extra(extra)

        this.updateUi()
    }

    // 被沉默
    public async beSilent(
        target: BaseUnitComponent ,
        round: number ,
        extra?: Partial<UnitState<any>> ,
        complete?: any
    ) {
        if (await this.state.onDeBuff(this , "isSilent" , this.$fightMap)) {
            this.$state.otherState.isSilent++
            await this.$fightMap.listenRoundEvent(round , () => {
                this.$state.otherState.isSilent--
                complete && complete()
            })
        }

        this.extra(extra)

        this.updateUi()
    }

    // 获取额外属性
    public extra(extra: Partial<UnitState<any>> = {}) {
        // 播放动画
        const playAnimation = (name: string) => {
            const buffEffectNode = this.node.getChildByName("BuffEffect")
            buffEffectNode.active = true
            const buffEffectAnimation = buffEffectNode.getComponent(sp.Skeleton)
            buffEffectAnimation.setAnimation(0 , name , false)
            buffEffectAnimation.setCompleteListener((trackEntry: sp.spine.TrackEntry) => {
                let spineAnimationName: any = trackEntry.animation.name ? trackEntry.animation.name : "";
                if(name !== spineAnimationName) return
                buffEffectNode.active = false
            })
        }
        // 额外加成
        Object.keys(extra).forEach(k => {
            if (typeof extra[k] === 'number')
                this.$state[k] += extra[k]
            if (k === "attack" && extra[k] > 0 && this.$fightMap.playAnimation)
                playAnimation("attack_up_effect")
            else if (k === "defence" && extra[k] > 0  && this.$fightMap.playAnimation)
                playAnimation("defence_up_effect")
            else if (k === "curePercent" && extra[k] > 0  && this.$fightMap.playAnimation)
                playAnimation("curePercent_up_effect")
            else if (k === "speed" && extra[k] > 0  && this.$fightMap.playAnimation)
                playAnimation("speed_up_effect")
        })
        // 更新ui
        this.updateUi()
    }

    // 死亡函数
    protected dead() {
        if (!this.getOwnLiveQueue(this.$fightMap).has(this)) return
        if (this.$direction === 'left') this.$fightMap.leftQueuePopulation--
        else this.$fightMap.rightQueuePopulation--
        this.getOwnDeadQueue(this.$fightMap).add(this)
        this.getOwnLiveQueue(this.$fightMap).delete(this)
        this.$fightMap.currentActiveCharacter.awaitQueue.push(
            this.playCharacterAnimation(this.deadAnimation , 1 , true , async () => {
                this.node.active = false
                await this.state.onDead(this , null , this.$fightMap)
            })
        )
        return;
    }

    // 复活函数
    public async relife(target: BaseUnitComponent , cure: number = 1) {
        this.node.active = true
        if (this.$direction === 'left') this.$fightMap.leftQueuePopulation++
        else this.$fightMap.rightQueuePopulation++
        this.getOwnLiveQueue(this.$fightMap).add(this)
        this.getOwnDeadQueue(this.$fightMap).delete(this)

        // 播放复合动画
        if (this.$fightMap.playAnimation) {
            this.showString("重生" , {r: 240 , g: 20 , b: 20})
            await this.playCharacterAnimation("relife", 1, true)
        }

        await this.beCure(target , cure)

        this.updateUi()
    }

    public async moveCharacterToEnemyCoordinate(row: number , clo: number , toWard: "friend"|"enemy" = "enemy", node: Node = this.node): Promise<Function> {
        const ownPosTable = this.$direction === "left" ? BottomPosition : TopPosition
        const attackPosTable = this.$direction === "left" ? BottomAttackPosition : TopAttackPosition
        const returnSelfCoordinate = async () => {
            return new Promise((res) => {
                const pos = {...ownPosTable[this.$coordinate.row - 1][this.$coordinate.clo - 1]}
                const steps = 20
                let step = 0
                const startX = node.position.x
                const startY = node.position.y
                const stepX = (pos.x - startX) / steps
                const stepY = (pos.y - startY) / steps
                const inter = setInterval(() => {
                    step++
                    if (step >= steps) {
                        clearInterval(inter)
                        node.setPosition(pos.x, pos.y, node.position.z)
                        return res(returnSelfCoordinate)
                    }
                    node.setPosition(
                        startX + stepX * step,
                        startY + stepY * step,
                        node.position.z
                    )
                } , 15 / this.$animationTimeScale)
            })
        }
        return new Promise((res) => {
            row = Math.max(1, Math.min(3, row))
            clo = Math.max(1, Math.min(3, clo))
            const pos = {...attackPosTable[row - 1][clo - 1]}
            const steps = 20
            let step = 0
            const startX = node.position.x
            const startY = node.position.y
            const stepX = (pos.x - startX) / steps
            const stepY = (pos.y - startY) / steps
            const inter = setInterval(() => {
                step++
                if (step >= steps) {
                    clearInterval(inter)
                    node.setPosition(pos.x, pos.y, node.position.z)
                    return res(returnSelfCoordinate)
                }
                node.setPosition(
                    startX + stepX * step,
                    startY + stepY * step,
                    node.position.z
                )
            } , 15 / this.$animationTimeScale)
        })
    }

    // 显示一排字
    public showString(msg: string , option: Option) {
        util.message.showUpMessage(this.node , msg , {
            ...option ,
            speed: this.$animationTimeScale
        })
    }

    // 初始化动画
    private async initAnimation(unitCreateData: UnitCreateData) {
        // 获取文件夹资源
        const resource =
            await util.resource.loadDirResource(this.resourceDir + "/" + unitCreateData.id , Asset)
        const animationType = this.getMateData(unitCreateData.id).animationType
        // 如果是龙骨动画
        if (animationType === "DragonBones") {
            const armatureDisplay =
                this.node.getChildByName("DrangoNode").addComponent(dragonBones.ArmatureDisplay)
            resource.forEach(asset => {
                if (asset instanceof dragonBones.DragonBonesAsset)
                    armatureDisplay.dragonAsset = asset
                else if (asset instanceof dragonBones.DragonBonesAtlasAsset)
                    armatureDisplay.dragonAtlasAsset = asset
            })
            armatureDisplay.armatureName = JSON.parse(armatureDisplay.dragonAsset?.dragonBonesJson!).armature[0].name;
            // 记录龙骨资源实际存在的动画名
            this.$availableAnimations =
                (JSON.parse(armatureDisplay.dragonAsset?.dragonBonesJson!).armature[0].animation || [])
                    .map((a: any) => a?.name).filter(Boolean)
            this.playCharacterAnimation("rest")
        }
        // 如果是Spine
        else if (animationType === "Spine") {
            const skeleton = this.node.getChildByName("DrangoNode").addComponent(sp.Skeleton)
            resource.forEach(asset => {
                if (asset instanceof sp.SkeletonData)
                    skeleton.skeletonData = asset
            })
            // 记录 spine 资源实际存在的动画名
            this.$availableAnimations =
                ((skeleton.skeletonData?.getRuntimeData() as any)?.animations || [])
                    .map((a: any) => a?.name).filter(Boolean)
            this.playCharacterAnimation(this.restAnimation)
        }
        return this.updateUi()
    }

    // 随机攻击动画：从资源实际存在的攻击类动画中随机选取（精灵资源带 skill2 时会随机出现 skill2）
    public async playRandomAttackAnimation(): Promise<void> {
        const candidates: UnitAnimationName[] = ["attack", "skill2", "skill1", "skill"]
        const available = candidates.filter(n => this.$availableAnimations.includes(n))
        const name = available.length
            ? available[Math.floor(Math.random() * available.length)]
            : "attack"
        await this.playCharacterAnimation(name, 1)
    }

    // 播放技能音乐 占位函数 无需实现
    public playSkillMusic() {}
    // 播放攻击音乐 占位函数 无需实现
    public playAttackMusic() {}

    // 初始化音乐
    private async initMusic() {
        const config = getConfig()
        const self = this
        const audioSource = self.getComponent(AudioSource)
        const promiseQueue: Promise<any>[] = []
        promiseQueue.push(new Promise(res => {
            resources.load(this.resourceDir + "/" + this.state.id + "/music/skill" , AudioClip , (err , clip) => {
                if (err) res(err)
                self.playSkillMusic = function() {
                    if(!clip) return
                    audioSource.clip = clip
                    audioSource.volume = config.volume * config.volumeDetail.character
                    audioSource.play()
                }
                res(null)
            })
        }))
        promiseQueue.push(new Promise(res => {
            resources.load(this.resourceDir + "/" + this.state.id + "/music/attack" , AudioClip , (err , clip) => {
                if (err) res(err)
                self.playAttackMusic = function() {
                    if(!clip) return
                    audioSource.clip = clip
                    audioSource.volume = config.volume * config.volumeDetail.character
                    audioSource.play()
                }
                res(null)
            })
        }))
        return Promise.all(promiseQueue)
    }

}