export const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2 MB
export const MAX_IMAGE_LABEL = "2 MB";
export const ALLOWED_IMAGE_LABEL = "JPG, PNG ou WebP";

export type ParsedImage = {
  data: Uint8Array<ArrayBuffer>;
  type: string;
};

/** Detecta o tipo real da imagem pela assinatura do arquivo. */
export function sniffImageType(bytes: Uint8Array): string | null {
  if (bytes.length < 12) return null;

  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }

  const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (png.every((byte, index) => bytes[index] === byte)) {
    return "image/png";
  }

  const riff = [0x52, 0x49, 0x46, 0x46];
  const webp = [0x57, 0x45, 0x42, 0x50];
  if (
    riff.every((byte, index) => bytes[index] === byte) &&
    webp.every((byte, index) => bytes[index + 8] === byte)
  ) {
    return "image/webp";
  }

  return null;
}

export async function parseImageUpload(
  value: FormDataEntryValue | null,
): Promise<{ image: ParsedImage | null; error: string | null }> {
  if (!(value instanceof File) || value.size === 0) {
    return { image: null, error: null };
  }

  if (value.size > MAX_IMAGE_BYTES) {
    return {
      image: null,
      error: `A imagem deve ter no máximo ${MAX_IMAGE_LABEL}.`,
    };
  }

  const data = new Uint8Array(await value.arrayBuffer());
  const type = sniffImageType(data);

  if (!type) {
    return {
      image: null,
      error: `Formato inválido. Envie ${ALLOWED_IMAGE_LABEL}.`,
    };
  }

  return { image: { data, type }, error: null };
}
