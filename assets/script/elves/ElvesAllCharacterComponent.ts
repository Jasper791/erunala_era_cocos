import {Label , _decorator, Button, Component, director, Node, Prefab, UITransform} from 'cc';
import {util} from "../../common/util/Util";
import {ElvesAvatarComponent} from "../../resources/prefab-resource/ElvesAvatarComponent";
import {getConfig} from "../../common/Config";
import {CampEnum} from "../../common/game/UnitCampEnum";
import {ElvesEnum} from "../../common/game/elves/ElvesEnum";
import {ElvesCreateData} from "../../common/game/elves/ElvesCreateData";
import {LoadSceneComponent} from "../../resources/prefab-resource/LoadSceneComponent";
import {ElvesComponent} from "../../resources/prefab-resource/ElvesComponent";
import {getLevelFromRare} from "../../common/game/character/CharacterMateState";
import { ElvesDetailCharacterComponent } from './ElvesDetailCharacterComponent';
import ElvesServiceNet from '../../serviceNet/ElvesServiceNet';

const { ccclass, property } = _decorator;

@ccclass('ElvesAllCharacterComponent')
export class ElvesAllCharacterComponent extends Component {

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
            sort: (a: ElvesCreateData , b: ElvesCreateData) => b.lv - a.lv
        } ,
        {
            title: "等级升序" ,
            sort: (a: ElvesCreateData , b: ElvesCreateData) => a.lv - b.lv
        } ,
        {
            title: "星级降序" ,
            sort: (a: ElvesCreateData , b: ElvesCreateData) => b.star - a.star
        } ,
        {
            title: "星级升序" ,
            sort: (a: ElvesCreateData , b: ElvesCreateData) => a.star - b.star
        } ,
        {
            title: "品质降序" ,
            sort: (a: ElvesCreateData , b: ElvesCreateData) => getLevelFromRare(ElvesEnum[b.id].rare) - getLevelFromRare(ElvesEnum[a.id].rare)
        } ,
        {
            title: "品质升序" ,
            sort: (a: ElvesCreateData , b: ElvesCreateData) => getLevelFromRare(ElvesEnum[a.id].rare) - getLevelFromRare(ElvesEnum[b.id].rare)
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
        this.queryElvesAll()
        await this.rerender()
        loadScenesComponent?.setProgress(100)
        await loadScenesComponent?.awaitProgressEnd()
        if (loadScenesComponent) loadScenesComponent.node.active = false
    }

    //网络请求 查询钱包地址的所有精灵
    public async queryElvesAll(){
        await ElvesServiceNet.queryElvesAll();
    }

    // 当前队列
    public allElvesData: ElvesCreateData[] = []

    // uuid对应的所有ElvesAvatarComponent
    public allElvesComponent: Map<number , ElvesAvatarComponent> = new Map

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
        const detailCharacterComponent = this.detailNode.getComponent(ElvesDetailCharacterComponent)
        // 预制体
        const elvesAvatarPrefab =
            await util.resource.loadResource("prefab-resource/ElvesAvatar" , Prefab)
        // 所有的待渲染角色
        this.allElvesData = [
            ...config.userData.elvesQueue ,
            ...config.userData.elves
        ].sort(this.allSortModel[this.$currentSort].sort)
        // 过滤角色
        if (this.$filterCamp !== "ALL")
            this.allElvesData = this.allElvesData.filter(c => ElvesEnum[c.id].camp === this.$filterCamp)
        // 全部隐藏
        this.contentNode.removeAllChildren()
        // 遍历所有
        for (const elves of this.allElvesData) {
            let avatarComponent = this.allElvesComponent.get(elves.uuid)
            
            // 如果不存在则创建
            if (!avatarComponent) {
                const avatarNode =
                    await util.resource.createNodeByPrefab(elvesAvatarPrefab)
                const button = avatarNode.addComponent(Button)
                button.transition = 3
                button.zoomScale = 0.9
                avatarComponent = avatarNode.getComponent(ElvesAvatarComponent)
                await avatarComponent.setCharacter(elves)
                this.allElvesComponent.set(elves.uuid , avatarComponent)

                this.contentNode.addChild(avatarComponent.node)
            }
            // 存在则修改信息就行
            else await avatarComponent.setCharacter(elves)
            avatarComponent.node.off("click")
            avatarComponent.node.on("click" , async (e) => {
                await detailCharacterComponent.setCharacter(elves)
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


