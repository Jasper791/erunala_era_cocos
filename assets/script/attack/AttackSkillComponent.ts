import {EditBox , _decorator, Component, find, Label, Node, Prefab, NodeEventType, EventMouse, Sprite} from 'cc';
import {SkillAvatarComponent} from "../../resources/prefab-resource/SkillAvatarComponent";
import {SkillMateState} from "../../common/game/skill/SkillMateState";
import {SkillEnum} from "../../common/game/skill/SkillEnum";
import {SkillState} from "../../common/game/skill/SkillState";
import {SkillCreateData} from "../../common/game/skill/SkillCreateData";
import { util } from '../../common/util/Util';
import { getConfig } from '../../common/Config';
const { ccclass, property } = _decorator;

@ccclass('AttackSkillComponent')
export class AttackSkillComponent extends Component {
    @property(Node)
    ContentNode: Node

    protected async onLoad() { await this.rerender() }

    // 当前选择
    private $currentSkill: SkillAvatarComponent
    //记录技能出招顺序
    public attackBlockNumber: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0]

    // 渲染背包
    public async rerender() {
        console.log("开始渲染  AttackSkillComponent  ")
        const close = await util.message.loadData()
        const config = getConfig()
        const prefab = await util.resource.loadResource(
            "prefab-resource/SkillAvatar" ,
            Prefab
        )
        this.ContentNode.children.forEach(c => {c.destroy()})
        this.ContentNode.removeAllChildren()
        //const introduceNode = this.node.getChildByName("Introduce")
        for (const skill of config.userData.skills) {
            const node = await util.resource.createNodeByPrefab(prefab)
            //console.log(" node.getComponent(SkillAvatarComponent):"+ node.getComponent(SkillAvatarComponent)) 
            await node.getComponent(SkillAvatarComponent).setSkill(skill)
            node.name = "Skill-"+ skill.id
            this.ContentNode.addChild(node)
            const mateState: SkillMateState = SkillEnum[skill.id]
            const state = SkillState.createState(mateState , skill.number)
            node.on(NodeEventType.TOUCH_END,()=>{
                this.$currentSkill = node.getComponent(SkillAvatarComponent)
                if(this.$currentSkill.node.getChildByName("Light").active){
                    this.$currentSkill.node.getChildByName("Light").active = false
                    this.$currentSkill= null
                }else{
                    this.$currentSkill = node.getComponent(SkillAvatarComponent)
                    this.$currentSkill.node.getChildByName("Light").active = true
                }
                console.log("touch ..."+state.mateData.name +" " + state.mateData.id + " " + state.mateData.number);
                this.clearLight()
            })
        }
        return close()
    }

    //清空选中技能高亮
    private async clearLight(){
        this.ContentNode.children.forEach(c => {
            if(this.$currentSkill != null){
                if(c.name != this.$currentSkill.node.name){
                    c.getChildByName("Light").active = false
                }
            }
        })
    }

    // 出招技能顺序块
    public async clickAttackBlock(e: EventMouse , arg: string) {
        console.log("clickAttackBlock attrack:"+arg)
        if(this.$currentSkill != null){
            this.node.getChildByName("AttrackList").getChildByName("attrack"+arg)
            .getChildByName("Background").getComponent(Sprite).spriteFrame 
            = this.$currentSkill.node.getChildByName("Sprite").getComponent(Sprite).spriteFrame
            this.attackBlockNumber[arg]=this.$currentSkill.skill.id
            console.log(this.attackBlockNumber[arg])
        }
    }
}


