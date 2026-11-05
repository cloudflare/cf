import { open } from "node:fs/promises";
import type { FileHandle } from "node:fs/promises";

/**
 * Turns a Durable Object export, a zip of `main.sqlite` and
 * `main.sqlite-wal`, into one SQLite file without needing SQLite: copy the
 * database, write each committed WAL frame's page over it, truncate to the
 * last commit's size, and switch the header out of WAL mode.
 */

const WAL_HEADER_SIZE = 32;
const FRAME_HEADER_SIZE = 24;
const CHUNK_SIZE = 1 << 20;

interface Entry {
	offset: number;
	size: number;
}

async function readAt(
	file: FileHandle,
	position: number,
	size: number
): Promise<Buffer> {
	const buf = Buffer.alloc(size);
	const { bytesRead } = await file.read(buf, 0, size, position);
	if (bytesRead !== size) {
		throw new Error("Export archive is truncated.");
	}
	return buf;
}

/** Finds the entries of a zip64 archive through its central directory. */
async function readEntries(zip: FileHandle): Promise<Map<string, Entry>> {
	const { size } = await zip.stat();
	const tail = await readAt(zip, size - 42, 42);
	if (
		tail.readUInt32LE(20) !== 0x06054b50 ||
		tail.readUInt32LE(0) !== 0x07064b50
	) {
		throw new Error("Export archive is truncated or not a zip64 archive.");
	}
	const end = await readAt(zip, Number(tail.readBigUInt64LE(8)), 56);
	const count = Number(end.readBigUInt64LE(32));
	const directory = await readAt(
		zip,
		Number(end.readBigUInt64LE(48)),
		Number(end.readBigUInt64LE(40))
	);
	const entries = new Map<string, Entry>();
	let p = 0;
	for (let i = 0; i < count; i++) {
		const nameSize = directory.readUInt16LE(p + 28);
		const extraSize = directory.readUInt16LE(p + 30);
		const commentSize = directory.readUInt16LE(p + 32);
		const name = directory.toString("utf8", p + 46, p + 46 + nameSize);
		const extra = p + 46 + nameSize;
		const local = Number(directory.readBigUInt64LE(extra + 20));
		const header = await readAt(zip, local, 30);
		entries.set(name, {
			offset: local + 30 + header.readUInt16LE(26) + header.readUInt16LE(28),
			size: Number(directory.readBigUInt64LE(extra + 4)),
		});
		p = extra + extraSize + commentSize;
	}
	return entries;
}

async function copyRange(
	from: FileHandle,
	to: FileHandle,
	{ offset, size }: Entry
): Promise<void> {
	for (let done = 0; done < size;) {
		const n = Math.min(CHUNK_SIZE, size - done);
		await to.write(await readAt(from, offset + done, n), 0, n, done);
		done += n;
	}
}

/** Applies the WAL's committed frames to `db`. */
async function applyWal(
	zip: FileHandle,
	db: FileHandle,
	{ offset, size }: Entry
): Promise<void> {
	const header = await readAt(zip, offset, WAL_HEADER_SIZE);
	const pageSize = header.readUInt32BE(8);
	const salt = header.subarray(16, 24);
	const frameSize = FRAME_HEADER_SIZE + pageSize;
	// Frames of a transaction take effect only once its commit frame is read.
	let pending: { page: number; data: Buffer }[] = [];
	let committedPages: number | undefined;
	let position = WAL_HEADER_SIZE;
	while (position + frameSize <= size) {
		const frames = Math.max(
			1,
			Math.floor(Math.min(CHUNK_SIZE, size - position) / frameSize)
		);
		const chunk = await readAt(zip, offset + position, frames * frameSize);
		for (let f = 0; f < frames; f++) {
			const frame = chunk.subarray(f * frameSize, (f + 1) * frameSize);
			if (!frame.subarray(8, 16).equals(salt)) {
				throw new Error("Export WAL is corrupt.");
			}
			pending.push({
				page: frame.readUInt32BE(0),
				data: frame.subarray(FRAME_HEADER_SIZE),
			});
			const commit = frame.readUInt32BE(4);
			if (commit !== 0) {
				for (const { page, data } of pending) {
					await db.write(data, 0, pageSize, (page - 1) * pageSize);
				}
				pending = [];
				committedPages = commit;
			}
		}
		position += frames * frameSize;
	}
	if (committedPages !== undefined) {
		await db.truncate(committedPages * pageSize);
	}
}

/**
 * Writes the database in `zipPath` to `outPath`. Returns whether the export
 * says it is incomplete, i.e. older than the object's current state.
 */
export async function unpackExport(
	zipPath: string,
	outPath: string
): Promise<{ incomplete: boolean }> {
	const zip = await open(zipPath, "r");
	try {
		const entries = await readEntries(zip);
		const database = entries.get("main.sqlite");
		const wal = entries.get("main.sqlite-wal");
		if (database === undefined || wal === undefined) {
			throw new Error("Export archive is missing main.sqlite or its WAL.");
		}
		const db = await open(outPath, "w+");
		try {
			await copyRange(zip, db, database);
			await applyWal(zip, db, wal);
			// Rollback-journal mode: the file stands alone, with no WAL beside it.
			await db.write(Buffer.from([1, 1]), 0, 2, 18);
		} finally {
			await db.close();
		}
		return { incomplete: entries.has("INCOMPLETE.txt") };
	} finally {
		await zip.close();
	}
}
