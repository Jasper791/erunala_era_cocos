import { _decorator, Component, Node, Prefab , EventMouse , NodeEventType , find} from 'cc';
import {CharacterAvatarComponent} from "../../resources/prefab-resource/CharacterAvatarComponent";
import {LoadSceneComponent} from "../../resources/prefab-resource/LoadSceneComponent";
import {util} from "../../common/util/Util";
import {getConfig, stockConfig} from "../../common/Config";
const { property } = _decorator;

export class BaseTeamCharacterComponent extends Component {
    @property(Node)
    CharacterBackpackNode: Node
    @property(Node)
    CharacterBackpackContentNode: Node
    @property(Node)
    CharacterFightsNode: Node

    // 每个uuid对应一个 CharacterAvatarComponent
    private allCharacterAvatar: Map<number , CharacterAvatarComponent> = new Map()

    // 当前选择节点
    private $selectCharacterAvatar: { isFight: boolean , avatar: CharacterAvatarComponent } = null
    public set selectCharacterAvatar(a: { isFight: boolean , avatar: CharacterAvatarComponent }) {
        if (this.$selectCharacterAvatar)
            this.$selectCharacterAvatar.avatar.node.getChildByName("Light").active = false
        if (a) {
            this.CharacterFightsNode.children.forEach(characterItemNode => {
                characterItemNode.getChildByName("Light").active = true
            })
            a.avatar.node.getChildByName("Light").active = true
        } else {
            this.CharacterFightsNode.children.forEach(characterItemNode => {
                characterItemNode.getChildByName("Light").active = false
            })
        }
        this.$selectCharacterAvatar = a
    }

    // 开始渲染
    protected async start() {
        // 场景未内嵌 LoadScene 节点时容错（进度条流程可选）
        const loadScenesComponent = this.node.parent?.getChildByName("LoadScene")?.getComponent(LoadSceneComponent)
        if (loadScenesComponent) loadScenesComponent.node.active = true
        loadScenesComponent?.setProgress(70)
        // 第一次渲染
        await this.rerender()
        loadScenesComponent?.setProgress(100)
        await loadScenesComponent?.awaitProgressEnd()
        if (loadScenesComponent) loadScenesComponent.node.active = false
    }

    // 渲染
    public async rerender() {
        const config = getConfig()
        const closeFunction = await util.message.loadData()
        // 角色头像预制体
        const characterAvatarPrefab =
            await util.resource.loadResource("prefab-resource/CharacterAvatar" , Prefab);
        const allCharacter = [...config.userData.characterQueue , ...config.userData.characters]
        for (const character of allCharacter) {
            let characterAvatarComponent = this.allCharacterAvatar.get(character.uuid)
            if (!characterAvatarComponent) {
                const avatarNode =
                    await util.resource.createNodeByPrefab(characterAvatarPrefab)
                characterAvatarComponent = avatarNode.getComponent(CharacterAvatarComponent)
                await characterAvatarComponent.setCharacter(character)
                this.allCharacterAvatar.set(character.uuid , characterAvatarComponent)
            }
        }
        // 清空所有节点
        this.CharacterBackpackNode
            .getChildByName("View")
            .getChildByName("Content")
            .removeAllChildren()
        this.CharacterBackpackContentNode.children.forEach(node => {
            if (node.children[3]) node.removeChild(node.children[3])
        })
        // 重新渲染
        config.userData.characters.forEach(character => {
            const characterAvatarNode = this.allCharacterAvatar.get(character.uuid).node
            characterAvatarNode.setPosition(0,0,0)
            //解绑
            characterAvatarNode.off(NodeEventType.TOUCH_END)
            this.CharacterBackpackContentNode.addChild(characterAvatarNode)
            // 绑定事件
            characterAvatarNode.on(NodeEventType.TOUCH_END , () => {
                if (this.$selectCharacterAvatar && this.$selectCharacterAvatar.avatar === this.allCharacterAvatar.get(character.uuid))
                    return this.selectCharacterAvatar = null
                this.selectCharacterAvatar = {
                    isFight: false ,
                    avatar: this.allCharacterAvatar.get(character.uuid)
                }
            })
        })
        config.userData.characterQueue.forEach(character => {
            this.allCharacterAvatar.get(character.uuid).node.off(NodeEventType.TOUCH_END)
            this.allCharacterAvatar.get(character.uuid).node.setPosition(0,0,0)
            this.CharacterFightsNode
                .getChildByName("CharacterItem" + character.row + character.clo)
                .addChild(this.allCharacterAvatar.get(character.uuid).node)
        })
        // 关闭进度条
        closeFunction()
    }

