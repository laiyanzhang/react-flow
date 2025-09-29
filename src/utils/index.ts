import { getStsToken, upload } from '@/api/upload';

/**
 * 根据文件名判断文件类型是否为视频
 * @param filename - 文件名
 * @returns boolean - true表示是视频文件，false表示不是
 */
export const isVideoFile = (filename: string): boolean => {
  const videoExtensions = [
    '.mp4',
    '.avi',
    '.mov',
    '.wmv',
    '.flv',
    '.mkv',
    '.webm',
    '.m4v',
    '.3gp',
    '.3g2',
    '.mpg',
    '.mpeg',
  ];

  const ext = '.' + filename.split('.').pop()?.toLowerCase();
  return videoExtensions.includes(ext);
};

/**
 * 根据文件名判断文件类型是否为图片
 * @param filename - 文件名
 * @returns boolean - true表示是图片文件，false表示不是
 */
export const isImageFile = (filename: string): boolean => {
  const imageExtensions = [
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.bmp',
    '.webp',
    '.svg',
    '.tiff',
    '.ico',
  ];

  const ext = '.' + filename.split('.').pop()?.toLowerCase();
  return imageExtensions.includes(ext);
};

// get 请求特殊字符[、]接口查询异常
export const encodeReplace = (data: any) => {
  for (const key in data) {
    if (typeof data[key] === 'string') {
      data[key] = data[key].replace(/\[|]/g, '');
    }
  }

  return data;
};

/**
 * 下载文件函数
 * @param {string} url - 文件URL
 * @param {string} [filename] - 可选，自定义文件名
 */
export const downloadFile = async (url: string, filename?: string) => {
  const response = await fetch(url);
  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  if (filename) {
    link.download = filename;
  } else {
    // 尝试从URL中提取文件名
    const urlParts = url.split('/');
    const potentialFilename = urlParts[urlParts.length - 1];
    if (potentialFilename.includes('.')) {
      link.download = potentialFilename;
    }
  }
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(blobUrl);
};

/**
 * 根据文件名判断文件类型
 * @param filename - 文件名
 * @returns 'video' | 'image' | 'unknown' - 文件类型
 */
export const getFileType = (
  filename: string
): 'video' | 'image' | 'unknown' => {
  if (isVideoFile(filename)) {
    return 'video';
  }

  if (isImageFile(filename)) {
    return 'image';
  }

  return 'unknown';
};

declare const OSS: any;

// 视频上传
export const uploadVideo = async (
  file: File,
) => {
  const fileName = file.name;
  const userId = 12345;
  const params = {
    fileName: fileName,
    userId,
    libraryId: 'lib-001',
    type: 1,
  };
  const result: any = await getStsToken(params);
  let credentials = result.data;
  const client = new OSS({
    bucket: credentials.bucket,
    region: credentials.region,
    accessKeyId: credentials.accessKeyId,
    accessKeySecret: credentials.accessKeySecret,
    stsToken: credentials.securityToken,
    secure: true,
    refreshSTSToken: async () => {
      credentials = await getStsToken(params);
      return {
        accessKeyId: credentials.accessKeyId,
        accessKeySecret: credentials.accessKeySecret,
        stsToken: credentials.securityToken,
      };
    },
  });
  const name = credentials.dir + credentials.fileName;
  const response = await client.put(name, file);
  return response.url;
};

// 图片上传
export const uploadImage = async (file: File) => {
  const formData = new FormData();
  const nameType = file.name.split('.');
  const imgType = nameType[nameType.length - 1];
  formData.append('file', file);
  formData.append('fileType', imgType);
  const result: any = await upload(formData);
  return result.data;
};

/**
 * 格式化文件大小
 * @param {number} bytes - 文件大小（字节）
 * @returns {string} - 格式化后的文件大小
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * 格式化视频时长
 * @param {number} seconds - 视频时长（秒）
 * @returns {string} - 格式化后的时长 (mm:ss)
 */
export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');

  return `${formattedMinutes}:${formattedSeconds}`;
};
