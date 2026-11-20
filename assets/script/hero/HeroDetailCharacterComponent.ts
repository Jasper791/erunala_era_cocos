import {Sprite , SpriteFrame , _decorator, Component, find, Node, NodeEventType , sp, Prefab , Animation , Label,AudioSource} from 'cc';
import {CharacterCreateData} from "../../common/game/character/CharacterCreateData";
import {util} from "../../common/util/Util";
import {CharacterComponent} from "../../resources/prefab-resource/CharacterComponent";
import {CharacterEnum} from "../../common/game/character/CharacterEnum";
import {getLevelFromRare} from "../../common/game/character/CharacterMateState";
import {getConfig, stockConfig} from "../../common/Config";
import {UserResourceUiComponent} from "../../resources/prefab-resource/UserResourceUiComponent";
import { HeroAllCharacterComponent } from './HeroAllCharacterComponent';

const { ccclass, property } = _decorator;

@ccclass('HeroDetailCharacterComponent')
export class HeroDetailCharacterComponent extends Component {
    // 全部角色显示的节点
    @property(Node)
    allCharacterNode: Node

    // 当前角色数据
    private currentCharacterData: CharacterCreateData

    // 当前渲染的角色
    private currentCharacterComponent: CharacterComponent

    // 加载角色
    private async initCharacter(character: CharacterCreateData) {
        this.currentCharacterData = character
        // 角色预制体
        const characterPrefab = await util.resource.loadResource("prefab-resource/Character" , Prefab)
        // 角色节点
        const characterNode = await util.resource.createNodeByPrefab(characterPrefab)
        // 几个节点移除
        characterNode.getChildByName("State").active = false
        characterNode.getChildByName("EnergeMaxEffect").active = false
        // 设置角色
        await characterNode.getComponent(CharacterComponent)
            .initCharacter({
                ...character ,
                direction: "left" ,
                characterScale: 1.3
            } , null)
        // 设置位置
        characterNode.setPosition(0,0,0)
        this.node.getChildByName("CharacterNode").addChild(characterNode)
        this.currentCharacterComponent = characterNode.getComponent(CharacterComponent)
        // 注意：此处不能播放动画，面板尚未激活(this.node.active=false)，
        // sp.Skeleton 激活时会重建清空动画轨道；待机播放见 setCharacter
    }

