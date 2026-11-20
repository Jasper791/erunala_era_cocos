import {Label , _decorator, Button, Component, director, Node, Prefab, UITransform} from 'cc';
import {util} from "../../common/util/Util";
import {CharacterAvatarComponent} from "../../resources/prefab-resource/CharacterAvatarComponent";
import {getConfig} from "../../common/Config";
import {CampEnum} from "../../common/game/UnitCampEnum";
import {CharacterEnum} from "../../common/game/character/CharacterEnum";
import {CharacterCreateData} from "../../common/game/character/CharacterCreateData";
import {LoadSceneComponent} from "../../resources/prefab-resource/LoadSceneComponent";
import {CharacterComponent} from "../../resources/prefab-resource/CharacterComponent";
import {getLevelFromRare} from "../../common/game/character/CharacterMateState";
import { HeroDetailCharacterComponent } from './HeroDetailCharacterComponent';
import HeroServiceNet from '../../serviceNet/HeroServiceNet';

const { ccclass, property } = _decorator;

@ccclass('HeroAllCharacterComponent')
export class HeroAllCharacterComponent extends Component {

    // 详细节点
    @property(Node)
    public detailNode: Node

    // 容器节点
    @property(Node)
    public contentNode: Node

    // 排序方式
    private $currentSort = 0
    public allSortModel = [
        {
            title: "默认排序" ,
            sort: () => 0
        } ,
        {
            title: "等级降序" ,
            sort: (a: CharacterCreateData , b: CharacterCreateData) => b.lv - a.lv
        } ,
        {
            title: "等级升序" ,
            sort: (a: CharacterCreateData , b: CharacterCreateData) => a.lv - b.lv
        } ,
        {
            title: "星级降序" ,
            sort: (a: CharacterCreateData , b: CharacterCreateData) => b.star - a.star
        } ,
        {
            title: "星级升序" ,
            sort: (a: CharacterCreateData , b: CharacterCreateData) => a.star - b.star
        } ,
        {
            title: "品质降序" ,
            sort: (a: CharacterCreateData , b: CharacterCreateData) => getLevelFromRare(CharacterEnum[b.id].rare) - getLevelFromRare(CharacterEnum[a.id].rare)
        } ,
        {
            title: "品质升序" ,
            sort: (a: CharacterCreateData , b: CharacterCreateData) => getLevelFromRare(CharacterEnum[a.id].rare) - getLevelFromRare(CharacterEnum[b.id].rare)
        } ,

    ]
    public async changeSortModel() {
        this.$currentSort++
        if (this.$currentSort >= this.allSortModel.length)
            this.$currentSort = 0

        const viewNode = this.node.getChildByName("View")
        viewNode.getChildByName("SortButton")
            .getChildByName("Label")
            .getComponent(Label)
            .string = this.allSortModel[this.$currentSort].title
        const close = await util.message.loadData()
        await this.rerender()
        close()
    }

    // 开始渲染
    protected async start() {

        this.detailNode.active = false

        const loadScenesComponent = this.node.parent?.getChildByName("LoadScene")?.getComponent(LoadSceneComponent)
        if (loadScenesComponent) loadScenesComponent.node.active = true
        loadScenesComponent?.setProgress(70)
        this.queryHeroAll()
        await this.rerender()
        loadScenesComponent?.setProgress(100)
        await loadScenesComponent?.awaitProgressEnd()
        if (loadScenesComponent) loadScenesComponent.node.active = false
    }

    //网络请求 查询钱包地址的所有英雄
    public async queryHeroAll(){
        await HeroServiceNet.queryHeroAll();
    }

    // 当前队列
    public allCharacterData: CharacterCreateData[] = []

    // uuid对应的所有CharacterAvatarComponent
    public allCharacterComponent: Map<number , CharacterAvatarComponent> = new Map

