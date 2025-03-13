import { getPool } from "../../config/db";
import Logger from "../../config/logger";
import { DB_User } from "../interfaces/user.interface";
import * as storage from "../services/storage";

export async function setImage(user: DB_User, image: Buffer, ext: string): Promise<void> {
    // Write to disk
    const filename = `user_${user.id}.${ext}`;
    storage.writeImage(filename, image);

    // Update DB
    Logger.info(`Setting user ${user.email} image to ${filename}`);
    const conn = await getPool().getConnection();
    const query = "UPDATE user SET image_filename = ? WHERE user.id = ?";
    await conn.query(query, [filename, user.id]);
    conn.release();
}

export async function deleteImage(user: DB_User): Promise<void> {
    Logger.info(`Deleting image of user ${user.email}`);

    // Delete from disk
    // controller has already checked user.image_filename is set
    storage.deleteImage(user.image_filename!);

    // Update DB
    const conn = await getPool().getConnection();
    const query = "UPDATE user SET image_filename = NULL WHERE user.id = ?";
    await conn.query(query, [user.id]);
    conn.release();
}