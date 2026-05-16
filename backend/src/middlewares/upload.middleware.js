import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../../uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const MAGIC_SIGNATURES = {
  jpeg: [0xff, 0xd8, 0xff],
  png: [0x89, 0x50, 0x4e, 0x47],
  gif: [0x47, 0x49, 0x46, 0x38],
  webp: [
    [0x52, 0x49, 0x46, 0x46],
    [0x57, 0x45, 0x42, 0x50],
  ],
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;

function checkMagicNumbers(buffer) {
  if (buffer.length < 12) return false;

  const bytes = (i) => buffer[i];

  if (
    bytes(0) === MAGIC_SIGNATURES.jpeg[0] &&
    bytes(1) === MAGIC_SIGNATURES.jpeg[1] &&
    bytes(2) === MAGIC_SIGNATURES.jpeg[2]
  )
    return true;

  if (
    bytes(0) === MAGIC_SIGNATURES.png[0] &&
    bytes(1) === MAGIC_SIGNATURES.png[1] &&
    bytes(2) === MAGIC_SIGNATURES.png[2] &&
    bytes(3) === MAGIC_SIGNATURES.png[3]
  )
    return true;

  if (
    bytes(0) === MAGIC_SIGNATURES.gif[0] &&
    bytes(1) === MAGIC_SIGNATURES.gif[1] &&
    bytes(2) === MAGIC_SIGNATURES.gif[2]
  )
    return true;

  if (
    bytes(0) === MAGIC_SIGNATURES.webp[0][0] &&
    bytes(1) === MAGIC_SIGNATURES.webp[0][1] &&
    bytes(2) === MAGIC_SIGNATURES.webp[0][2] &&
    bytes(3) === MAGIC_SIGNATURES.webp[0][3] &&
    bytes(8) === MAGIC_SIGNATURES.webp[1][0] &&
    bytes(9) === MAGIC_SIGNATURES.webp[1][1] &&
    bytes(10) === MAGIC_SIGNATURES.webp[1][2] &&
    bytes(11) === MAGIC_SIGNATURES.webp[1][3]
  )
    return true;

  return false;
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const subdir = req.uploadSubdir || '';
    const dest = path.join(uploadsDir, subdir);
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

export const uploadSingle = (fieldName, subdir = '') => {
  return (req, res, next) => {
    req.uploadSubdir = subdir;

    const upload = multer({
      storage,
      limits: { fileSize: MAX_FILE_SIZE },
      fileFilter: (req, file, cb) => {
        if (!ALLOWED_MIMES.includes(file.mimetype)) {
          return cb(
            new Error(
              'Tipo de archivo no permitido. Solo JPEG, PNG, WebP y GIF.'
            )
          );
        }
        cb(null, true);
      },
    }).single(fieldName);

    upload(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            message: 'El archivo excede el tamaño máximo de 5MB.',
          });
        }
        return res.status(400).json({ message: err.message });
      }

      if (req.file) {
        const buffer = fs.readFileSync(req.file.path);
        if (!checkMagicNumbers(buffer)) {
          fs.unlinkSync(req.file.path);
          return res.status(400).json({
            message:
              'El archivo no es una imagen válida. Se detectó firma incorrecta.',
          });
        }
      }

      next();
    });
  };
};

export const uploadMultiple = (fieldName, maxCount = 5, subdir = '') => {
  return (req, res, next) => {
    req.uploadSubdir = subdir;

    const upload = multer({
      storage,
      limits: { fileSize: MAX_FILE_SIZE },
      fileFilter: (req, file, cb) => {
        if (!ALLOWED_MIMES.includes(file.mimetype)) {
          return cb(
            new Error(
              'Tipo de archivo no permitido. Solo JPEG, PNG, WebP y GIF.'
            )
          );
        }
        cb(null, true);
      },
    }).array(fieldName, maxCount);

    upload(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            message: 'El archivo excede el tamaño máximo de 5MB.',
          });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            message: `Máximo ${maxCount} archivos permitidos.`,
          });
        }
        return res.status(400).json({ message: err.message });
      }

      if (req.files && req.files.length) {
        for (const file of req.files) {
          const buffer = fs.readFileSync(file.path);
          if (!checkMagicNumbers(buffer)) {
            for (const f of req.files) fs.unlinkSync(f.path);
            return res.status(400).json({
              message:
                'Uno de los archivos no es una imagen válida. Se detectó firma incorrecta.',
            });
          }
        }
      }

      next();
    });
  };
};
