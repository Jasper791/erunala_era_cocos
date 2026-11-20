export interface ElvesProto {
  id?: Long;
  elvesId?: Long;
  userAddress?: string;
  name?: string;
  image?: string;
  attr?: number;
  elvesType?: number;
  sex?: number;
  wear?: number;
  abrasion?: number;
  lv?: number;
  exp?: Long;
  power?: Long;
  tmpPower?: Long;
  hp?: Long;
  tmpHp?: Long;
  ad?: Long;
  ap?: Long;
  addef?: Long;
  apdef?: Long;
  dodeg?: number;
  pierce?: number;
  critical?: number;
  intro?: string;
  prefabPath?: string;
  state?: number;
  createTime?: string;
  rarityTier?: number;
  isShiny?: number;
  isFirstEdition?: number;
  collectionId?: number;
  cardNumber?: number;
  mintQuality?: number;
  psaScore?: number;
  psaValidator?: string;
  psaCertId?: string;
  psaTimestamp?: Long;
  psaMetadataUri?: string;
  speed?: number;
  block?: number;
  star?: number;
  curePercent?: number;
  generation?: number;
  lastBreedTime?: Long;
  gene?: Long;
}

export function encodeElvesProto(message: ElvesProto): Uint8Array {
  let bb = popByteBuffer();
  _encodeElvesProto(message, bb);
  return toUint8Array(bb);
}

