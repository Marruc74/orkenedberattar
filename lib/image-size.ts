import fs from 'node:fs';
import path from 'node:path';

/**
 * Reads pixel size from a JPEG or PNG header in public/, so pages can reserve
 * the right space before the image loads. Returns undefined if unreadable.
 */
export function imageSize(publicSrc: string): { width: number; height: number } | undefined {
  let buf: Buffer;
  try {
    buf = fs.readFileSync(path.join(process.cwd(), 'public', publicSrc));
  } catch {
    return undefined;
  }

  // PNG: width/height in the IHDR chunk.
  if (buf.readUInt32BE(0) === 0x89504e47) return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };

  // JPEG: walk the segments until a start-of-frame marker.
  if (buf[0] !== 0xff || buf[1] !== 0xd8) return undefined;
  let i = 2;
  while (i + 9 < buf.length) {
    if (buf[i] !== 0xff) return undefined;
    const marker = buf[i + 1];
    const isSof = marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (isSof) return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
    i += 2 + buf.readUInt16BE(i + 2);
  }
  return undefined;
}
