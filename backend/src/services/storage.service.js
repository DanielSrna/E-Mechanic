import { Storage } from '@google-cloud/storage';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import logger from '../utils/logger.js';
import { env } from '../config/env.config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let gcsClient = null;
let gcsBucket = null;

function initGCS() {
  if (gcsClient) return true;

  if (env.GCS_BUCKET_NAME && env.GCS_PROJECT_ID) {
    try {
      const credentials = env.GCS_CLIENT_EMAIL
        ? {
            client_email: env.GCS_CLIENT_EMAIL,
            private_key: env.GCS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          }
        : undefined;

      gcsClient = new Storage({
        projectId: env.GCS_PROJECT_ID,
        credentials: credentials || undefined,
      });
      gcsBucket = gcsClient.bucket(env.GCS_BUCKET_NAME);
      logger.exito(
        'Google Cloud Storage configurado: bucket %s',
        env.GCS_BUCKET_NAME
      );
      return true;
    } catch (error) {
      logger.fracaso('Error inicializando GCS: %s', error.message);
      return false;
    }
  }

  logger.proceso('GCS no configurado. Usando almacenamiento local.');
  return false;
}

function getLocalPath(subdir, filename) {
  const uploadsDir = path.join(__dirname, '../../uploads', subdir);
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  return path.join(uploadsDir, filename);
}

export async function uploadFile(fileBuffer, originalName, subdir) {
  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const ext = path.extname(originalName).toLowerCase();
  const filename = `${uniqueSuffix}${ext}`;

  if (initGCS()) {
    try {
      const gcsPath = `${subdir}/${filename}`;
      const blob = gcsBucket.file(gcsPath);
      await blob.save(fileBuffer, {
        contentType: `image/${ext === '.jpg' ? 'jpeg' : ext.slice(1)}`,
      });

      const publicUrl = `https://storage.googleapis.com/${env.GCS_BUCKET_NAME}/${gcsPath}`;
      logger.exito('Archivo subido a GCS: %s', publicUrl);
      return publicUrl;
    } catch (error) {
      logger.fracaso(
        'Error subiendo a GCS, fallback a local: %s',
        error.message
      );
    }
  }

  const localPath = getLocalPath(subdir, filename);
  fs.writeFileSync(localPath, fileBuffer);
  logger.exito('Archivo guardado localmente: %s', localPath);
  return localPath;
}

export async function deleteFile(filePath) {
  if (!filePath) return;

  if (initGCS() && filePath.includes('storage.googleapis.com')) {
    try {
      const url = new URL(filePath);
      const gcsPath = url.pathname.substring(
        1 + env.GCS_BUCKET_NAME.length + 1
      );
      await gcsBucket.file(gcsPath).delete();
      logger.exito('Archivo eliminado de GCS: %s', gcsPath);
      return;
    } catch (error) {
      logger.fracaso('Error eliminando de GCS: %s', error.message);
    }
  }

  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.exito('Archivo eliminado localmente: %s', filePath);
    }
  } catch {
    /* file may not exist */
  }
}