function _encodeElvesProto(message: ElvesProto, bb: ByteBuffer): void {
  // optional int64 id = 1;
  let $id = message.id;
  if ($id !== undefined) {
    writeVarint32(bb, 8);
    writeVarint64(bb, $id);
  }

  // optional int64 elvesId = 2;
  let $elvesId = message.elvesId;
  if ($elvesId !== undefined) {
    writeVarint32(bb, 16);
    writeVarint64(bb, $elvesId);
  }

  // optional string userAddress = 3;
  let $userAddress = message.userAddress;
  if ($userAddress !== undefined) {
    writeVarint32(bb, 26);
    writeString(bb, $userAddress);
  }

  // optional string name = 4;
  let $name = message.name;
  if ($name !== undefined) {
    writeVarint32(bb, 34);
    writeString(bb, $name);
  }

  // optional string image = 5;
  let $image = message.image;
  if ($image !== undefined) {
    writeVarint32(bb, 42);
    writeString(bb, $image);
  }

  // optional int32 attr = 6;
  let $attr = message.attr;
  if ($attr !== undefined) {
    writeVarint32(bb, 48);
    writeVarint64(bb, intToLong($attr));
  }

  // optional int32 elvesType = 7;
  let $elvesType = message.elvesType;
  if ($elvesType !== undefined) {
    writeVarint32(bb, 56);
    writeVarint64(bb, intToLong($elvesType));
  }

  // optional int32 sex = 8;
  let $sex = message.sex;
  if ($sex !== undefined) {
    writeVarint32(bb, 64);
    writeVarint64(bb, intToLong($sex));
  }

  // optional int32 wear = 9;
  let $wear = message.wear;
  if ($wear !== undefined) {
    writeVarint32(bb, 72);
    writeVarint64(bb, intToLong($wear));
  }

  // optional int32 abrasion = 10;
  let $abrasion = message.abrasion;
  if ($abrasion !== undefined) {
    writeVarint32(bb, 80);
    writeVarint64(bb, intToLong($abrasion));
  }

  // optional int32 lv = 11;
  let $lv = message.lv;
  if ($lv !== undefined) {
    writeVarint32(bb, 88);
    writeVarint64(bb, intToLong($lv));
  }

  // optional int64 exp = 12;
  let $exp = message.exp;
  if ($exp !== undefined) {
    writeVarint32(bb, 96);
    writeVarint64(bb, $exp);
  }

  // optional int64 power = 13;
  let $power = message.power;
  if ($power !== undefined) {
    writeVarint32(bb, 104);
    writeVarint64(bb, $power);
  }

  // optional int64 tmpPower = 14;
  let $tmpPower = message.tmpPower;
  if ($tmpPower !== undefined) {
    writeVarint32(bb, 112);
    writeVarint64(bb, $tmpPower);
  }

  // optional int64 hp = 15;
  let $hp = message.hp;
  if ($hp !== undefined) {
    writeVarint32(bb, 120);
    writeVarint64(bb, $hp);
  }

  // optional int64 tmpHp = 16;
  let $tmpHp = message.tmpHp;
  if ($tmpHp !== undefined) {
    writeVarint32(bb, 128);
    writeVarint64(bb, $tmpHp);
  }

  // optional int64 ad = 17;
  let $ad = message.ad;
  if ($ad !== undefined) {
    writeVarint32(bb, 136);
    writeVarint64(bb, $ad);
  }

  // optional int64 ap = 18;
  let $ap = message.ap;
  if ($ap !== undefined) {
    writeVarint32(bb, 144);
    writeVarint64(bb, $ap);
  }

  // optional int64 addef = 19;
  let $addef = message.addef;
  if ($addef !== undefined) {
    writeVarint32(bb, 152);
    writeVarint64(bb, $addef);
  }

  // optional int64 apdef = 20;
  let $apdef = message.apdef;
  if ($apdef !== undefined) {
    writeVarint32(bb, 160);
    writeVarint64(bb, $apdef);
  }

  // optional int32 dodeg = 21;
  let $dodeg = message.dodeg;
  if ($dodeg !== undefined) {
    writeVarint32(bb, 168);
    writeVarint64(bb, intToLong($dodeg));
  }

  // optional int32 pierce = 22;
  let $pierce = message.pierce;
  if ($pierce !== undefined) {
    writeVarint32(bb, 176);
    writeVarint64(bb, intToLong($pierce));
  }

  // optional int32 critical = 23;
  let $critical = message.critical;
  if ($critical !== undefined) {
    writeVarint32(bb, 184);
    writeVarint64(bb, intToLong($critical));
  }

  // optional string intro = 24;
  let $intro = message.intro;
  if ($intro !== undefined) {
    writeVarint32(bb, 194);
    writeString(bb, $intro);
  }

  // optional string prefabPath = 25;
  let $prefabPath = message.prefabPath;
  if ($prefabPath !== undefined) {
    writeVarint32(bb, 202);
    writeString(bb, $prefabPath);
  }

  // optional int32 state = 26;
  let $state = message.state;
  if ($state !== undefined) {
    writeVarint32(bb, 208);
    writeVarint64(bb, intToLong($state));
  }

  // optional string createTime = 27;
  let $createTime = message.createTime;
  if ($createTime !== undefined) {
    writeVarint32(bb, 218);
    writeString(bb, $createTime);
  }

  // optional int32 rarityTier = 28;
  let $rarityTier = message.rarityTier;
  if ($rarityTier !== undefined) {
    writeVarint32(bb, 224);
    writeVarint64(bb, intToLong($rarityTier));
  }

  // optional int32 isShiny = 29;
  let $isShiny = message.isShiny;
  if ($isShiny !== undefined) {
    writeVarint32(bb, 232);
    writeVarint64(bb, intToLong($isShiny));
  }

  // optional int32 isFirstEdition = 30;
  let $isFirstEdition = message.isFirstEdition;
  if ($isFirstEdition !== undefined) {
    writeVarint32(bb, 240);
    writeVarint64(bb, intToLong($isFirstEdition));
  }

  // optional int32 collectionId = 31;
  let $collectionId = message.collectionId;
  if ($collectionId !== undefined) {
    writeVarint32(bb, 248);
    writeVarint64(bb, intToLong($collectionId));
  }

  // optional int32 cardNumber = 32;
  let $cardNumber = message.cardNumber;
  if ($cardNumber !== undefined) {
    writeVarint32(bb, 256);
    writeVarint64(bb, intToLong($cardNumber));
  }

  // optional int32 mintQuality = 33;
  let $mintQuality = message.mintQuality;
  if ($mintQuality !== undefined) {
    writeVarint32(bb, 264);
    writeVarint64(bb, intToLong($mintQuality));
  }

  // optional int32 psaScore = 34;
  let $psaScore = message.psaScore;
  if ($psaScore !== undefined) {
    writeVarint32(bb, 272);
    writeVarint64(bb, intToLong($psaScore));
  }

  // optional string psaValidator = 35;
  let $psaValidator = message.psaValidator;
  if ($psaValidator !== undefined) {
    writeVarint32(bb, 282);
    writeString(bb, $psaValidator);
  }

  // optional string psaCertId = 36;
  let $psaCertId = message.psaCertId;
  if ($psaCertId !== undefined) {
    writeVarint32(bb, 290);
    writeString(bb, $psaCertId);
  }

  // optional int64 psaTimestamp = 37;
  let $psaTimestamp = message.psaTimestamp;
  if ($psaTimestamp !== undefined) {
    writeVarint32(bb, 296);
    writeVarint64(bb, $psaTimestamp);
  }

  // optional string psaMetadataUri = 38;
  let $psaMetadataUri = message.psaMetadataUri;
  if ($psaMetadataUri !== undefined) {
    writeVarint32(bb, 306);
    writeString(bb, $psaMetadataUri);
  }

  // optional int32 speed = 39;
  let $speed = message.speed;
  if ($speed !== undefined) {
    writeVarint32(bb, 312);
    writeVarint64(bb, intToLong($speed));
  }

  // optional int32 block = 40;
  let $block = message.block;
  if ($block !== undefined) {
    writeVarint32(bb, 320);
    writeVarint64(bb, intToLong($block));
  }

  // optional int32 star = 41;
  let $star = message.star;
  if ($star !== undefined) {
    writeVarint32(bb, 328);
    writeVarint64(bb, intToLong($star));
  }

  // optional int32 curePercent = 42;
  let $curePercent = message.curePercent;
  if ($curePercent !== undefined) {
    writeVarint32(bb, 336);
    writeVarint64(bb, intToLong($curePercent));
  }

  // optional int32 generation = 43;
  let $generation = message.generation;
  if ($generation !== undefined) {
    writeVarint32(bb, 344);
    writeVarint64(bb, intToLong($generation));
  }

  // optional int64 lastBreedTime = 44;
  let $lastBreedTime = message.lastBreedTime;
  if ($lastBreedTime !== undefined) {
    writeVarint32(bb, 352);
    writeVarint64(bb, $lastBreedTime);
  }

  // optional int64 gene = 45;
  let $gene = message.gene;
  if ($gene !== undefined) {
    writeVarint32(bb, 360);
    writeVarint64(bb, $gene);
  }
}

