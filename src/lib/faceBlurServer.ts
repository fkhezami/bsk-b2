import sharp from "sharp";

interface FaceCenter {
  cx: number;  // % from left (0–100)
  cy: number;  // % from top  (0–100)
  w:  number;  // face width  as % of image width  (0–100)
}

const DETECT_PROMPT = `Look at this image carefully.

Count every human face that is clearly visible.
For EACH face provide:
  cx  — horizontal center of the face, as a percentage of image width  (0 = far left, 100 = far right)
  cy  — vertical center of the face,   as a percentage of image height (0 = top,      100 = bottom)
  w   — width of the face,             as a percentage of image width

Return ONLY a JSON array, nothing else. Example:
[{"cx": 25, "cy": 18, "w": 12}, {"cx": 70, "cy": 20, "w": 9}]

Return [] if there are absolutely no human faces visible.`;

async function detectFaces(imageBase64: string, mimeType: string): Promise<FaceCenter[]> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [{
        role: "user",
        content: [
          { type: "text", text: DETECT_PROMPT },
          { type: "image_url", image_url: { url: `data:${mimeType};base64,${imageBase64}` } },
        ],
      }],
    }),
  });

  if (!res.ok) return [];

  const data = await res.json();
  const raw: string = data.choices[0]?.message?.content?.trim() ?? "[]";
  console.log("[faceBlurServer] raw response:", raw);

  try {
    const start = raw.indexOf("[");
    const end   = raw.lastIndexOf("]");
    if (start === -1 || end === -1) return [];
    const parsed = JSON.parse(raw.slice(start, end + 1)) as FaceCenter[];
    // Validate each entry
    return parsed.filter(
      (f) =>
        typeof f.cx === "number" && f.cx >= 0 && f.cx <= 100 &&
        typeof f.cy === "number" && f.cy >= 0 && f.cy <= 100 &&
        typeof f.w  === "number" && f.w  >  1 && f.w  <= 80
    );
  } catch {
    return [];
  }
}

async function pixelateRegion(
  imgBuffer: Buffer,
  { x, y, w, h }: { x: number; y: number; w: number; h: number }
): Promise<Buffer> {
  const BLOCK = Math.max(10, Math.floor(Math.min(w, h) / 8));
  const pixelated = await sharp(imgBuffer)
    .extract({ left: x, top: y, width: w, height: h })
    .resize(Math.max(1, Math.floor(w / BLOCK)), Math.max(1, Math.floor(h / BLOCK)), { fit: "fill" })
    .resize(w, h, { fit: "fill", kernel: "nearest" })
    .toBuffer();

  return sharp(imgBuffer)
    .composite([{ input: pixelated, left: x, top: y }])
    .toBuffer();
}

export async function blurFacesServerSide(
  imageBase64: string,
  mimeType: string
): Promise<Buffer> {
  const original = Buffer.from(imageBase64, "base64");

  let faces: FaceCenter[] = [];
  try {
    faces = await detectFaces(imageBase64, mimeType);
  } catch (err) {
    console.error("[faceBlurServer] detection failed:", err);
    return original;
  }

  if (faces.length === 0) {
    console.log("[faceBlurServer] no faces detected");
    return original;
  }

  console.log(`[faceBlurServer] ${faces.length} face(s) — blurring…`);

  const meta  = await sharp(original).metadata();
  const imgW  = meta.width  ?? 1;
  const imgH  = meta.height ?? 1;

  let buf: Buffer = original;

  for (const face of faces) {
    // Convert center+width to pixel bounding box
    // Height ≈ 1.4× width to cover forehead and chin; extra top pad for hair
    const fw = (face.w / 100) * imgW;
    const fh = fw * 1.4;

    const PAD_H = 0.35;  // 35% horizontal padding
    const PAD_T = 0.45;  // 45% top padding (hair)
    const PAD_B = 0.25;  // 25% bottom padding (chin/neck)

    const cx = (face.cx / 100) * imgW;
    const cy = (face.cy / 100) * imgH;

    const x = Math.max(0,         Math.floor(cx - fw / 2 - fw * PAD_H));
    const y = Math.max(0,         Math.floor(cy - fh / 2 - fh * PAD_T));
    const x2 = Math.min(imgW,     Math.ceil (cx + fw / 2 + fw * PAD_H));
    const y2 = Math.min(imgH,     Math.ceil (cy + fh / 2 + fh * PAD_B));
    const w  = x2 - x;
    const h  = y2 - y;

    if (w < 4 || h < 4) continue;

    try {
      buf = await pixelateRegion(buf, { x, y, w, h });
      console.log(`[faceBlurServer] pixelated cx=${face.cx}% cy=${face.cy}% → x=${x} y=${y} w=${w} h=${h}`);
    } catch (err) {
      console.error("[faceBlurServer] pixelate error:", err);
    }
  }

  return buf;
}
