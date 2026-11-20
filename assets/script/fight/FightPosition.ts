export const BottomPosition: {x: number , y: number}[][] = [
    [{x: -200, y: -360} , {x: 0, y: -360} , {x: 200, y: -360}] ,
    [{x: -200, y: -560} , {x: 0, y: -560} , {x: 200, y: -560}] ,
    [{x: -200, y: -740} , {x: 0, y: -740} , {x: 200, y: -740}] ,
]

export const TopPosition: {x: number , y: number}[][] = [
    [{x: -200, y: 360} , {x: 0, y: 360} , {x: 200, y: 360}] ,
    [{x: -200, y: 560} , {x: 0, y: 560} , {x: 200, y: 560}] ,
    [{x: -200, y: 740} , {x: 0, y: 740} , {x: 200, y: 740}] ,
]

export const BottomAttackPosition: {x: number , y: number}[][] = []
export const TopAttackPosition: {x: number , y: number}[][] = []

for (let i = 0; i < 3; i++) {
    BottomAttackPosition.push([])
    TopAttackPosition.push([])
    for (let j = 0; j < 3; j++) {
        // 攻击位 = 敌方半场对应格子的面前（向中线回退 140，避免与目标重叠）：
        // 我方单位攻击时冲到敌方(row,clo)格面前；敌方单位同理冲到我方格面前
        BottomAttackPosition[i][j] = {
            x: TopPosition[i][j].x,
            y: TopPosition[i][j].y - 140
        }
        TopAttackPosition[i][j] = {
            x: BottomPosition[i][j].x,
            y: BottomPosition[i][j].y + 140
        }
    }
}

export const LeftPosition = BottomPosition
export const LeftAttackPosition = BottomAttackPosition