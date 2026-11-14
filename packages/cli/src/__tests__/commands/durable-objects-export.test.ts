import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";
import { runInTempDir } from "@cloudflare/workers-utils/test-helpers";
import { http, HttpResponse } from "msw/http";
import { beforeEach, describe, expect, it } from "vite-plus/test";
import { unpackExport } from "../../commands/durable-objects/export/unpack.js";
import { captureOutput } from "../helpers/capture-output.js";
import { server, setupMsw, TEST_BASE_URL } from "../helpers/msw.js";
import { runCf } from "../helpers/run-cf.js";

/**
 * `cf durable-objects export` is hand-written: it finds the namespace from
 * the Worker and class, and turns the API's zip of a database and its WAL
 * into one SQLite file. The fixture is a real export of a table `t` holding
 * 1, 2 and 3, all three rows still in the WAL.
 */

const FIXTURE = fileURLToPath(
	new URL("fixtures/do-export.zip", import.meta.url)
);

const NAMESPACES = [
	{ id: "ns-room", script: "chat", class: "Room", use_sqlite: true },
	{ id: "ns-kv", script: "chat", class: "Legacy", use_sqlite: false },
	{ id: "ns-a", script: "wfp", class: "Room", use_sqlite: true },
	{ id: "ns-b", script: "wfp", class: "Room", use_sqlite: true },
];

function rows(file: string) {
	const db = new DatabaseSync(file);
	try {
		return {
			ids: db
				.prepare("SELECT i FROM t ORDER BY i")
				.all()
				.map((r) => r.i),
			integrity: db.prepare("PRAGMA integrity_check").get()?.integrity_check,
			journal: db.prepare("PRAGMA journal_mode").get()?.journal_mode,
		};
	} finally {
		db.close();
	}
}

describe("cf durable-objects export", () => {
	runInTempDir();
	setupMsw();

	const ENV = {
		CI: "true",
		CLOUDFLARE_API_TOKEN: "test-token",
		CLOUDFLARE_API_BASE_URL: TEST_BASE_URL,
		CLOUDFLARE_ACCOUNT_ID: "test-account",
	};
	const NS = `${TEST_BASE_URL}/accounts/test-account/workers/durable_objects/namespaces`;

	let output: ReturnType<typeof captureOutput>;
	let exports: string[];

	beforeEach(() => {
		output = captureOutput();
		exports = [];
		server.use(
			http.get(NS, ({ request }) => {
				const page = new URL(request.url).searchParams.get("page");
				return HttpResponse.json({
					success: true,
					errors: [],
					messages: [],
					result: page === "1" ? NAMESPACES : [],
				});
			}),
			http.get(`${NS}/:namespace/export`, ({ request, params }) => {
				const { search } = new URL(request.url);
				exports.push(`${String(params.namespace)}${search}`);
				if (search.includes("=busy")) {
					return HttpResponse.json(
						{ result: {}, success: false, errors: ["busy"], messages: [] },
						{ status: 503 }
					);
				}
				if (search.includes("=typo")) {
					return HttpResponse.json(
						{
							result: {},
							success: false,
							errors: ["Durable Object has no stored data"],
							messages: [],
						},
						{ status: 404 }
					);
				}
				return new HttpResponse(readFileSync(FIXTURE), {
					headers: { "content-type": "application/octet-stream" },
				});
			})
		);
	});

	const run = (...args: string[]) =>
		runCf(["durable-objects", "export", ...args], ENV);

	it("folds the WAL into a standalone database", async () => {
		expect(await unpackExport(FIXTURE, "out.sqlite")).toEqual({
			incomplete: false,
		});
		expect(existsSync("out.sqlite-wal")).toBe(false);
		expect(rows("out.sqlite")).toEqual({
			ids: [1, 2, 3],
			integrity: "ok",
			journal: "delete",
		});
	});

	it("rejects a truncated download", async () => {
		const zip = readFileSync(FIXTURE);
		writeFileSync("cut.zip", zip.subarray(0, zip.length - 100));
		await expect(unpackExport("cut.zip", "cut.sqlite")).rejects.toThrow(
			/truncated/
		);
	});

	it("exports an object by Worker, class and name", async () => {
		const { exitCode } = await run("chat", "Room", "lobby");
		expect(exitCode).toBe(0);
		expect(exports).toEqual([
			"ns-room?durable_object_name=lobby&jurisdiction=none",
		]);
		expect(rows("lobby.sqlite").ids).toEqual([1, 2, 3]);
		expect(existsSync("lobby.sqlite.download.zip")).toBe(false);
		expect(output.stdout()).toContain("lobby.sqlite");
	});

	it("exports an object by ID", async () => {
		await run("chat", "Room", "--id", "abc", "-o", "x.db");
		expect(exports).toEqual(["ns-room?durable_object_id=abc"]);
		expect(rows("x.db").ids).toEqual([1, 2, 3]);
	});

	it("takes a namespace ID in place of the Worker and class", async () => {
		await run("--namespace-id", "ns-b", "lobby", "--jurisdiction", "eu");
		expect(exports).toEqual(["ns-b?durable_object_name=lobby&jurisdiction=eu"]);
	});

	it("keeps a name from escaping the current directory", async () => {
		await run("chat", "Room", "../a/b");
		expect(existsSync(".._a_b.sqlite")).toBe(true);
	});

	it("lists the account's classes when the Worker or class is wrong", async () => {
		await expect(run("chat", "Rooms", "lobby")).rejects.toThrow(
			/No Durable Object class Rooms in Worker chat[\s\S]*chat Room/
		);
		expect(exports).toEqual([]);
	});

	it("explains a 404 as a likely mistyped name", async () => {
		await expect(run("chat", "Room", "typo")).rejects.toThrow(
			/Durable Object typo has no stored data\. Names are exact/
		);
		expect(existsSync("typo.sqlite")).toBe(false);
	});

	it("asks to retry when the service is busy", async () => {
		await expect(run("chat", "Room", "busy")).rejects.toThrow(/Try again/);
	});

	it("refuses key-value namespaces", async () => {
		await expect(run("chat", "Legacy", "x")).rejects.toThrow(/key-value/);
	});

	it("asks for --namespace-id when the Worker and class are ambiguous", async () => {
		await expect(run("wfp", "Room", "x")).rejects.toThrow(
			/--namespace-id:\n {2}ns-a\n {2}ns-b/
		);
	});

	it("requires the object", async () => {
		await expect(run("chat", "Room")).rejects.toThrow(/--id/);
		await expect(run("chat")).rejects.toThrow(/--namespace-id/);
		await expect(run("chat", "Room", "lobby", "--id", "abc")).rejects.toThrow(
			/Unexpected argument: lobby/
		);
	});

	it("shows the request on --dry-run without sending it", async () => {
		const { exitCode } = await run("chat", "Room", "lobby", "--dry-run");
		expect(exitCode).toBe(0);
		expect(exports).toEqual([]);
		expect(existsSync("lobby.sqlite")).toBe(false);
		expect(output.stdout()).toContain("<namespace of chat Room>");
	});
});
