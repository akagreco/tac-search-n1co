export function createDHash(grayscalePixels: Uint8Array, width = 9, height = 8) {
  if (width !== 9 || height !== 8 || grayscalePixels.length < width * height) {
    throw new Error("dHash requiere una matriz de 9 × 8 píxeles en escala de grises");
  }
  let bits = "";
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width - 1; x += 1) {
      bits += grayscalePixels[y * width + x] > grayscalePixels[y * width + x + 1] ? "1" : "0";
    }
  }
  return BigInt(`0b${bits}`).toString(16).padStart(16, "0");
}

export function hammingDistance(hashA: string, hashB: string) {
  if (!/^[0-9a-f]{16}$/i.test(hashA) || !/^[0-9a-f]{16}$/i.test(hashB)) return Number.POSITIVE_INFINITY;
  let xor = BigInt(`0x${hashA}`) ^ BigInt(`0x${hashB}`);
  let distance = 0;
  while (xor > 0n) {
    distance += Number(xor & 1n);
    xor >>= 1n;
  }
  return distance;
}
