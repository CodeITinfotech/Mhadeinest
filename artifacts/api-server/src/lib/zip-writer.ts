import { deflateRawSync } from "zlib";

const CRC32_TABLE: number[] = (() => {
  const t: number[] = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[i] = c;
  }
  return t;
})();

function crc32(data: Buffer): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc = (crc >>> 8) ^ CRC32_TABLE[(crc ^ data[i]) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

interface ZipEntry {
  name: string;
  data: Buffer;
}

export function createZipBuffer(entries: ZipEntry[]): Buffer {
  const now = new Date();
  const dosTime =
    (now.getHours() << 11) | (now.getMinutes() << 5) | ((now.getSeconds() >> 1) & 0x1f);
  const dosDate =
    ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();

  const localParts: Buffer[] = [];
  const centralParts: Buffer[] = [];
  const offsets: number[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBytes = Buffer.from(entry.name, "utf8");
    const compressed = deflateRawSync(entry.data, { level: 6 });
    const crc = crc32(entry.data);
    const uncompSize = entry.data.length;
    const compSize = compressed.length;

    // Local file header (30 bytes) + filename + compressed data
    const local = Buffer.alloc(30 + nameBytes.length);
    local.writeUInt32LE(0x04034b50, 0);   // signature
    local.writeUInt16LE(20, 4);            // version needed: 2.0
    local.writeUInt16LE(0x0800, 6);        // flags: UTF-8 filename
    local.writeUInt16LE(8, 8);             // compression: deflate
    local.writeUInt16LE(dosTime, 10);
    local.writeUInt16LE(dosDate, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(compSize, 18);
    local.writeUInt32LE(uncompSize, 22);
    local.writeUInt16LE(nameBytes.length, 26);
    local.writeUInt16LE(0, 28);            // extra field length
    nameBytes.copy(local, 30);

    offsets.push(offset);
    offset += local.length + compSize;
    localParts.push(local, compressed);

    // Central directory header (46 bytes) + filename
    const cd = Buffer.alloc(46 + nameBytes.length);
    cd.writeUInt32LE(0x02014b50, 0);   // signature
    cd.writeUInt16LE(20, 4);            // version made by
    cd.writeUInt16LE(20, 6);            // version needed
    cd.writeUInt16LE(0x0800, 8);        // flags: UTF-8 filename
    cd.writeUInt16LE(8, 10);            // compression: deflate
    cd.writeUInt16LE(dosTime, 12);
    cd.writeUInt16LE(dosDate, 14);
    cd.writeUInt32LE(crc, 16);
    cd.writeUInt32LE(compSize, 20);
    cd.writeUInt32LE(uncompSize, 24);
    cd.writeUInt16LE(nameBytes.length, 28);
    cd.writeUInt16LE(0, 30);            // extra field length
    cd.writeUInt16LE(0, 32);            // file comment length
    cd.writeUInt16LE(0, 34);            // disk number start
    cd.writeUInt16LE(0, 36);            // internal attributes
    cd.writeUInt32LE(0, 38);            // external attributes
    cd.writeUInt32LE(offsets[offsets.length - 1], 42); // local header offset
    nameBytes.copy(cd, 46);
    centralParts.push(cd);
  }

  const cdBuf = Buffer.concat(centralParts);
  const cdOffset = offset;
  const cdSize = cdBuf.length;

  // End of central directory record (22 bytes)
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);      // signature
  eocd.writeUInt16LE(0, 4);               // disk number
  eocd.writeUInt16LE(0, 6);               // start disk
  eocd.writeUInt16LE(entries.length, 8);  // entries on this disk
  eocd.writeUInt16LE(entries.length, 10); // total entries
  eocd.writeUInt32LE(cdSize, 12);         // central directory size
  eocd.writeUInt32LE(cdOffset, 16);       // central directory offset
  eocd.writeUInt16LE(0, 20);             // comment length

  return Buffer.concat([...localParts, cdBuf, eocd]);
}
