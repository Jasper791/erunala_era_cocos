import { _decorator, AudioClip, AudioSource, Component, dragonBones, error, find, Label, log, Node, Prefab, resources, Sprite, SpriteFrame } from 'cc';
import { CharacterCreateData } from '../../common/game/character/CharacterCreateData';
import { ElvesCreateData } from '../../common/game/elves/ElvesCreateData';
import { CharacterComponent } from '../../resources/prefab-resource/CharacterComponent';
import { ElvesComponent } from '../../resources/prefab-resource/ElvesComponent';
import { BaseUnitComponent } from '../../resources/prefab-resource/BaseUnitComponent';
import { LoadSceneComponent } from '../../resources/prefab-resource/LoadSceneComponent';
import {util} from "../../common/util/Util";
import { getConfig } from '../../common/Config';
import { common } from '../../common/Common';
import { confirmData } from '../../common/util/message/ConfirmData';
export { LeftPosition, LeftAttackPosition } from './FightPosition';
const { ccclass, property } = _decorator;

@ccclass('FightMapComponent')
export class FightMapComponent extends Component {
    public playAnimation: boolean = true

    private $currentRound = 0
    public get currentRound() { return this.$currentRound }

    private $currentActiveCharacter: { awaitQueue: Promise<any>[] }|null = null
    public get currentActiveCharacter(): { awaitQueue: Promise<any>[] }|null {
        return this.$currentActiveCharacter
    }

    public leftQueuePopulation = 0
    public rightQueuePopulation = 0

    private $allCharacterQueue: Set<CharacterComponent> = new Set
    public get allCharacterQueue() { return this.$allCharacterQueue }
    private $allLiveCharacterQueue: Set<CharacterComponent> = new Set
    public get allLiveCharacterQueue() { return this.$allLiveCharacterQueue }
    private $allDeadCharacterQueue: Set<CharacterComponent> = new Set
    public get allDeadCharacterQueue() { return this.$allDeadCharacterQueue }

    private $allElvesQueue: Set<ElvesComponent> = new Set
    public get allElvesQueue() { return this.$allElvesQueue }
    private $allLiveElvesQueue: Set<ElvesComponent> = new Set
    public get allLiveElvesQueue() { return this.$allLiveElvesQueue }
    private $allDeadElvesQueue: Set<ElvesComponent> = new Set
    public get allDeadElvesQueue() { return this.$allDeadElvesQueue }

    @property(Node)
    private progressNode: Node

    protected async onLoad() {
        const loadSceneComponent = this.progressNode.getComponent(LoadSceneComponent)
        this.progressNode.active = true
        let progress = 10
        loadSceneComponent.setProgress(progress)
        await this.createCharacterToMap([
            ...common.leftCharacterQueue , ...common.rightCharacterQueue
        ] , () => {
            loadSceneComponent.setProgress(progress + 10)
        })
        progress = 40
        loadSceneComponent.setProgress(progress)
        await this.createElvesToMap([
            ...common.leftElvesQueue , ...common.rightElvesQueue
        ] , () => {
            loadSceneComponent.setProgress(progress + 15)
        })
        loadSceneComponent.setProgress(80)
        await this.setFightScene()
        loadSceneComponent.setProgress(100)
        await loadSceneComponent.awaitProgressEnd()
        if (await this.nextRound()) this.fightSuccess()
        else this.fightFailure()
    }

    public async nextRound(): Promise<boolean> {
        const allLive = this.getAllLiveUnits()
        for (let i = 0; i < allLive.length; i++) {
            if (this.isUnitAlive(allLive[i]))
                await allLive[i].state.onFightBegin(allLive[i] , this)
        }
        while(1) {
            this.$currentRound++
            const allLive = this.getAllLiveUnits().sort((a , b) => b.state.speed - a.state.speed)
            find("Canvas/RoundNode").getComponent(Label).string = "回合: " + this.$currentRound
            if (this.leftQueuePopulation <= 0) return false
            else if (this.rightQueuePopulation <= 0) return true
            else if (this.$currentRound >= 150) return false
            if (this.playAnimation) await new Promise(res => setTimeout(res, 600))
            const roundEventQueue = this.$roundEventMap.get(this.$currentRound)
            if (roundEventQueue) {
                for (let i = 0; i < roundEventQueue.length; i++)
                    await roundEventQueue[i](this)
            }
            for (let i = 0; i < allLive.length; i++) {
                await allLive[i].state.onRoundBegin(allLive[i] , this)
                if (this.isUnitAlive(allLive[i])) {
                    if (allLive[i].state.otherState && allLive[i].state.otherState.isBurn > 0) {
                        allLive[i].state.hp -= allLive[i].state.hp * (Math.random() * 0.03 + 0.05)
                        if (this.playAnimation) {
                            setTimeout(() => {
                                allLive[i].showString(
                                    "烧伤-" + Math.ceil(allLive[i].state.hp * 0.05) ,
                                    {scaleX: 0.6, scaleY: 0.6, r: 240 , g: 10, b: 10}
                                )
                            } , 100)
                        }
                    }
                    allLive[i].updateUi()
                }
                if (this.isUnitAlive(allLive[i])) {
                    if (allLive[i].state.otherState && allLive[i].state.otherState.isPoison > 0) {
                        allLive[i].state.hp -= allLive[i].state.hp * (Math.random() * 0.05 + 0.03)
                        if (this.playAnimation) {
                            setTimeout(() => {
                                allLive[i].showString(
                                    "中毒-" + Math.ceil(allLive[i].state.hp * 0.05) ,
                                    {scaleX: 0.6, scaleY: 0.6, r: 240 , g: 10, b: 10}
                                )
                            } , 150)
                        }
                    }
                    allLive[i].updateUi()
                }
            }
            for (let i = 0; i < allLive.length; i++) {
                if (this.isUnitAlive(allLive[i])) {
                    this.$currentActiveCharacter = allLive[i] as any
                    await allLive[i].beginAction()
                    await Promise.all(allLive[i].awaitQueue)
                    allLive[i].awaitQueue = []
                    this.$currentActiveCharacter = null
                }
                if (this.leftQueuePopulation <= 0) return false
                else if (this.rightQueuePopulation <= 0) return true
                else if (this.$currentRound >= 150) return false
                if (this.playAnimation) await new Promise(res => setTimeout(res, 350))
            }
            for (let i = 0; i < allLive.length; i++) {
                if (this.isUnitAlive(allLive[i]))
                    await allLive[i].state.onRoundEnd(allLive[i] , this)
            }
        }
    }

