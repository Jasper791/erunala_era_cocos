const WebSocket = require('ws');
const ws = new WebSocket('ws://127.0.0.1:10100/websocket', { binaryType: 'arraybuffer' });
ws.on('open', () => {
  console.log('connected');
  const cmdMerge = (5 << 16) | 0;  // PropAction.queryPropAllPage
  const buf = Buffer.concat([
    Buffer.from([0x08, 0x01]),           // cmdCode=1 (业务)
    Buffer.from([0x10, 0x00]),           // protocolSwitch=0
    Buffer.from([0x18]),                 // cmdMerge varint
    varintBuf(cmdMerge),
    Buffer.from([0x20, 0x00]),           // responseStatus=0
    Buffer.from([0x2a, 0x00]),           // validMsg=""
    Buffer.from([0x32, 0x00]),           // dataContent len=0
  ]);
  console.log('sending cmdMerge=5*65536+0=' + cmdMerge);
  ws.send(buf);
});
ws.on('message', (data) => {
  console.log('response hex:', Buffer.from(data).toString('hex'));
  ws.close();
  process.exit(0);
});
setTimeout(() => { console.log('timeout'); ws.close(); process.exit(1); }, 8000);

function varintBuf(n) {
  const arr = [];
  while (n > 127) { arr.push((n & 0x7f) | 0x80); n >>= 7; }
  arr.push(n);
  return Buffer.from(arr);
}