    // 设置角色属性面包
    private async initProperty() {
        const characterState = this.currentCharacterComponent.state
        // 背景显示
        //const backgroundNode = this.node.getChildByName("Background")
        //backgroundNode.children.forEach(n => n.active = false)
        //this.node.getChildByName("Background").getChildByName(characterState.camp.split(" ")[1]).active = true
        // Ui渲染
        
        const characterNode = this.node.getChildByName("CharacterNode")
        characterNode.getChildByName("Name").getComponent(Label).string = characterState.name.toString()

        const lvImg = characterNode.getChildByName("LvImg")
        lvImg.getChildByName("Lv").getComponent(Label).string =  characterState.lv.toString()

        const propertyNode = this.node.getChildByName("Property")
        // 星级设置
        const allStars = propertyNode.getChildByName("Stars").children
        allStars.forEach(s => s.getChildByName("teamupgrade_icon").active = false)
        for (let i = 0; i < characterState.star; i++)
            allStars[i].getChildByName("teamupgrade_icon").active = true

        // 升级材料设置
        propertyNode.getChildByName("LevelUpGold")
            .getComponent(Label).string = util.normalData(this.getLevelUpGold())
        propertyNode.getChildByName("LevelUpSoul")
            .getComponent(Label).string = util.normalData(this.getLevelUpSoul())

        // 升星材料设置
        propertyNode.getChildByName("StarUpGold").active = false
        propertyNode.getChildByName("StarUpDiamond").active = false
        propertyNode.getChildByName("HeroStar").active = false
        if (characterState.star < 5) {
            propertyNode.getChildByName("StarUpGold").active = true
            propertyNode.getChildByName("StarUpDiamond").active = true
            propertyNode.getChildByName("HeroStar").active = true
            propertyNode.getChildByName("StarUpGold")
                .getComponent(Label).string = util.normalData(this.getStarUpGold())
            propertyNode.getChildByName("StarUpDiamond")
                .getComponent(Label).string = util.normalData(this.getStarUpDiamond())
        }

        // 阵营设置
        propertyNode.getChildByName("Camp").getComponent(Sprite)
            .spriteFrame = await util.resource.loadResource(
             "ui-resource/camp/" + characterState.camp.split(" ")[1] + "/spriteFrame"
            , SpriteFrame
        )

        // 职业设置
        propertyNode.getChildByName("Career").getComponent(Sprite)
            .spriteFrame = await util.resource.loadResource(
            "ui-resource/career/" + characterState.mateData.career + "/spriteFrame"
            , SpriteFrame
        )

        // 生命属性设置
        propertyNode.getChildByName("HpNumber")
            .getChildByName("Value").getComponent(Label).string = Math.ceil(characterState.maxHp) + ''
        // 攻击属性设置
        propertyNode.getChildByName("AttackNumber")
            .getChildByName("Value").getComponent(Label).string = Math.ceil(characterState.attack) + ''
        // 防御属性设置
        propertyNode.getChildByName("DefenceNumber")
            .getChildByName("Value").getComponent(Label).string = Math.ceil(characterState.defence) + ''
        // 速度属性设置
        propertyNode.getChildByName("SpeedNumber")
            .getChildByName("Value").getComponent(Label).string = Math.ceil(characterState.speed) + ''

        const skill = propertyNode.getChildByName("Skill")
        // 技能组合设置
        const skillsNode = skill.getChildByName("Skills")

        // 设置技能图标
        skillsNode.getChildByName("Attack").getComponent(Sprite).spriteFrame =
            await util.resource.loadResource("character-resource/" + characterState.id + "/attack/spriteFrame" , SpriteFrame)
        skillsNode.getChildByName("Addition-1").getComponent(Sprite).spriteFrame =
            await util.resource.loadResource("character-resource/" + characterState.id + "/addition_1/spriteFrame" , SpriteFrame)
        skillsNode.getChildByName("Addition-2").getComponent(Sprite).spriteFrame =
            await util.resource.loadResource("character-resource/" + characterState.id + "/addition_2/spriteFrame" , SpriteFrame)
        skillsNode.getChildByName("Skill").getComponent(Sprite).spriteFrame =
            await util.resource.loadResource("character-resource/" + characterState.id + "/skill/spriteFrame" , SpriteFrame)
        // 如果没有则隐藏
        skillsNode.children.forEach(c => {
            c.active = false;
            (c.getComponent(Sprite).spriteFrame) && (c.active = true)
        })
        // 设置技能简介
        skillsNode.getChildByName("Attack")
            .getChildByName("Introduce")
            .getChildByName("Message")
            .getComponent(Label).string = characterState.mateData.attackIntroduce
        skillsNode.getChildByName("Addition-1")
            .getChildByName("Introduce")
            .getChildByName("Message")
            .getComponent(Label).string = characterState.mateData.addition_1_introduce
        // 2星以上才解锁技能
        if (characterState.star < 2) {
            skillsNode.getChildByName("Addition-1").getChildByName("UnOpen")
                .active = true
        } else  {
            skillsNode.getChildByName("Addition-1").getChildByName("UnOpen")
                .active = false
        }
        skillsNode.getChildByName("Addition-2")
            .getChildByName("Introduce")
            .getChildByName("Message")
            .getComponent(Label).string = characterState.mateData.addition_2_introduce
        // 4星以上才解锁技能
        if (characterState.star < 4) {
            skillsNode.getChildByName("Addition-2").getChildByName("UnOpen")
                .active = true
        } else  {
            skillsNode.getChildByName("Addition-2").getChildByName("UnOpen")
                .active = false
        }
        skillsNode.getChildByName("Skill")
            .getChildByName("Introduce")
            .getChildByName("Message")
            .getComponent(Label).string = characterState.mateData.skillIntroduce
        // 当前显示的
        let currentShowSkillIntroduceNode: Node = null
        // 全部绑定事件
        skillsNode.children.forEach(node => {
            node.getChildByName("Introduce").active = false
            node.off("click")
            node.on("click" , () => {
                if (!currentShowSkillIntroduceNode) {
                    node.getChildByName("Introduce").active = true
                    currentShowSkillIntroduceNode = node
                    return
                } else if (currentShowSkillIntroduceNode === node) {
                    currentShowSkillIntroduceNode.getChildByName("Introduce")
                        .active = false
                    currentShowSkillIntroduceNode = null
                    return;
                } else {
                    currentShowSkillIntroduceNode.getChildByName("Introduce")
                        .active = false
                    node.getChildByName("Introduce").active = true
                    currentShowSkillIntroduceNode = node
                }
            })
        })

        return
    }

