import Stream from "stream";
import { Canvas } from "canvas";

export async function image_buffer(canvas: Canvas): Promise<Buffer> {
    const passThroughStream = new Stream.PassThrough();
    const PNGData: any[] = [];
    let buffer = null;
    const stream = (canvas as any).createPNGStream({
        compressionLevel: 0
    });
    stream.pipe(passThroughStream);
    passThroughStream.on('data', chunk => PNGData.push(chunk));
    passThroughStream.on('end', () => {
        buffer = Buffer.concat(PNGData);
    });
    while (buffer == null) {
        await new Promise(r => setTimeout(r, 20));
    }
    return buffer;
}