    // 当前过滤类型
    private $filterCamp: CampEnum|"ALL" = "ALL"
    public set filterCamp(c: CampEnum|"ALL") {
        this.$filterCamp = c
        util.message.loadData().then(close => this.rerender().then(close) )
    }

    // 渲染所有角色
    public async rerender() {
        const config = getConfig()

        // 详细界面组件
        const detailCharacterComponent = this.detailNode.getComponent(HeroDetailCharacterComponent)
        // 预制体
        const characterAvatarPrefab =
            await util.resource.loadResource("prefab-resource/CharacterAvatar" , Prefab)
        // 所有的待渲染角色
        this.allCharacterData = [
            ...config.userData.characterQueue ,
            ...config.userData.characters
        ].sort(this.allSortModel[this.$currentSort].sort)
        // 过滤角色
        if (this.$filterCamp !== "ALL")
            this.allCharacterData = this.allCharacterData.filter(c => CharacterEnum[c.id].camp === this.$filterCamp)
        // 全部隐藏
        this.contentNode.removeAllChildren()
        // 遍历所有
        for (const character of this.allCharacterData) {
            let avatarComponent = this.allCharacterComponent.get(character.uuid)
            
            // 如果不存在则创建
            if (!avatarComponent) {
                const avatarNode =
                    await util.resource.createNodeByPrefab(characterAvatarPrefab)
                const button = avatarNode.addComponent(Button)
                button.transition = 3
                button.zoomScale = 0.9
                avatarComponent = avatarNode.getComponent(CharacterAvatarComponent)
                await avatarComponent.setCharacter(character)
                this.allCharacterComponent.set(character.uuid , avatarComponent)

                this.contentNode.addChild(avatarComponent.node)
            }
            // 存在则修改信息就行
            else await avatarComponent.setCharacter(character)
            avatarComponent.node.off("click")
            avatarComponent.node.on("click" , async (e) => {
                await detailCharacterComponent.setCharacter(character)
            })
            /*
            avatarComponent.node.setScale(
                this.node.scale.x + 2 ,
                this.node.scale.y + 2 ,
                this.node.scale.z ,)
            */
            //avatarComponent.getComponent(UITransform).setContentSize(300,300)
            this.contentNode.addChild(avatarComponent.node)
        }

    }

    // 返回主界面
    public async goHome() {
        await util.scene.go("Home")
    }

    // 判断是否一样以及清空所有的灯光
    private clearLightAndJudgeIsSame(e: any , type: any) {
        e.target.parent.children.forEach(n => {
            n.getChildByName("Bk").active = false
        })
        if (this.$filterCamp === type) {
            this.filterCamp = "ALL"
            return false
        }
        e.target.getChildByName("Bk").active = true
        return true
    }

    // 切换到普通属性
    public SwitchOrdinary(e: any) {
        if (this.clearLightAndJudgeIsSame(e , CampEnum.ORDINARY))
            this.filterCamp = CampEnum.ORDINARY
    }

    // 切换到神圣属性
    public SwitchSacred(e: any) {
        if (this.clearLightAndJudgeIsSame(e , CampEnum.SACRED))
            this.filterCamp = CampEnum.SACRED
    }

    // 切换到黑夜属性
    public SwitchDark(e: any) {
        if (this.clearLightAndJudgeIsSame(e , CampEnum.DARK))
            this.filterCamp = CampEnum.DARK
    }

    // 切换到机械属性
    public SwitchMachine(e: any) {
        if (this.clearLightAndJudgeIsSame(e , CampEnum.MACHINE))
            this.filterCamp = CampEnum.MACHINE
    }

    // 切换到自然属性
    public SwitchNature(e: any) {
        if (this.clearLightAndJudgeIsSame(e , CampEnum.NATURE))
            this.filterCamp = CampEnum.NATURE
    }

    // 切换到深渊属性
    public SwitchAbyss(e: any) {
        if (this.clearLightAndJudgeIsSame(e , CampEnum.ABYSS))
            this.filterCamp = CampEnum.ABYSS
    }
}