    // 设置并显示界面
    public async setCharacter(character: CharacterCreateData) {
        const closeFunction = await util.message.loadData()
        // 如果上一次的还在
        if (this.currentCharacterComponent) {
            this.currentCharacterComponent.node.destroy()
            this.currentCharacterComponent = null
        }
        await this.initCharacter({
            ...character ,
            isBoss: true ,
        })
        await this.initProperty()
        this.node.active = true
        // sp.Skeleton 在节点激活(onEnable)时会重建内部动画状态并清空已设置的轨道，
        // 待机动画必须在面板激活之后再播放，否则角色保持静止
        if (this.currentCharacterComponent)
            this.currentCharacterComponent.playCharacterAnimation("rest").then()
        closeFunction()
    }

    // 退出时
    protected onDisable() {
        if (this.currentCharacterComponent)
            this.currentCharacterComponent.node.destroy()
        this.currentCharacterComponent = null
        this.allCharacterNode.getComponent(HeroAllCharacterComponent).rerender()
            .then()
    }

    // 返回界面
    public goBack() { this.node.active = false }

    // 播放Spine动画
    public playSpineAnimation(skeleton: sp.Skeleton , name: string) {
        skeleton.node.active = true
        skeleton.setAnimation(0 , name , false)
        skeleton.setCompleteListener((trackEntry: sp.spine.TrackEntry) => {
            let spineAnimationName: any = trackEntry.animation.name ? trackEntry.animation.name : "";
            if(name === spineAnimationName) skeleton.node.active = false
            return
        })
    }

    // 是否询问
    private inquire = false
    // 去升级
    public async goToLevelUp() {
        const gold = this.getLevelUpGold()
        const soul = this.getLevelUpSoul()
        if (!this.inquire) {
            const result = await util.message.confirmData(find("Canvas") , {
                message:
                    "升级会消耗" + util.normalData(gold) +
                    "金币和" + util.normalData(soul) + "灵魂，确定要升级吗?" ,
                toggleMessage: "不再提示" ,
                toggleChangeEvent: (to) => this.inquire = to
            })
            if (!result) return
        }
        const config = getConfig()
        if (config.userData.gold < gold || config.userData.soul < soul) {
            return await util.message.confirmData(find("Canvas") , {
                message: "金币或灵魂不足" ,
            })
        }
        // 金币减少
        config.userData.gold -= gold
        config.userData.soul -= soul
        this.node
            .getChildByName("UserResourceUi")
            .getComponent(UserResourceUiComponent)
            .updateUI();
        let character:  CharacterCreateData
        // 升级
        [...config.userData.characterQueue , ...config.userData.characters].forEach(c => {
            if (c.uuid !== this.currentCharacterData.uuid) return
            c.lv++
            character = c
        })
        // 播放音乐
        const audioSource =
            this.node.getChildByName("UpAudio")
            .getComponent(AudioSource)
        audioSource.volume = config.volumeDetail.home * config.volume
        audioSource.play()
        // 播放动画
        this.playSpineAnimation(
            this.node.getChildByName("CharacterUpEffect").getComponent(sp.Skeleton) ,
            "animation"
        )
        this.playSpineAnimation(
            this.node.getChildByName("LevelUpEffect").getComponent(sp.Skeleton) ,
            "animation"
        )
        // 重新渲染
        await this.setCharacter(character)
        stockConfig()
    }

    // 去升星
    public async goToStarUp() {
        const gold = this.getStarUpGold()
        const diamond = this.getStarUpDiamond()
        const result = await util.message.confirmData(find("Canvas") , {
            message:
                "升星会消耗" + util.normalData(gold) +
                "金币和" + util.normalData(diamond) + "钻石，确定要升星吗?" ,
        })
        if (!result) return
        const config = getConfig()
        if (config.userData.gold < gold || config.userData.diamond < diamond) {
            return await util.message.confirmData(find("Canvas") , {
                message: "金币或钻石不足"
            })
        }
        // 金币减少
        config.userData.gold -= gold
        config.userData.diamond -= diamond
        this.node
            .getChildByName("UserResourceUi")
            .getComponent(UserResourceUiComponent)
            .updateUI();
        let character:  CharacterCreateData
        // 升级
        [...config.userData.characterQueue , ...config.userData.characters].forEach(c => {
            if (c.uuid !== this.currentCharacterData.uuid) return
            c.star = (c.star || 1) + 1
            character = c
        })
        // 播放音乐
        const audioSource = this.node.getChildByName("UpAudio").getComponent(AudioSource)
        audioSource.volume = config.volumeDetail.home * config.volume
        audioSource.play()
        // 播放动画
        this.playSpineAnimation(
            this.node.getChildByName("CharacterUpEffect").getComponent(sp.Skeleton) ,
            "animation"
        )
        this.playSpineAnimation(
            this.node.getChildByName("StarUpEffect").getComponent(sp.Skeleton) ,
            "animation"
        )
        // 重新渲染
        await this.setCharacter(character)
        stockConfig()
    }

