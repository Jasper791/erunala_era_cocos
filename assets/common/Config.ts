import type { CharacterCreateData } from "./game/character/CharacterCreateData"
import type { ElvesCreateData } from "./game/elves/ElvesCreateData"
import { CharacterEnum } from "./game/character/CharacterEnum"
import { ElvesEnum } from "./game/elves/ElvesEnum"
import type { SkillCreateData } from "./game/skill/SkillCreateData"
import type { EquipmentCreateData } from "./game/equipment/EquipmentCreateData"
import type { EquipmentEnum } from "./game/equipment/EquipmentEnum"
import type { ItemState } from "./game/item/ItemState";
import type { ItemEnum } from "./game/item/ItemEnum";
import type { ItemCreateData } from "./game/item/ItemCreateData";

export class Resource {
    gold: number = 1000
    diamond: number = 100
    soul: number = 1000
}

// TODO(临时方案): 服务端英雄编号(100001+)/精灵编号(200001+)与客户端资源编号不一致，
// 长期方案是服务端扫链(NFT)决定类型后两端对齐；此处与 HeroServiceNet/ElvesServiceNet 保持同款运行时映射
function mapCharacterServerId(id: string): string {
    const n = Number(id)
    return isFinite(n) && n > 100000 ? String((n - 100001) % 6 + 1).padStart(3, "0") : id
}
function mapElvesServerId(id: string): string {
    const n = Number(id)
    return isFinite(n) && n > 200000 ? String((n - 200001) % 3 + 1).padStart(3, "0") : id
}

class VolumeDetail {
    // 战斗音量
    fight: number = 1
    // 家园音量
    home: number = 1
    // 角色音量
    character: number = 1

    constructor(v?: Partial<VolumeDetail>) {
        if (!v) return
        Object.keys(v).forEach(k => this[k] = v[k])
    }
}

class UserData extends Resource{

    public lv: number = 1

    public exp: number = 0

    public name: string = "用户12138"

    // uuid 计数器（持久化，保证跨会话不重复）
    public lastUuid: number = 0

    // 生成下一个 uuid
    public nextUuid(): number {
        return ++this.lastUuid
    }

    public backpack: ItemCreateData[] = []

    public equipments: EquipmentCreateData[] = []

    public characters: CharacterCreateData[] = []

    public characterQueue: CharacterCreateData[] = []

    
    public elves: ElvesCreateData[] = []

    public elvesQueue: ElvesCreateData[] = []

    public skills: SkillCreateData[] = []

    constructor(or?: Partial<UserData>) {
        super()
        if (!or) return
        this.lv = or.lv ?? 1
        this.exp = or.exp ?? 0
        this.gold = or.gold ?? 1000
        this.diamond = or.diamond ?? 100
        this.soul = or.soul ?? 1000
        // 恢复 uuid 计数器
        this.lastUuid = or.lastUuid || 0

        // 原有角色（旧缓存可能是未映射的服务端编号，恢复时映射并丢弃无对应枚举的脏数据，防止流入战斗场景崩溃）
        ;(or.characters || []).forEach(c => {
            const id = mapCharacterServerId(c.id)
            if (!CharacterEnum[id]) return console.warn(`[Config] 丢弃无元数据的缓存角色 id=${c.id}`)
            this.addNewCharacter({...c , id})
        })
        // 原有出战角色
        ;(or.characterQueue || []).forEach(c => {
            const id = mapCharacterServerId(c.id)
            if (!CharacterEnum[id]) return console.warn(`[Config] 丢弃无元数据的缓存出战角色 id=${c.id}`)
            this.characterQueue.push({...c , id , uuid: this.nextUuid()})
        })

        // 原有精灵
        or?.elves?.forEach(c => {
            const id = mapElvesServerId(c.id)
            if (!ElvesEnum[id]) return console.warn(`[Config] 丢弃无元数据的缓存精灵 id=${c.id}`)
            this.addNewElves({...c , id})
        })
        // 原有出战精灵
        or?.elvesQueue?.forEach(c => {
            const id = mapElvesServerId(c.id)
            if (!ElvesEnum[id]) return console.warn(`[Config] 丢弃无元数据的缓存出战精灵 id=${c.id}`)
            this.elvesQueue.push({...c , id , uuid: this.nextUuid()})
        })
        // 原有的技能
        or?.skills?.forEach(i => this.addNewSkill(i.id , i.number))
        // 原有的物品
        or?.backpack?.forEach(i => this.addNewItem(i.id , i.number))
        // 原有装备
        or?.equipments?.forEach(e => { this.addNewEquipment(e.id , e.lv,e.name) })
        // 原来的计时
        this.challengeTime = {
            goldMap: or.challengeTime?.goldMap || 1
        }
    }

    // 所有挑战时间
    public challengeTime = {
        // 金币矿山的上一次挑战时间
        goldMap: 1
    }

    // 添加新装备
    public addNewEquipment(id: string , lv?: number,name?:string) {
        this.equipments.push({
            id ,
            lv: lv || 1 ,
            uuid: this.nextUuid(),
            name:name
        })
    }

    // 添加新角色
    public addNewCharacter(character: CharacterCreateData) {
        const equipment: EquipmentCreateData[] = [];
        (character.equipments || []).forEach(e => equipment.push({...e , uuid: this.nextUuid()}))
        this.characters.push({
            ...character ,
            star: character.star || 1 ,
            equipments: equipment ,
            uuid: this.nextUuid()
        })
    }

    // 添加新精灵
    public addNewElves(elves: ElvesCreateData) {
        const equipment: EquipmentCreateData[] = [];
        (elves.equipments || []).forEach(e => equipment.push({...e , uuid: this.nextUuid()}))
        this.elves.push({
            ...elves ,
            star: elves.star || 1 ,
            equipments: equipment ,
            uuid: this.nextUuid()
        })
    }

    // 添加新技能
    public addNewSkill(id: string , num: number) {
        this.skills.push({id , number: num})
    }

    // 添加新物品
    public addNewItem(id: string , num: number) {
        this.backpack.push({id , number: num})
    }
}

class Config {

    // 用户数据
    public userData: UserData = new UserData()

    // 总音量
    public volume: number = 0.1

    // 详细音量
    public volumeDetail: VolumeDetail = new VolumeDetail

    constructor(con?: Partial<Config>) {
        if (!con) return
        Object.keys(con).forEach(k => this[k] = con[k])
        this.userData = new UserData(con.userData)
        this.volumeDetail = new VolumeDetail(con.volumeDetail)
    }

}

// 如果没有用户数据则创建一个新的数据
let config: Config = null

// 存储config信息
export function stockConfig() {
    localStorage.setItem("UserConfigData" , JSON.stringify(config))
}

// 获取config
export function getConfig() {
    if (config) return config
    const configJSON = localStorage.getItem("UserConfigData")
    console.log("configJSON："+configJSON);
    if(configJSON){
        try {
            config = new Config(JSON.parse(configJSON))
        } catch (e) {
            console.error("[Config] 本地缓存损坏或格式不兼容，已重置用户数据", e)
            config = new Config
        }
    }else{
        config = new Config
    }
    //config = configJSON ? new Config(JSON.parse( configJSON )) : new Config
    return config
}