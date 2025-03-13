import mime from "mime-types";
import fs from "mz/fs";

const VALID_IMAGE_MIME_TYPES = ["image/png", "image/jpeg", "image/gif"];
const imageDirectory = "./storage/images/";

export function isValidImageType(mimeType: string): boolean {
    return VALID_IMAGE_MIME_TYPES.includes(mimeType);
}

export function getImageMimeType(filename: string): string | false {
    const mimeType = mime.lookup(filename);

    // No mimetype exists for file extension or is not an image file
    if (!mimeType || !isValidImageType(mimeType))
        return false;

    return mimeType;
}

export async function readImage(filename: string): Promise<Buffer> {
    const filePath = imageDirectory + filename;
    return fs.readFile(filePath);
}

export async function writeImage(filename: string, image: Buffer): Promise<void> {
    const filePath = imageDirectory + filename;
    return fs.writeFile(filePath, image);
}

export function deleteImage(filename: string): void {
    const filePath = imageDirectory + filename;
    return fs.rmSync(filePath);
}