export function decodeElvesProto(binary: Uint8Array): ElvesProto {
  return _decodeElvesProto(wrapByteBuffer(binary));
}

function _decodeElvesProto(bb: ByteBuffer): ElvesProto {
  let message: ElvesProto = {} as any;

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // optional int64 id = 1;
      case 1: {
        message.id = readVarint64(bb, /* unsigned */ false);
        break;
      }

      // optional int64 elvesId = 2;
      case 2: {
        message.elvesId = readVarint64(bb, /* unsigned */ false);
        break;
      }

      // optional string userAddress = 3;
      case 3: {
        message.userAddress = readString(bb, readVarint32(bb));
        break;
      }

      // optional string name = 4;
      case 4: {
        message.name = readString(bb, readVarint32(bb));
        break;
      }

      // optional string image = 5;
      case 5: {
        message.image = readString(bb, readVarint32(bb));
        break;
      }

      // optional int32 attr = 6;
      case 6: {
        message.attr = readVarint32(bb);
        break;
      }

      // optional int32 elvesType = 7;
      case 7: {
        message.elvesType = readVarint32(bb);
        break;
      }

      // optional int32 sex = 8;
      case 8: {
        message.sex = readVarint32(bb);
        break;
      }

      // optional int32 wear = 9;
      case 9: {
        message.wear = readVarint32(bb);
        break;
      }

      // optional int32 abrasion = 10;
      case 10: {
        message.abrasion = readVarint32(bb);
        break;
      }

      // optional int32 lv = 11;
      case 11: {
        message.lv = readVarint32(bb);
        break;
      }

      // optional int64 exp = 12;
      case 12: {
        message.exp = readVarint64(bb, /* unsigned */ false);
        break;
      }

      // optional int64 power = 13;
      case 13: {
        message.power = readVarint64(bb, /* unsigned */ false);
        break;
      }

      // optional int64 tmpPower = 14;
      case 14: {
        message.tmpPower = readVarint64(bb, /* unsigned */ false);
        break;
      }

      // optional int64 hp = 15;
      case 15: {
        message.hp = readVarint64(bb, /* unsigned */ false);
        break;
      }

      // optional int64 tmpHp = 16;
      case 16: {
        message.tmpHp = readVarint64(bb, /* unsigned */ false);
        break;
      }

      // optional int64 ad = 17;
      case 17: {
        message.ad = readVarint64(bb, /* unsigned */ false);
        break;
      }

      // optional int64 ap = 18;
      case 18: {
        message.ap = readVarint64(bb, /* unsigned */ false);
        break;
      }

      // optional int64 addef = 19;
      case 19: {
        message.addef = readVarint64(bb, /* unsigned */ false);
        break;
      }

      // optional int64 apdef = 20;
      case 20: {
        message.apdef = readVarint64(bb, /* unsigned */ false);
        break;
      }

      // optional int32 dodeg = 21;
      case 21: {
        message.dodeg = readVarint32(bb);
        break;
      }

      // optional int32 pierce = 22;
      case 22: {
        message.pierce = readVarint32(bb);
        break;
      }

      // optional int32 critical = 23;
      case 23: {
        message.critical = readVarint32(bb);
        break;
      }

      // optional string intro = 24;
      case 24: {
        message.intro = readString(bb, readVarint32(bb));
        break;
      }

      // optional string prefabPath = 25;
      case 25: {
        message.prefabPath = readString(bb, readVarint32(bb));
        break;
      }

      // optional int32 state = 26;
      case 26: {
        message.state = readVarint32(bb);
        break;
      }

      // optional string createTime = 27;
      case 27: {
        message.createTime = readString(bb, readVarint32(bb));
        break;
      }

      // optional int32 rarityTier = 28;
      case 28: {
        message.rarityTier = readVarint32(bb);
        break;
      }

      // optional int32 isShiny = 29;
      case 29: {
        message.isShiny = readVarint32(bb);
        break;
      }

      // optional int32 isFirstEdition = 30;
      case 30: {
        message.isFirstEdition = readVarint32(bb);
        break;
      }

      // optional int32 collectionId = 31;
      case 31: {
        message.collectionId = readVarint32(bb);
        break;
      }

      // optional int32 cardNumber = 32;
      case 32: {
        message.cardNumber = readVarint32(bb);
        break;
      }

      // optional int32 mintQuality = 33;
      case 33: {
        message.mintQuality = readVarint32(bb);
        break;
      }

      // optional int32 psaScore = 34;
      case 34: {
        message.psaScore = readVarint32(bb);
        break;
      }

      // optional string psaValidator = 35;
      case 35: {
        message.psaValidator = readString(bb, readVarint32(bb));
        break;
      }

      // optional string psaCertId = 36;
      case 36: {
        message.psaCertId = readString(bb, readVarint32(bb));
        break;
      }

      // optional int64 psaTimestamp = 37;
      case 37: {
        message.psaTimestamp = readVarint64(bb, /* unsigned */ false);
        break;
      }

      // optional string psaMetadataUri = 38;
      case 38: {
        message.psaMetadataUri = readString(bb, readVarint32(bb));
        break;
      }

      // optional int32 speed = 39;
      case 39: {
        message.speed = readVarint32(bb);
        break;
      }

      // optional int32 block = 40;
      case 40: {
        message.block = readVarint32(bb);
        break;
      }

      // optional int32 star = 41;
      case 41: {
        message.star = readVarint32(bb);
        break;
      }

      // optional int32 curePercent = 42;
      case 42: {
        message.curePercent = readVarint32(bb);
        break;
      }

      // optional int32 generation = 43;
      case 43: {
        message.generation = readVarint32(bb);
        break;
      }

      // optional int64 lastBreedTime = 44;
      case 44: {
        message.lastBreedTime = readVarint64(bb, /* unsigned */ false);
        break;
      }

      // optional int64 gene = 45;
      case 45: {
        message.gene = readVarint64(bb, /* unsigned */ false);
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export interface Long {
  low: number;
  high: number;
  unsigned: boolean;
}

interface ByteBuffer {
  bytes: Uint8Array;
  offset: number;
  limit: number;
}

function pushTemporaryLength(bb: ByteBuffer): number {
  let length = readVarint32(bb);
  let limit = bb.limit;
  bb.limit = bb.offset + length;
  return limit;
}

function skipUnknownField(bb: ByteBuffer, type: number): void {
  switch (type) {
    case 0: while (readByte(bb) & 0x80) { } break;
    case 2: skip(bb, readVarint32(bb)); break;
    case 5: skip(bb, 4); break;
    case 1: skip(bb, 8); break;
    default: throw new Error("Unimplemented type: " + type);
  }
}

function stringToLong(value: string): Long {
  return {
    low: value.charCodeAt(0) | (value.charCodeAt(1) << 16),
    high: value.charCodeAt(2) | (value.charCodeAt(3) << 16),
    unsigned: false,
  };
}

function longToString(value: Long): string {
  let low = value.low;
  let high = value.high;
  return String.fromCharCode(
    low & 0xFFFF,
    low >>> 16,
    high & 0xFFFF,
    high >>> 16);
}

// The code below was modified from https://github.com/protobufjs/bytebuffer.js
// which is under the Apache License 2.0.

let f32 = new Float32Array(1);
let f32_u8 = new Uint8Array(f32.buffer);

let f64 = new Float64Array(1);
let f64_u8 = new Uint8Array(f64.buffer);

function intToLong(value: number): Long {
  value |= 0;
  return {
    low: value,
    high: value >> 31,
    unsigned: value >= 0,
  };
}

let bbStack: ByteBuffer[] = [];

function popByteBuffer(): ByteBuffer {
  const bb = bbStack.pop();
  if (!bb) return { bytes: new Uint8Array(64), offset: 0, limit: 0 };
  bb.offset = bb.limit = 0;
  return bb;
}

function pushByteBuffer(bb: ByteBuffer): void {
  bbStack.push(bb);
}

function wrapByteBuffer(bytes: Uint8Array): ByteBuffer {
  return { bytes, offset: 0, limit: bytes.length };
}

function toUint8Array(bb: ByteBuffer): Uint8Array {
  let bytes = bb.bytes;
  let limit = bb.limit;
  return bytes.length === limit ? bytes : bytes.subarray(0, limit);
}

function skip(bb: ByteBuffer, offset: number): void {
  if (bb.offset + offset > bb.limit) {
    throw new Error('Skip past limit');
  }
  bb.offset += offset;
}

function isAtEnd(bb: ByteBuffer): boolean {
  return bb.offset >= bb.limit;
}

function grow(bb: ByteBuffer, count: number): number {
  let bytes = bb.bytes;
  let offset = bb.offset;
  let limit = bb.limit;
  let finalOffset = offset + count;
  if (finalOffset > bytes.length) {
    let newBytes = new Uint8Array(finalOffset * 2);
    newBytes.set(bytes);
    bb.bytes = newBytes;
  }
  bb.offset = finalOffset;
  if (finalOffset > limit) {
    bb.limit = finalOffset;
  }
  return offset;
}

function advance(bb: ByteBuffer, count: number): number {
  let offset = bb.offset;
  if (offset + count > bb.limit) {
    throw new Error('Read past limit');
  }
  bb.offset += count;
  return offset;
}

function readBytes(bb: ByteBuffer, count: number): Uint8Array {
  let offset = advance(bb, count);
  return bb.bytes.subarray(offset, offset + count);
}

function writeBytes(bb: ByteBuffer, buffer: Uint8Array): void {
  let offset = grow(bb, buffer.length);
  bb.bytes.set(buffer, offset);
}

function readString(bb: ByteBuffer, count: number): string {
  // Sadly a hand-coded UTF8 decoder is much faster than subarray+TextDecoder in V8
  let offset = advance(bb, count);
  let fromCharCode = String.fromCharCode;
  let bytes = bb.bytes;
  let invalid = '\uFFFD';
  let text = '';

  for (let i = 0; i < count; i++) {
    let c1 = bytes[i + offset], c2: number, c3: number, c4: number, c: number;

    // 1 byte
    if ((c1 & 0x80) === 0) {
      text += fromCharCode(c1);
    }

    // 2 bytes
    else if ((c1 & 0xE0) === 0xC0) {
      if (i + 1 >= count) text += invalid;
      else {
        c2 = bytes[i + offset + 1];
        if ((c2 & 0xC0) !== 0x80) text += invalid;
        else {
          c = ((c1 & 0x1F) << 6) | (c2 & 0x3F);
          if (c < 0x80) text += invalid;
          else {
            text += fromCharCode(c);
            i++;
          }
        }
      }
    }

    // 3 bytes
    else if ((c1 & 0xF0) == 0xE0) {
      if (i + 2 >= count) text += invalid;
      else {
        c2 = bytes[i + offset + 1];
        c3 = bytes[i + offset + 2];
        if (((c2 | (c3 << 8)) & 0xC0C0) !== 0x8080) text += invalid;
        else {
          c = ((c1 & 0x0F) << 12) | ((c2 & 0x3F) << 6) | (c3 & 0x3F);
          if (c < 0x0800 || (c >= 0xD800 && c <= 0xDFFF)) text += invalid;
          else {
            text += fromCharCode(c);
            i += 2;
          }
        }
      }
    }

    // 4 bytes
    else if ((c1 & 0xF8) == 0xF0) {
      if (i + 3 >= count) text += invalid;
      else {
        c2 = bytes[i + offset + 1];
        c3 = bytes[i + offset + 2];
        c4 = bytes[i + offset + 3];
        if (((c2 | (c3 << 8) | (c4 << 16)) & 0xC0C0C0) !== 0x808080) text += invalid;
        else {
          c = ((c1 & 0x07) << 0x12) | ((c2 & 0x3F) << 0x0C) | ((c3 & 0x3F) << 0x06) | (c4 & 0x3F);
          if (c < 0x10000 || c > 0x10FFFF) text += invalid;
          else {
            c -= 0x10000;
            text += fromCharCode((c >> 10) + 0xD800, (c & 0x3FF) + 0xDC00);
            i += 3;
          }
        }
      }
    }

    else text += invalid;
  }

  return text;
}

function writeString(bb: ByteBuffer, text: string): void {
  // Sadly a hand-coded UTF8 encoder is much faster than TextEncoder+set in V8
  let n = text.length;
  let byteCount = 0;

  // Write the byte count first
  for (let i = 0; i < n; i++) {
    let c = text.charCodeAt(i);
    if (c >= 0xD800 && c <= 0xDBFF && i + 1 < n) {
      c = (c << 10) + text.charCodeAt(++i) - 0x35FDC00;
    }
    byteCount += c < 0x80 ? 1 : c < 0x800 ? 2 : c < 0x10000 ? 3 : 4;
  }
  writeVarint32(bb, byteCount);

  let offset = grow(bb, byteCount);
  let bytes = bb.bytes;

  // Then write the bytes
  for (let i = 0; i < n; i++) {
    let c = text.charCodeAt(i);
    if (c >= 0xD800 && c <= 0xDBFF && i + 1 < n) {
      c = (c << 10) + text.charCodeAt(++i) - 0x35FDC00;
    }
    if (c < 0x80) {
      bytes[offset++] = c;
    } else {
      if (c < 0x800) {
        bytes[offset++] = ((c >> 6) & 0x1F) | 0xC0;
      } else {
        if (c < 0x10000) {
          bytes[offset++] = ((c >> 12) & 0x0F) | 0xE0;
        } else {
          bytes[offset++] = ((c >> 18) & 0x07) | 0xF0;
          bytes[offset++] = ((c >> 12) & 0x3F) | 0x80;
        }
        bytes[offset++] = ((c >> 6) & 0x3F) | 0x80;
      }
      bytes[offset++] = (c & 0x3F) | 0x80;
    }
  }
}

function writeByteBuffer(bb: ByteBuffer, buffer: ByteBuffer): void {
  let offset = grow(bb, buffer.limit);
  let from = bb.bytes;
  let to = buffer.bytes;

  // This for loop is much faster than subarray+set on V8
  for (let i = 0, n = buffer.limit; i < n; i++) {
    from[i + offset] = to[i];
  }
}

function readByte(bb: ByteBuffer): number {
  return bb.bytes[advance(bb, 1)];
}

function writeByte(bb: ByteBuffer, value: number): void {
  let offset = grow(bb, 1);
  bb.bytes[offset] = value;
}

function readFloat(bb: ByteBuffer): number {
  let offset = advance(bb, 4);
  let bytes = bb.bytes;

  // Manual copying is much faster than subarray+set in V8
  f32_u8[0] = bytes[offset++];
  f32_u8[1] = bytes[offset++];
  f32_u8[2] = bytes[offset++];
  f32_u8[3] = bytes[offset++];
  return f32[0];
}

function writeFloat(bb: ByteBuffer, value: number): void {
  let offset = grow(bb, 4);
  let bytes = bb.bytes;
  f32[0] = value;

  // Manual copying is much faster than subarray+set in V8
  bytes[offset++] = f32_u8[0];
  bytes[offset++] = f32_u8[1];
  bytes[offset++] = f32_u8[2];
  bytes[offset++] = f32_u8[3];
}

function readDouble(bb: ByteBuffer): number {
  let offset = advance(bb, 8);
  let bytes = bb.bytes;

  // Manual copying is much faster than subarray+set in V8
  f64_u8[0] = bytes[offset++];
  f64_u8[1] = bytes[offset++];
  f64_u8[2] = bytes[offset++];
  f64_u8[3] = bytes[offset++];
  f64_u8[4] = bytes[offset++];
  f64_u8[5] = bytes[offset++];
  f64_u8[6] = bytes[offset++];
  f64_u8[7] = bytes[offset++];
  return f64[0];
}

function writeDouble(bb: ByteBuffer, value: number): void {
  let offset = grow(bb, 8);
  let bytes = bb.bytes;
  f64[0] = value;

  // Manual copying is much faster than subarray+set in V8
  bytes[offset++] = f64_u8[0];
  bytes[offset++] = f64_u8[1];
  bytes[offset++] = f64_u8[2];
  bytes[offset++] = f64_u8[3];
  bytes[offset++] = f64_u8[4];
  bytes[offset++] = f64_u8[5];
  bytes[offset++] = f64_u8[6];
  bytes[offset++] = f64_u8[7];
}

function readInt32(bb: ByteBuffer): number {
  let offset = advance(bb, 4);
  let bytes = bb.bytes;
  return (
    bytes[offset] |
    (bytes[offset + 1] << 8) |
    (bytes[offset + 2] << 16) |
    (bytes[offset + 3] << 24)
  );
}

function writeInt32(bb: ByteBuffer, value: number): void {
  let offset = grow(bb, 4);
  let bytes = bb.bytes;
  bytes[offset] = value;
  bytes[offset + 1] = value >> 8;
  bytes[offset + 2] = value >> 16;
  bytes[offset + 3] = value >> 24;
}

function readInt64(bb: ByteBuffer, unsigned: boolean): Long {
  return {
    low: readInt32(bb),
    high: readInt32(bb),
    unsigned,
  };
}

function writeInt64(bb: ByteBuffer, value: Long): void {
  writeInt32(bb, value.low);
  writeInt32(bb, value.high);
}

function readVarint32(bb: ByteBuffer): number {
  let c = 0;
  let value = 0;
  let b: number;
  do {
    b = readByte(bb);
    if (c < 32) value |= (b & 0x7F) << c;
    c += 7;
  } while (b & 0x80);
  return value;
}

function writeVarint32(bb: ByteBuffer, value: number): void {
  value >>>= 0;
  while (value >= 0x80) {
    writeByte(bb, (value & 0x7f) | 0x80);
    value >>>= 7;
  }
  writeByte(bb, value);
}

function readVarint64(bb: ByteBuffer, unsigned: boolean): Long {
  let part0 = 0;
  let part1 = 0;
  let part2 = 0;
  let b: number;

  b = readByte(bb); part0 = (b & 0x7F); if (b & 0x80) {
    b = readByte(bb); part0 |= (b & 0x7F) << 7; if (b & 0x80) {
      b = readByte(bb); part0 |= (b & 0x7F) << 14; if (b & 0x80) {
        b = readByte(bb); part0 |= (b & 0x7F) << 21; if (b & 0x80) {

          b = readByte(bb); part1 = (b & 0x7F); if (b & 0x80) {
            b = readByte(bb); part1 |= (b & 0x7F) << 7; if (b & 0x80) {
              b = readByte(bb); part1 |= (b & 0x7F) << 14; if (b & 0x80) {
                b = readByte(bb); part1 |= (b & 0x7F) << 21; if (b & 0x80) {

                  b = readByte(bb); part2 = (b & 0x7F); if (b & 0x80) {
                    b = readByte(bb); part2 |= (b & 0x7F) << 7;
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  return {
    low: part0 | (part1 << 28),
    high: (part1 >>> 4) | (part2 << 24),
    unsigned,
  };
}

function writeVarint64(bb: ByteBuffer, value: Long): void {
  let part0 = value.low >>> 0;
  let part1 = ((value.low >>> 28) | (value.high << 4)) >>> 0;
  let part2 = value.high >>> 24;

  // ref: src/google/protobuf/io/coded_stream.cc
  let size =
    part2 === 0 ?
      part1 === 0 ?
        part0 < 1 << 14 ?
          part0 < 1 << 7 ? 1 : 2 :
          part0 < 1 << 21 ? 3 : 4 :
        part1 < 1 << 14 ?
          part1 < 1 << 7 ? 5 : 6 :
          part1 < 1 << 21 ? 7 : 8 :
      part2 < 1 << 7 ? 9 : 10;

  let offset = grow(bb, size);
  let bytes = bb.bytes;

  switch (size) {
    case 10: bytes[offset + 9] = (part2 >>> 7) & 0x01;
    case 9: bytes[offset + 8] = size !== 9 ? part2 | 0x80 : part2 & 0x7F;
    case 8: bytes[offset + 7] = size !== 8 ? (part1 >>> 21) | 0x80 : (part1 >>> 21) & 0x7F;
    case 7: bytes[offset + 6] = size !== 7 ? (part1 >>> 14) | 0x80 : (part1 >>> 14) & 0x7F;
    case 6: bytes[offset + 5] = size !== 6 ? (part1 >>> 7) | 0x80 : (part1 >>> 7) & 0x7F;
    case 5: bytes[offset + 4] = size !== 5 ? part1 | 0x80 : part1 & 0x7F;
    case 4: bytes[offset + 3] = size !== 4 ? (part0 >>> 21) | 0x80 : (part0 >>> 21) & 0x7F;
    case 3: bytes[offset + 2] = size !== 3 ? (part0 >>> 14) | 0x80 : (part0 >>> 14) & 0x7F;
    case 2: bytes[offset + 1] = size !== 2 ? (part0 >>> 7) | 0x80 : (part0 >>> 7) & 0x7F;
    case 1: bytes[offset] = size !== 1 ? part0 | 0x80 : part0 & 0x7F;
  }
}

function readVarint32ZigZag(bb: ByteBuffer): number {
  let value = readVarint32(bb);

  // ref: src/google/protobuf/wire_format_lite.h
  return (value >>> 1) ^ -(value & 1);
}

function writeVarint32ZigZag(bb: ByteBuffer, value: number): void {
  // ref: src/google/protobuf/wire_format_lite.h
  writeVarint32(bb, (value << 1) ^ (value >> 31));
}

function readVarint64ZigZag(bb: ByteBuffer): Long {
  let value = readVarint64(bb, /* unsigned */ false);
  let low = value.low;
  let high = value.high;
  let flip = -(low & 1);

  // ref: src/google/protobuf/wire_format_lite.h
  return {
    low: ((low >>> 1) | (high << 31)) ^ flip,
    high: (high >>> 1) ^ flip,
    unsigned: false,
  };
}

function writeVarint64ZigZag(bb: ByteBuffer, value: Long): void {
  let low = value.low;
  let high = value.high;
  let flip = high >> 31;

  // ref: src/google/protobuf/wire_format_lite.h
  writeVarint64(bb, {
    low: (low << 1) ^ flip,
    high: ((high << 1) | (low >>> 31)) ^ flip,
    unsigned: false,
  });
}
