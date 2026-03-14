export type ResizeImageOptions = {
  maxWidth: number
  maxHeight: number
  quality?: number
  outputType?: 'image/jpeg' | 'image/webp' | 'image/png'
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const img = new Image()

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(img)
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Không thể đọc ảnh đã chọn.'))
    }

    img.src = objectUrl
  })
}

function calculateSize(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number
) {
  let targetWidth = width
  let targetHeight = height

  if (targetWidth > maxWidth) {
    const ratio = maxWidth / targetWidth
    targetWidth = maxWidth
    targetHeight = Math.round(targetHeight * ratio)
  }

  if (targetHeight > maxHeight) {
    const ratio = maxHeight / targetHeight
    targetHeight = maxHeight
    targetWidth = Math.round(targetWidth * ratio)
  }

  return {
    width: targetWidth,
    height: targetHeight,
  }
}

export async function resizeImageFile(
  file: File,
  options: ResizeImageOptions
): Promise<File> {
  const {
    maxWidth,
    maxHeight,
    quality = 0.82,
    outputType = 'image/jpeg',
  } = options

  const image = await loadImageFromFile(file)

  const { width, height } = calculateSize(
    image.width,
    image.height,
    maxWidth,
    maxHeight
  )

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Trình duyệt không hỗ trợ xử lý ảnh.')
  }

  ctx.drawImage(image, 0, 0, width, height)

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, outputType, quality)
  })

  if (!blob) {
    throw new Error('Không thể nén ảnh.')
  }

  const extension =
    outputType === 'image/png'
      ? 'png'
      : outputType === 'image/webp'
      ? 'webp'
      : 'jpg'

  const originalBaseName =
    file.name.replace(/\.[^/.]+$/, '').replace(/\s+/g, '-').toLowerCase() || 'image'

  return new File([blob], `${originalBaseName}-optimized.${extension}`, {
    type: outputType,
    lastModified: Date.now(),
  })
}