    // 播放动画
    public playAnimation() {
        if (this.currentCharacterComponent)
            this.currentCharacterComponent.playCharacterAnimation("attack" , 1)
                .then()
    }

    // 上一个
    public async theLast() {
        const allCharacterData =
            this.allCharacterNode.getComponent(HeroAllCharacterComponent).allCharacterData
        for (let i = 0; i < allCharacterData.length; i++) {
            if (allCharacterData[i].uuid !== this.currentCharacterData.uuid) continue
            if (i <= 0)
                i = allCharacterData.length - 1
            else i = i - 1
            await this.setCharacter(allCharacterData[i])
            break
        }
    }

    // 下一个
    public async theNext() {
        const allCharacterData =
            this.allCharacterNode.getComponent(HeroAllCharacterComponent).allCharacterData
        for (let i = 0; i < allCharacterData.length; i++) {
            if (allCharacterData[i].uuid !== this.currentCharacterData.uuid) continue
            if (i >= allCharacterData.length - 1)
                i = 0
            else i = i + 1
            await this.setCharacter(allCharacterData[i])
            break
        }
    }

    // 升级所需金币
    public getLevelUpGold(): number {
        const result =
            this.currentCharacterData.lv
            *
            Math.max(this.currentCharacterData.lv / 50 , 1)
            *
            (this.currentCharacterData.lv / (this.currentCharacterData.lv + 5) + 1)
            *
            getLevelFromRare(CharacterEnum[this.currentCharacterData.id].rare)
            *
            100
        return Math.ceil(result)
    }

    // 升级所需灵魂
    public getLevelUpSoul(): number {
        const result =
            this.currentCharacterData.lv
            *
            Math.max(this.currentCharacterData.lv / 50 , 1)
            *
            (this.currentCharacterData.lv / (this.currentCharacterData.lv + 15) + 1)
            *
            getLevelFromRare(CharacterEnum[this.currentCharacterData.id].rare)
            *
            50
        return Math.ceil(result)
    }

    // 升星所需金币
    public getStarUpGold(): number {
        const result = (this.currentCharacterData.star || 1)
        * (this.currentCharacterData.star || 1)
        * 1000 * getLevelFromRare(CharacterEnum[this.currentCharacterData.id].rare)
        return Math.ceil(result)
    }
    // 升星所需钻石
    public getStarUpDiamond(): number {
        const result = (this.currentCharacterData.star || 1)
            * 150
            * getLevelFromRare(CharacterEnum[this.currentCharacterData.id].rare)
        return Math.ceil(result)
    }

    // 关闭详细属性面板
    public openDetailPropertyScreen() {
        const detailProperty =
            this.node.getChildByName("Property")
            .getChildByName("DetailProperty")
        // 渲染数据
        detailProperty.getChildByName("Attack")
            .getComponent(Label).string = "攻击力: " +
            Math.ceil(this.currentCharacterComponent.state.attack)
        detailProperty.getChildByName("Defence")
            .getComponent(Label).string = "防御值: " +
            Math.ceil(this.currentCharacterComponent.state.defence)
        detailProperty.getChildByName("Hp")
            .getComponent(Label).string = "生命值: " +
            Math.ceil(this.currentCharacterComponent.state.maxHp)
        detailProperty.getChildByName("Pierce")
            .getComponent(Label).string = "穿透值: " +
            Math.ceil(this.currentCharacterComponent.state.pierce)
        detailProperty.getChildByName("Speed")
            .getComponent(Label).string = "角色速度: " +
            Math.ceil(this.currentCharacterComponent.state.speed)
        detailProperty.getChildByName("Block")
            .getComponent(Label).string = "角色格挡: " +
            Math.ceil(this.currentCharacterComponent.state.block)
        detailProperty.getChildByName("CurePercent")
            .getComponent(Label).string = "治疗效率: " +
            Math.floor(this.currentCharacterComponent.state.curePercent * 100) + "%"
        detailProperty.getChildByName("Energy")
            .getComponent(Label).string = "最大能量: " +
            Math.ceil(this.currentCharacterComponent.state.maxEnergy)

        detailProperty.active = true
    }

    // 打开详细属性面板
    public closeDetailPropertyScreen() {
        const propertyNode = this.node.getChildByName("Property")
        propertyNode.getChildByName("DetailProperty").active = false
    }

}
