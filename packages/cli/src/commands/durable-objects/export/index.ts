/**
 * `cf durable-objects export` — download a Durable Object's SQLite database
 * as one file.
 *
 * Hand-written: the API streams a zip of the database and its WAL so it can
 * start sending at once. This command streams it to disk and folds the WAL
 * into the database, so users get the single file they asked for without
 * needing SQLite installed. It also names the object the way user code
 * does — Worker, class, name — rather than by namespace ID, which users
 * never see.
 */
import { createWriteStream } from "node:fs";
import { rm } from "node:fs/promises";
import { pipeline } from "node:stream/promises";
import { unpackExport } from "./unpack.js";
import type { Cloudflare } from "#lib/auth.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { Argv, CommandModule } from "yargs";
import { ApiError } from "#api";
import {
	createCommandClient,
	getAccountId,
	requestApi,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { NO_LOCAL_EQUIVALENT } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { fetchRawResponse } from "#lib/raw-fetch.js";
import { withTelemetry } from "#lib/telemetry/index.js";

interface Namespace {
	id: string;
	script?: string;
	class?: string;
	use_sqlite?: boolean;
}

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.positional("worker", {
			type: "string",
			description:
				"The Worker that defines the Durable Object class. Omit with --namespace-id.",
		})
		.positional("class", {
			type: "string",
			description: "The Durable Object class. Omit with --namespace-id.",
		})
		.positional("name", {
			type: "string",
			description: "The name the object was created with. Omit with --id.",
		})
		.option("id", {
			type: "string",
			description: "The object's 64-character hex ID, instead of its name.",
		})
		.option("jurisdiction", {
			type: "string",
			description:
				"The jurisdiction of an object selected by name. Defaults to none.",
			choices: ["fedramp", "eu", "none"],
		})
		.option("namespace-id", {
			type: "string",
			description:
				"The namespace ID, instead of the Worker and class, when they are ambiguous.",
		})
		.option("output", {
			alias: "o",
			type: "string",
			description:
				"File to write. Defaults to <name or id>.sqlite in the current directory.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.conflicts("id", "jurisdiction");
}

type Args = InferArgs<typeof builder>;

/** Splits the positionals, which shift left when --namespace-id is given. */
function target(argv: Args) {
	const words = [argv.worker, argv.class, argv.name].filter(
		(w): w is string => w !== undefined
	);
	const byNamespace = argv["namespace-id"] !== undefined;
	const [worker, cls] = byNamespace ? [] : words;
	const name = words[byNamespace ? 0 : 2];
	const max = (byNamespace ? 1 : 3) - (argv.id === undefined ? 0 : 1);
	if (!byNamespace && cls === undefined) {
		throw new Error(
			"Name the Worker and the Durable Object class, or pass --namespace-id."
		);
	}
	if (name === undefined && argv.id === undefined) {
		throw new Error("Name the object, or pass --id.");
	}
	if (words.length > max) {
		throw new Error(`Unexpected argument: ${words[max]}`);
	}
	return { worker, cls, name };
}

async function listNamespaces(
	client: Cloudflare,
	accountId: string
): Promise<Namespace[]> {
	const all: Namespace[] = [];
	for (let page = 1; ; page++) {
		const batch = await requestApi<Namespace[]>(
			client,
			"GET",
			`/accounts/${accountId}/workers/durable_objects/namespaces`,
			{ query: { page, per_page: 1000 } }
		);
		if (batch.length === 0) {
			return all;
		}
		all.push(...batch);
	}
}

/** Finds the namespace of a Worker's class, or explains why it can't. */
function findNamespace(all: Namespace[], worker: string, cls: string) {
	const matches = all.filter((n) => n.script === worker && n.class === cls);
	if (matches.length === 0) {
		const known = all.map((n) => `  ${n.script} ${n.class}`).join("\n");
		throw new Error(
			`No Durable Object class ${cls} in Worker ${worker}.` +
				(known ? ` This account has:\n${known}` : "")
		);
	}
	if (matches.length > 1) {
		const ids = matches.map((n) => `  ${n.id}`).join("\n");
		throw new Error(
			`Worker ${worker} class ${cls} matches several namespaces; pass --namespace-id:\n${ids}`
		);
	}
	const [namespace] = matches as [Namespace];
	if (namespace.use_sqlite === false) {
		throw new Error(
			`${cls} uses the key-value storage backend; only SQLite-backed Durable Objects can be exported.`
		);
	}
	return namespace.id;
}

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "export [worker] [class] [name]",
	describe: "Download a Durable Object's SQLite database",
	builder,
	handler: async (argv): Promise<void> => {
		if (argv.local) {
			throw new Error(NO_LOCAL_EQUIVALENT);
		}
		const { worker, cls, name } = target(argv);
		const query = new URLSearchParams(
			argv.id === undefined
				? {
						durable_object_name: name as string,
						jurisdiction: argv.jurisdiction ?? "none",
					}
				: { durable_object_id: argv.id }
		);
		const output =
			argv.output ?? `${(name ?? argv.id)?.replace(/[^\w.-]/g, "_")}.sqlite`;

		if (argv.dryRun) {
			const accountId = (await resolveAccountIdSilent()) ?? "<account-id>";
			const namespace =
				argv["namespace-id"] ?? `<namespace of ${worker} ${cls}>`;
			formatDryRun({
				command: "cf durable-objects export",
				method: "GET",
				url: `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/durable_objects/namespaces/${namespace}/export`,
				pathParams: { id: namespace },
				query: Object.fromEntries(query),
				bodyKind: "none",
			});
			return;
		}

		const accountId = await getAccountId();
		argv.accountId = accountId;
		const archive = `${output}.download.zip`;
		try {
			const { incomplete } = await withProgress(`Exporting`, async () => {
				const namespace =
					argv["namespace-id"] ??
					findNamespace(
						await listNamespaces(await createCommandClient(argv), accountId),
						worker as string,
						cls as string
					);
				const response = await fetchRawResponse(
					`/accounts/${accountId}/workers/durable_objects/namespaces/${encodeURIComponent(namespace)}/export?${query}`,
					{ timeoutMs: null }
				).catch((error: unknown) => {
					// Any name maps to a valid ID, so a typo finds an empty object.
					if (error instanceof ApiError && error.statusCode === 404) {
						throw new Error(
							`Durable Object ${name ?? argv.id} has no stored data. Names are exact and case-sensitive; check it, and --jurisdiction.`
						);
					}
					if (error instanceof ApiError && error.statusCode === 503) {
						throw new Error(
							"Too many Durable Object exports are running. Try again in a minute."
						);
					}
					throw error;
				});
				if (response.body === null) {
					throw new Error("The export response had no body.");
				}
				await pipeline(response.body, createWriteStream(archive));
				return unpackExport(archive, output);
			});
			if (incomplete) {
				console.error(
					"Warning: the export could not read all of the object's history, so this file is older than the object's current state."
				);
			}
			formatOutput({ file: output, incomplete });
		} finally {
			await rm(archive, { force: true });
		}
	},
};

export default withTelemetry(command, {
	command: "durable-objects export",
	recordArgs: false,
});
