import SocketClient from "../../common/socket/SocketClient";
import { encodeMyExternalMessage } from "../protocol/MyExternalMessage";

export default class SendMgr {
  public static send(
    mergeCmd: number,
    data: Uint8Array,
    cmdCode: number = 1,
    protocolSwitch: number = 0
  ): boolean {
    let msg = {
      cmdCode: cmdCode,
      protocolSwitch: protocolSwitch,
      cmdMerge: mergeCmd,
      responseStatus: 0,
      validMsg: "",
      dataContent: data,
    };
    return SocketClient.ins.send(encodeMyExternalMessage(msg));
  }
}
