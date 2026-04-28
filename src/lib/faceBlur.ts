import type { BlazeFaceModel } from "@tensorflow-models/blazeface";

let modelPromise: Promise<BlazeFaceModel> | null = null;

async function getModel(): Promise<BlazeFaceModel> {
  if (!modelPromise) {
    modelPromise = (async () => {
      const tf = await import("@tensorflow/tfjs");
      await tf.ready();
      console.log("[faceBlur] TF backend:", tf.getBackend());
      const blazeface = await import("@tensorflow-models/blazeface");
      const model = await blazeface.load({
        maxFaces: 30,
        scoreThreshold: 0.3,  // low threshold — post-filters handle false positives
        iouThreshold: 0.3,
      });
      console.log("[faceBlur] model ready");
      return model;
    })().catch((err) => {
      console.error("[faceBlur] model load failed:", err);
      modelPromise = null;
      throw err;
    });
  }
  return modelPromise;
}

function iou(
  a: [number, number, number, number],
  b: [number, number, number, number]
): number {
  const ix1 = Math.max(a[0], b[0]);
  const iy1 = Math.max(a[1], b[1]);
  const ix2 = Math.min(a[2], b[2]);
  const iy2 = Math.min(a[3], b[3]);
  const interW = Math.max(0, ix2 - ix1);
  const interH = Math.max(0, iy2 - iy1);
  const inter  = interW * interH;
  if (inter === 0) return 0;
  const areaA  = (a[2] - a[0]) * (a[3] - a[1]);
  const areaB  = (b[2] - b[0]) * (b[3] - b[1]);
  return inter / (areaA + areaB - inter);
}

/** Non-maximum suppression: merge boxes with IOU > threshold, keep the union. */
function nmsBoxes(
  boxes: Array<{ x1: number; y1: number; x2: number; y2: number; score: number }>
): Array<{ x1: number; y1: number; x2: number; y2: number }> {
  const sorted = [...boxes].sort((a, b) => b.score - a.score);
  const kept: typeof sorted = [];

  for (const box of sorted) {
    const overlaps = kept.some(
      (k) => iou([k.x1, k.y1, k.x2, k.y2], [box.x1, box.y1, box.x2, box.y2]) > 0.3
    );
    if (!overlaps) kept.push(box);
  }

  return kept.map(({ x1, y1, x2, y2 }) => ({ x1, y1, x2, y2 }));
}

function pixelate(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  blockSize: number
) {
  for (let row = y; row < y + h; row += blockSize) {
    for (let col = x; col < x + w; col += blockSize) {
      const bw = Math.min(blockSize, x + w - col);
      const bh = Math.min(blockSize, y + h - row);
      const pixel = ctx.getImageData((col + bw / 2) | 0, (row + bh / 2) | 0, 1, 1).data;
      ctx.fillStyle = `rgb(${pixel[0]},${pixel[1]},${pixel[2]})`;
      ctx.fillRect(col, row, bw, bh);
    }
  }
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
    img.src = url;
  });
}

function renderToCanvas(
  img: HTMLImageElement | HTMLCanvasElement,
  width: number,
  height: number
): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width  = width;
  c.height = height;
  c.getContext("2d")!.drawImage(img, 0, 0, width, height);
  return c;
}

export async function blurFacesInFile(file: File): Promise<File> {
  try {
    const model = await getModel();
    const img   = await loadImage(file);
    const W     = img.naturalWidth;
    const H     = img.naturalHeight;

    // Run detection at multiple scales to catch both large close-up and small distant faces
    const targetWidths = [W, 960, 640, 480, 320].filter(
      (w, i, arr) => w <= W && arr.indexOf(w) === i
    );

    const rawBoxes: Array<{ x1: number; y1: number; x2: number; y2: number; score: number }> = [];

    for (const tw of targetWidths) {
      const scale = tw / W;
      const th    = Math.round(H * scale);
      const src   = scale === 1 ? img : renderToCanvas(img, tw, th);
      const preds = await model.estimateFaces(src, false);

      for (const pred of preds) {
        const [sx1, sy1] = pred.topLeft  as [number, number];
        const [sx2, sy2] = pred.bottomRight as [number, number];
        rawBoxes.push({
          x1: sx1 / scale,
          y1: sy1 / scale,
          x2: sx2 / scale,
          y2: sy2 / scale,
          score: ((pred.probability as unknown) as number[])?.[0] ?? 1,
        });
      }
    }

    // Size filter: face must be at least 2% of shorter image side and have a plausible aspect ratio
    const minDim = Math.min(W, H) * 0.02;
    const filtered = rawBoxes.filter(({ x1, y1, x2, y2 }) => {
      const w = x2 - x1;
      const h = y2 - y1;
      const ar = w / h;
      return w >= minDim && h >= minDim && ar > 0.3 && ar < 3.0;
    });

    // NMS to remove duplicate detections of the same face across scales
    const merged = nmsBoxes(filtered);

    console.log(
      `[faceBlur] "${file.name}": ${rawBoxes.length} raw → ${filtered.length} filtered → ${merged.length} final face(s)`
    );
    if (merged.length === 0) return file;

    const canvas = renderToCanvas(img, W, H);
    const ctx    = canvas.getContext("2d")!;

    for (const { x1, y1, x2, y2 } of merged) {
      const w  = x2 - x1;
      const h  = y2 - y1;

      // Asymmetric padding: more top (hair) than bottom (chin)
      const padL = 0.30, padR = 0.30, padT = 0.45, padB = 0.20;
      const px  = Math.max(0, x1 - w * padL);
      const py  = Math.max(0, y1 - h * padT);
      const pw  = Math.min(W - px, w + w * (padL + padR));
      const ph  = Math.min(H - py, h + h * (padT + padB));
      const blk = Math.max(14, Math.floor(Math.min(w, h) / 6));

      pixelate(ctx, Math.floor(px), Math.floor(py), Math.ceil(pw), Math.ceil(ph), blk);
    }

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => resolve(new File([blob!], file.name, { type: file.type, lastModified: file.lastModified })),
        file.type,
        0.92
      );
    });
  } catch (err) {
    console.error("[faceBlur] failed, returning original:", err);
    return file;
  }
}
