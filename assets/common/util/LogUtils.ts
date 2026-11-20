
import { _decorator, Component, Node, sys } from 'cc';
const { ccclass, property } = _decorator;

export default class LogUtils {

    public static isDebug: boolean = true;

    public static log(message?: any, ...optionalParams: any) {
        if (!this.isDebug) return;
        console.log(message, ...optionalParams);
    }

    public static error(message?: any, ...optionalParams: any) {
        if (!this.isDebug) return;
        console.error(message, ...optionalParams);
    }
    public static warn(message?: any, ...optionalParams: any) {
        if (!this.isDebug) return;
        console.warn(message, ...optionalParams);
    }
}
