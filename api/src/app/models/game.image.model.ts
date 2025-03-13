import { getPool } from "../../config/db";
import Logger from "../../config/logger";
import * as storage from "../services/storage";

export async function setImage(gameId: number, image: Buffer, ext: string): Promise<void> {
    // Write to disk
    const filename = `game_${gameId}.${ext}`;
    storage.writeImage(filename, image);

    // Update DB
    Logger.info(`Setting game #${gameId} image to ${filename}`);
    const conn = await getPool().getConnection();
    const query = "UPDATE game SET image_filename = ? WHERE game.id = ?";
    await conn.query(query, [filename, gameId]);
    conn.release();
}