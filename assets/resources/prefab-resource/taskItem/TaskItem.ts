import { _decorator, Button, Component, Label, ProgressBar, Sprite } from 'cc';
import ChainBizServiceNet from '../../../serviceNet/ChainBizServiceNet';
import { ChainBizStateText, ChainBizTypeLabel } from '../../../serviceNet/chain/ChainBizType';
const { ccclass, property } = _decorator;

@ccclass('TaskItem')
export class TaskItem extends Component {
    @property({ type: Label, tooltip: '任务名' })
    public taskName: Label = null

    @property({ type: Sprite, tooltip: '奖励1' })
    public reward1: Sprite = null

    @property({ type: Sprite, tooltip: '奖励2' })
    public reward2: Sprite = null

    @property({ type: ProgressBar, tooltip: '进度' })
    public progressBar: ProgressBar = null

    @property({ type: Label, tooltip: '当前进度' })
    public currentProgress: Label = null

    @property({ type: Button, tooltip: '按钮' })
    public btn: Button = null

    /**
     * 上链中间状态记录（对应服务端 ChainBiz：uuid/address/hashCode/bizType/symbol/amount/state/updateTime）
     * state: 0发起 1待查阅 2上链中 3失败 4拒绝 5完成
     */
    public init(data: { uuid: string; hashCode: string; bizType: number; symbol: string; amount: number; state: number }) {
        const label = ChainBizTypeLabel[data?.bizType] ?? ("业务类型 " + data?.bizType)
        const amountText = data?.symbol ? ` ${data?.amount ?? 0} ${data.symbol}` : ""
        if (this.taskName) this.taskName.string = label + amountText
        if (this.currentProgress) this.currentProgress.string = ChainBizStateText[data?.state] ?? ("未知状态 " + data?.state)
        if (this.progressBar) this.progressBar.progress = Math.max(0, Math.min(1, (data?.state ?? 0) / 5))
        // 奖励图标对上链业务无意义，隐藏
        if (this.reward1) this.reward1.node.active = false
        if (this.reward2) this.reward2.node.active = false
        // 仅「已发起(state=0)」的记录允许删除，按钮复用为删除入口
        if (this.btn) {
            const canDelete = data?.state === 0
            this.btn.node.active = canDelete
            if (canDelete) {
                const lbl = this.btn.node.getComponentInChildren(Label)
                if (lbl) lbl.string = "删除"
                this.btn.node.off(Button.EventType.CLICK)
                this.btn.node.on(Button.EventType.CLICK, () => {
                    ChainBizServiceNet.deleteChainBiz(data.uuid)
                    this.node.destroy()
                })
            }
        }
    }

    start() {

    }
}
