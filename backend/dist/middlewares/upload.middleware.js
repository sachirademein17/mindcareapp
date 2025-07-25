"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMiddleware = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path_1.default.extname(file.originalname))
});
exports.upload = (0, multer_1.default)({ storage });
const uploadMiddleware = (req, res, next) => {
    exports.upload.array('documents', 5)(req, res, (err) => {
        if (err) {
            return res.status(400).json({ error: 'File upload failed', details: err.message });
        }
        next();
    });
};
exports.uploadMiddleware = uploadMiddleware;
