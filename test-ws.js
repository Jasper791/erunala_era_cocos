const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const protoDir = path.join(__dirname, 'assets', 'serviceNet', 'protocol');
const outDir = path.join(__dirname, '_proto_build');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

const files = ['MyExternalMessage.ts', 'LoginVerifyProto.ts', 'ResponseProto.ts'];
for (const f of files) {
  const src = fs.readFileSync(path.join(protoDir, f), 'utf-8');
  const r = ts.transpileModule(src, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019 },
  });
  fs.writeFileSync(path.join(outDir, f.replace('.ts', '.js')), r.outputText);
}

const { encodeMyExternalMessage, decodeMyExternalMessage } = require(path.join(outDir, 'MyExternalMessage.js'));
const { encodeLoginVerifyProto, decodeLoginVerifyProto } = require(path.join(outDir, 'LoginVerifyProto.js'));
const { decodeResponseProto } = require(path.join(outDir, 'ResponseProto.js'));

const WS_URL = 'ws://127.0.0.1:10100/websocket';
const CMD_LOGIN = 1;
const SUB_LOGIN_VERIFY_PROTO = 0;
const SUB_LOGIN_VERIFY = 1;
const CMD_MERGE_0 = (CMD_LOGIN << 16) | SUB_LOGIN_VERIFY_PROTO;
const CMD_MERGE_1 = (CMD_LOGIN << 16) | SUB_LOGIN_VERIFY;
const CMD_MERGE_FAKE = (99 << 16) | 99;
const TEST_ADDRESS = '0x1234567890abcdef1234567890abcdef12345678';

async function run() {
  return new Promise((resolve) => {
    console.log('=== ioGame WebSocket 联调测试 ===');
    console.log('WS URL:', WS_URL);

    const ws = new WebSocket(WS_URL, { binaryType: 'arraybuffer' });
    const EXPECTED_REPLIES = 4;
    let msgCount = 0;

    const done = () => {
      if (msgCount >= EXPECTED_REPLIES) {
        clearTimeout(timeout);
        ws.close();
        resolve();
      }
    };

    const timeout = setTimeout(() => {
      console.log('\n!!! 20s 超时，共收到', msgCount, '条响应');
      ws.close();
      resolve();
    }, 20000);

    ws.on('open', () => {
      console.log('✓ WebSocket 已连接');

      console.log('\n→ [1/4] 心跳 cmdMerge=0');
      ws.send(encodeMyExternalMessage({ cmdMerge: 0 }));

      setTimeout(() => {
        const fakeOuter = encodeMyExternalMessage({
          cmdCode: 1, protocolSwitch: 0,
          cmdMerge: CMD_MERGE_FAKE, responseStatus: 0, validMsg: "",
          dataContent: encodeLoginVerifyProto({ address: TEST_ADDRESS }),
        });
        console.log('\n→ [2/4] fake 路由 cmdMerge=99*65536+99');
        ws.send(fakeOuter);
      }, 1000);

      setTimeout(() => {
        const loginOuter = encodeMyExternalMessage({
          cmdCode: 1, protocolSwitch: 0,
          cmdMerge: CMD_MERGE_1, responseStatus: 0, validMsg: "",
          dataContent: encodeLoginVerifyProto({ address: TEST_ADDRESS, account: 'testuser', password: '123456' }),
        });
        console.log('\n→ [3/4] loginVerify cmdMerge=65537 (subCmd=1 账号密码)');
        ws.send(loginOuter);
      }, 2500);

      setTimeout(() => {
        const loginOuter2 = encodeMyExternalMessage({
          cmdCode: 1, protocolSwitch: 0,
          cmdMerge: CMD_MERGE_0, responseStatus: 0, validMsg: "",
          dataContent: encodeLoginVerifyProto({ address: TEST_ADDRESS }),
        });
        console.log('\n→ [4/4] loginVerifyProto cmdMerge=65536 (subCmd=0 钱包无签名)');
        ws.send(loginOuter2);
      }, 4000);
    });

    ws.on('message', (data) => {
      msgCount++;
      const bytes = new Uint8Array(data);
      console.log(`\n← 响应 #${msgCount}:`);
      console.log('  hex:', Buffer.from(bytes).toString('hex'));

      let outer;
      try { outer = decodeMyExternalMessage(bytes); }
      catch (e) { console.log('  !!! 外层解码失败:', e.message); return; }

      const cmd = (outer.cmdMerge || 0) >> 16;
      const subCmd = (outer.cmdMerge || 0) & 0xFFFF;
      console.log(`  cmdMerge=${outer.cmdMerge} (cmd=${cmd}, subCmd=${subCmd}) responseStatus=${outer.responseStatus} validMsg="${outer.validMsg}"`);

      if (!outer.dataContent || outer.dataContent.length === 0) {
        console.log('  ↳ 空包');
        done();
        return;
      }

      try {
        const resp = decodeResponseProto(outer.dataContent);
        console.log(`  ResponseProto: code=${resp.code} success=${resp.success} msg="${resp.msg}"`);
        if (resp.data) console.log(`  data="${resp.data}"`);
        if (resp.method) console.log(`  method="${resp.method}"`);

        if (resp.code === 1001) {
          console.log('\n  ★★★ 服务端正确返回 challenge（无签名需下发 nonce）');
          try {
            const ch = JSON.parse(resp.data || '{}');
            console.log('    nonce:', ch.nonce);
            console.log('    message:', ch.message);
          } catch (e) {}
        } else if (resp.code === 200) {
          console.log('\n  ★★★ 登录成功！');
        }
      } catch (e) {
        console.log('  !!! ResponseProto 解码失败:', e.message);
      }

      done();
    });

    ws.on('error', (err) => {
      console.log('!!! WebSocket error:', err.message);
      clearTimeout(timeout);
      resolve();
    });

    ws.on('close', () => {
      console.log('\n=== 连接关闭 ===');
      clearTimeout(timeout);
      resolve();
    });
  });
}

run().then(() => process.exit(0));