    // 点击事件
    public async clickFightAvatar(e: EventMouse , arg: string) {
        const config = getConfig()
        const
            row = parseInt(arg.split("-")[0]) ,
            clo = parseInt(arg.split("-")[1])
        const currentTeamAvatarNode =
            this.CharacterFightsNode.getChildByName("CharacterItem" + row + clo).getChildByName("CharacterAvatar")
        // 原来的数组做一个深度缓存
        const cacheBackpack = [...config.userData.characters]
        const cacheTeamQueue = [...config.userData.characterQueue]
        // 如果当前当前选择节点 并且 九宫格没有英雄
        if (this.$selectCharacterAvatar && !currentTeamAvatarNode) {
            // 只是换个位置
            if (this.$selectCharacterAvatar.isFight) {
                for (let i = 0; i < config.userData.characterQueue.length; i++) {
                    if (config.userData.characterQueue[i].uuid !== this.$selectCharacterAvatar.avatar.character.uuid)
                        continue;
                    config.userData.characterQueue[i].row = row
                    config.userData.characterQueue[i].clo = clo
                    break
                }
            }
            // 上场
            else {
                // 从背包中去掉
                for (let i = 0; i < config.userData.characters.length; i++) {
                    if
                    (
                        this.$selectCharacterAvatar.avatar.character.uuid
                        ===
                        config.userData.characters[i].uuid
                    ) {
                        config.userData.characters.splice(i, 1);
                        break
                    }
                }
                // 加入队列
                config.userData.characterQueue.push({
                    ...this.$selectCharacterAvatar.avatar.character ,
                    row , clo , direction: "left"
                })
            }
            // 设置为空
            this.selectCharacterAvatar = null
        }
        // 如果当前当前选择节点 并且对应九宫格有英雄
        else if (this.$selectCharacterAvatar && currentTeamAvatarNode) {
            if (!this.$selectCharacterAvatar.isFight) {
                // 一个下场
                const avatarComponent =
                    currentTeamAvatarNode.getComponent(CharacterAvatarComponent)
                for (let i = 0; i < config.userData.characterQueue.length; i++) {
                    const character = {...config.userData.characterQueue[i]}
                    if (character.uuid !== avatarComponent.character.uuid) continue
                    delete character.row
                    delete character.clo
                    delete character.direction
                    config.userData.characters.push(character)
                    config.userData.characterQueue.splice(i , 1)
                    break
                }
                // 一个上场
                config.userData.characterQueue.push({
                    ...this.$selectCharacterAvatar.avatar.character ,
                    clo , row , direction: "left"
                })
                // 背包中删除
                for (let i = 0; i < config.userData.characters.length; i++) {
                    if (config.userData.characters[i].uuid === this.$selectCharacterAvatar.avatar.character.uuid) {
                        config.userData.characters.splice(i , 1)
                        break
                    }
                }
            }
            else {
                const characterAvatar =
                    currentTeamAvatarNode.getComponent(CharacterAvatarComponent)
                // 如果是自己则下场
                if (characterAvatar.character.uuid === this.$selectCharacterAvatar.avatar.character.uuid) {
                    const character = {...characterAvatar.character}
                    for (let i = 0; i < config.userData.characterQueue.length; i++) {
                        if (config.userData.characterQueue[i].uuid !== character.uuid) continue
                        config.userData.characterQueue.splice(i , 1)
                        delete character.row
                        delete character.clo
                        delete character.direction
                        config.userData.characters.push(character)
                        break
                    }
                }
                // 否则直接交换
                else {
                    let aIndex: number , bIndex: number
                    for (let i = 0; i < config.userData.characterQueue.length; i++) {
                        if (config.userData.characterQueue[i].uuid === this.$selectCharacterAvatar.avatar.character.uuid) {
                            aIndex = i
                        } else if (config.userData.characterQueue[i].uuid === characterAvatar.character.uuid) {
                            bIndex = i
                        }
                        if (aIndex >= 0 && bIndex >= 0) break
                    }
                    let TempRow = config.userData.characterQueue[aIndex].row  ,
                        TempClo = config.userData.characterQueue[aIndex].clo
                    config.userData.characterQueue[aIndex].row =
                        config.userData.characterQueue[bIndex].row
                    config.userData.characterQueue[aIndex].clo =
                        config.userData.characterQueue[bIndex].clo
                    config.userData.characterQueue[bIndex].row = TempRow
                    config.userData.characterQueue[bIndex].clo = TempClo
                }
            }
            this.selectCharacterAvatar = null
        }
        // 如果没有选择节点 并且对应九宫格有英雄 则选择该英雄
        else if (!this.$selectCharacterAvatar && currentTeamAvatarNode) {
            this.selectCharacterAvatar = {
                isFight: true ,
                avatar: currentTeamAvatarNode.getComponent(CharacterAvatarComponent)
            }
        }
        // 最多5个成员
        if (config.userData.characterQueue.length > 5) {
            config.userData.characterQueue = cacheTeamQueue
            config.userData.characters = cacheBackpack
            util.message.confirmData(find("Canvas") , {
                message: "最多5个上场角色",
            }).then()
        }
        // 重新渲染
        await this.rerender()
        // 保存
        stockConfig()
    }
}
