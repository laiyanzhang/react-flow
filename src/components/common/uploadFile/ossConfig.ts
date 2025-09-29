import { getStsToken } from '@/api/upload';

declare const OSS: any;

interface UploadCallbacks {
  onProgress?: (progress: number, checkpoint?: any, res?: any) => void;
  onSuccess?: (url: string, response: any) => void;
  onError?: (error: any) => void;
}

export async function uploadFile(
  file: File,
  { onProgress, onSuccess, onError }: UploadCallbacks
) {
  try {
    // Step 1: 获取 STS 临时凭证
    const params = {
      fileName: file.name,
      userId: 12345,
      libraryId: 'lib-001',
      type: 1,
    };
    let { data: credentials }: any = await getStsToken(params);

    // Step 2: 初始化 OSS 客户端
    const client = new OSS({
      bucket: credentials.bucket,
      region: credentials.region,
      accessKeyId: credentials.accessKeyId,
      accessKeySecret: credentials.accessKeySecret,
      stsToken: credentials.securityToken,
      secure: true,
      refreshSTSToken: async () => {
        const { data: newCreds }: any = await getStsToken(params);
        credentials = newCreds;
        return {
          accessKeyId: credentials.accessKeyId,
          accessKeySecret: credentials.accessKeySecret,
          stsToken: credentials.securityToken,
        };
      },
    });

    // Step 3: 拼接文件路径
    const objectKey = `${credentials.dir}${credentials.fileName}`;

    // Step 4: 上传文件
    const response = await client.put(objectKey, file, {
      progress: (p: number, cpt: number, res: any) => {
        onProgress?.(p, cpt, res);
      },
    });

    const fileUrl = response.url;

    // Step 5: 成功回调
    onSuccess?.(fileUrl, response);

    return {
      success: true,
      url: fileUrl,
      response,
    };
  } catch (err) {
    console.error('Upload failed:', err);
    onError?.(err);
    return {
      success: false,
      error: err,
    };
  }
}