    private getAllLiveUnits(): BaseUnitComponent[] {
        const chars: BaseUnitComponent[] = [...this.$allLiveCharacterQueue] as any
        const elves: BaseUnitComponent[] = [...this.$allLiveElvesQueue] as any
        return [...chars, ...elves]
    }

    private isUnitAlive(unit: BaseUnitComponent): boolean {
        if (unit instanceof CharacterComponent) return this.$allLiveCharacterQueue.has(unit)
        if (unit instanceof ElvesComponent) return this.$allLiveElvesQueue.has(unit)
        return false
    }

    public async createCharacterToMap(queue: CharacterCreateData[] , ever?: any): Promise<boolean> {
        queue = queue.sort((a , b) => a.row - b.row)
        const prefab =
            await util.resource.loadResource<Prefab>("prefab-resource/Character" , Prefab)
        return new Promise((res) => {
            const promiseQueue: Promise<any>[] = []
            queue.forEach((ccd) => {
                const promise = new Promise(async (res) => {
                    prefab.createNode(async (err , node) => {
                        if (err) return error(err)
                        this.node.addChild(node)
                        const characterComponent = node.getComponent(CharacterComponent)
                        const ok = await characterComponent.initCharacter(ccd , this)
                        if (!ok) return res(0)
                        if (characterComponent.direction === "left") this.leftQueuePopulation++
                        else this.rightQueuePopulation++
                        this.$allCharacterQueue.add(characterComponent)
                        this.$allLiveCharacterQueue.add(characterComponent)
                        ever && ever()
                        res(1)
                    })
                })
                promiseQueue.push(promise)
            })
            Promise
                .all(promiseQueue)
                .then(() => res(true))
                .catch((err) => {
                    error(err)
                    res(false)
                })
        })
    }

    public async createElvesToMap(queue: ElvesCreateData[] , ever?: any): Promise<boolean> {
        const prefab =
            await util.resource.loadResource<Prefab>("prefab-resource/Elves" , Prefab)
        return new Promise((res) => {
            const promiseQueue: Promise<any>[] = []
            queue.forEach((ecd) => {
                const promise = new Promise(async (res) => {
                    prefab.createNode(async (err , node) => {
                        if (err) return error(err)
                        this.node.addChild(node)
                        const elvesComponent = node.getComponent(ElvesComponent)
                        const ok = await elvesComponent.initCharacter(ecd as any , this)
                        if (!ok) return res(0)
                        if (elvesComponent.direction === "left") this.leftQueuePopulation++
                        else this.rightQueuePopulation++
                        this.$allElvesQueue.add(elvesComponent)
                        this.$allLiveElvesQueue.add(elvesComponent)
                        ever && ever()
                        res(1)
                    })
                })
                promiseQueue.push(promise)
            })
            Promise
                .all(promiseQueue)
                .then(() => res(true))
                .catch((err) => {
                    error(err)
                    res(false)
                })
        })
    }

    private $roundEventMap = new Map<number , ((fightMap: FightMapComponent) => any)[]>()

    public listenRoundEvent(round: number , callback: (fightMap: FightMapComponent) => void) {
        const eventQueue = this.$roundEventMap.get(round + 1 + this.$currentRound)
        if (eventQueue) return eventQueue.push(callback)
        this.$roundEventMap.set(round + 1 + this.$currentRound , [callback])
    }

    public async skipFight() {
        const result = await confirmData(this.node.parent , { message: "确定要跳过战斗吗" })
        if(!result) return
        this.playAnimation = false
        this.node.parent.getChildByName("SkipButton").active = false
    }

    private async setFightScene() {
        const config = getConfig()
        const promiseQueue: Promise<any>[] = []
        promiseQueue.push(new Promise(res => {
            resources.loadDir("fight-resource"  , SpriteFrame , (err , s) => {
                if (err) return error(err)
                this.node.getComponent(Sprite).spriteFrame =
                    s[Math.floor(Math.random() * s.length)]
                res(1)
            })
        }))
        promiseQueue.push(new Promise(res => {
            resources.loadDir("music-resource/fight/bg_music" , AudioClip , (err , s) => {
                if (err) return error(err)
                const audioSource = this.node.getComponent(AudioSource)
                audioSource.clip = s[Math.floor(Math.random() * s.length)]
                audioSource.volume = config.volume * config.volumeDetail.fight
                audioSource.play()
                res(1)
            })
        }))
        return Promise.all(promiseQueue)
    }

    private fightSuccess() {
        this.node.parent.getChildByName("SuccessEnd").active = true
    }

    private fightFailure() {
        this.node.parent.getChildByName("FailureEnd").active = true
    }
}