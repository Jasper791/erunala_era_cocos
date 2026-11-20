import { _decorator, Component, Label, Node, Sprite } from 'cc';
const { ccclass, property } = _decorator;

 interface UserInfo {
    userIcon: Sprite;
    userName: string;
    userID: string;
}

@ccclass('UserInfoComponent')
export class UserInfoComponent extends Component {
    @property({type: Sprite,tooltip: '用户头像'})
    public userIcon: Sprite = null;
    
    @property({type: Label,tooltip: '用户名称'})
    public userName: Label = null;
    
    @property({type: Label,tooltip: '用户ID'})
    public userID: Label = null;

    start() {

    }

    update(deltaTime: number) {
        
    }

    updateUserInfo({userIcon,userName,userID}: UserInfo){ 
        if(this.userIcon && userIcon){
            this.userIcon.spriteFrame = userIcon.spriteFrame;
        }

        if(this.userName && userName){
            this.userName.getComponent(Label).string = userName;
        }

        if(this.userID && userID){
            this.userID.getComponent(Label).string = userID;
        }
    }
}

