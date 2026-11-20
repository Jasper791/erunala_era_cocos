import { _decorator, Component, director, find, Node, Prefab, resources } from 'cc';
import { util } from '../../common/util/Util';
const { ccclass, property } = _decorator;

@ccclass('UiScreenComponent')
export class UiScreenComponent extends Component {

    // 去城镇
    public async goHome() {
        await util.scene.go("Home")
    }

    // 去英雄界面
    public async goHero() {
        await util.scene.go("Hero")
    }

    // 去精灵界面
    public async goElves() {
        await util.scene.go("Elves")
    }

    // 去关卡界面
    public async goLevel() {
        await util.scene.go("Level")
    }

    // 去背包界面
    public async goBackpack() {
        await util.scene.go("Backpack")
    }

    // 去竞技界面
    public async goChallenge() {
        await util.scene.go("Challenge")
    }

    // 去钱包界面
    public async goWallet() {
        await util.scene.go("Wallet")
    }

    // 去布阵
    public async goTeamForm() {
        await util.scene.go("Team")
    }
}


