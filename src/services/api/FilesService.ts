import sharp from 'sharp';
import { compress } from 'compress-pdf';
import { arrayBufferToString } from 'next/dist/server/app-render/encryption-utils';
import EasyYandexS3 from 'easy-yandex-s3';
import crypto from 'crypto';
import { S3 } from 'aws-sdk';

const s3 = new EasyYandexS3({
  auth: {
    accessKeyId: process.env.YANDEX_CLOUD_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.YANDEX_CLOUD_SECRET_ACCESS_KEY || '',
  },
  httpOptions: {
    timeout: 60000,
  },
  Bucket: process.env.YANDEX_CLOUD_BUCKET || 'gptutor-bucket',
  debug: true,
});

class FilesService {
  getExtension(fileName: string): string {
    const splitFileName = fileName.split('.');
    return splitFileName[splitFileName.length - 1];
  }

  getFileWithExtension(name: string, originalFileName: string) {
    return `${name}.${this.getExtension(originalFileName)}`;
  }

  async optimizePhotos(arrayBuffer: ArrayBuffer, fileName: string) {
    try {
      let extension = this.getExtension(fileName);

      if (extension === 'jpg') {
        extension = 'jpeg';
      }

      const createdSharp = sharp(arrayBuffer);
      if (extension in createdSharp) {
        // @ts-ignore
        return await createdSharp[extension]({ quality: 60 }).toBuffer();
      }

      return arrayBuffer;
    } catch (error) {
      console.log(error);
      return arrayBuffer;
    }
  }

  async optimizeAttachment(arrayBuffer: ArrayBuffer, fileName: string) {
    const typeFile = this.determineFileType(fileName);

    if (typeFile === 'photo') {
      return new Uint8Array(await this.optimizePhotos(arrayBuffer, fileName));
    }

    if (typeFile === 'text') {
      return arrayBufferToString(arrayBuffer);
    }

    const extension = this.getExtension(fileName);

    if (extension === 'pdf') {
      return await compress(Buffer.from(arrayBuffer));
    }

    if (extension === 'pptx') {
      return Buffer.from(arrayBuffer);
    }

    return arrayBuffer;
  }

  determineFileType(filename: string): 'photo' | 'document' | 'text' {
    if (filename.length === 0) {
      throw new Error('Invalid filename: Must be a non-empty string.');
    }

    const photoExtensions: string[] = [
      'jpg',
      'jpeg',
      'png',
      'gif',
      'bmp',
      'svg',
      'webp',
      'tiff',
      'tif',
    ];

    const documentExtensions: string[] = [
      'pdf',
      'doc',
      'docx',
      'xls',
      'xlsx',
      'csv',
    ];

    const textExtensions: string[] = [
      'txt', // Явный текстовый файл
      'js', // JavaScript
      'html', // HTML
      'css', // CSS
      'json', // JSON
      'xml', // XML
      'md', // Markdown
      'log', // Log files
      'py', // Python
      'java', // Java
      'c', // C
      'cpp', // C++
      'h', // Header files
      'sh', // Shell script
      'config', // Configuration files
      'conf', // Configuration files
      'ini', // INI files
      'yml', // YAML
      'yaml', // YAML
      'sql', // SQL scripts
    ];

    const dotIndex: number = filename.lastIndexOf('.');

    if (dotIndex === -1 || dotIndex === filename.length - 1) {
      throw new Error(`Unknown file type: '${filename}' has no extension.`);
    }

    const extension: string = filename.slice(dotIndex + 1).toLowerCase();

    if (photoExtensions.includes(extension)) {
      return 'photo';
    } else if (documentExtensions.includes(extension)) {
      return 'document';
    } else if (textExtensions.includes(extension)) {
      return 'text';
    } else {
      throw new Error(
        `Unknown or unsupported file type with extension '.${extension}'.`,
      );
    }
  }

  async uploadFile(
    arrayBuffer: ArrayBuffer | string,
    name: string,
  ): Promise<S3.ManagedUpload.SendData> {
    return (await s3.Upload(
      {
        //@ts-ignore
        buffer: arrayBuffer,
        name: this.getFileWithExtension(crypto.randomUUID(), name),
      },
      '/',
    )) as S3.ManagedUpload.SendData;
  }

  async deleteFile(url: string): Promise<boolean> {
    return (await s3.Remove(
      url.replace('https://gptutor-bucket.storage.yandexcloud.net/', ''),
    )) as boolean;
  }
}

export const filesService = new FilesService();
