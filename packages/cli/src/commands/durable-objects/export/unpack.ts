import { createWriteStream } from "node:fs";
import { rm } from "node:fs/promises";
import { pipeline } from "node:stream/promises";
import { openPromise } from "yauzl";

/**
 * Turns a Durable Object export, a zip of `main.sqlite` and
 * `main.sqlite-wal`, into one SQLite file: unzip both side by side, then let
 * SQLite fold the WAL into the database by leaving WAL mode.
 *
 * Writes the database in `zipPath` to `outPath`. Returns whether the export
 * says it is incomplete, i.e. older than the object's current state.
 */
export async function unpackExport(
	zipPath: string,
	outPath: string
): Promise<{ incomplete: boolean }> {
	const wal = `${outPath}-wal`;
	const targets = new Map([
		["main.sqlite", outPath],
		["main.sqlite-wal", wal],
	]);
	const zip = await openPromise(zipPath).catch((cause: unknown) => {
		throw new Error("Export archive is truncated or corrupt.", { cause });
	});
	const names = new Set<string>();
	try {
		for await (const entry of zip.eachEntry()) {
			names.add(entry.fileName);
			const target = targets.get(entry.fileName);
			if (target !== undefined) {
				const stream = await zip.openReadStreamPromise(entry);
				await pipeline(stream, createWriteStream(target));
			}
		}
		if (!names.has("main.sqlite") || !names.has("main.sqlite-wal")) {
			throw new Error("Export archive is missing main.sqlite or its WAL.");
		}
		// Loaded here so other commands never trigger Node 22's warning.
		const { DatabaseSync } = await import("node:sqlite");
		const db = new DatabaseSync(outPath);
		db.exec("PRAGMA journal_mode = DELETE");
		db.close();
	} finally {
		await rm(wal, { force: true });
		await rm(`${outPath}-shm`, { force: true });
	}
	return { incomplete: names.has("INCOMPLETE.txt") };
}
