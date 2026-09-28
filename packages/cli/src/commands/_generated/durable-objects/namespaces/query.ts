import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * query command
 * @generated from apis/overlays/durable-objects.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 durable-objects namespaces query <id>\n\nExecutes one or more SQL queries against a Durable Object."
		)
		.positional("id", {
			type: "string",
			description: "ID of the namespace.",
			demandOption: true,
		})
		.option("durable-object-id", {
			type: "string",
			description: "The durable_object_id field",
		})
		.option("queries", {
			type: "string",
			description:
				"The queries field. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("durable-object-name", {
			type: "string",
			description: "The durable_object_name field",
		})
		.option("jurisdiction", {
			type: "string",
			description: "The jurisdiction field",
			choices: ["fedramp", "eu", "none"],
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		})
		.conflicts("durable-object-id", ["durable-object-name", "jurisdiction"])
		.conflicts("durable-object-name", ["durable-object-id"])
		.implies("durable-object-name", ["jurisdiction"])
		.conflicts("jurisdiction", ["durable-object-id"])
		.implies("jurisdiction", ["durable-object-name"]);
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"durable-objects-namespace-query">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "query <id>",
	describe: "Query a Durable Object",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "durable-objects namespaces query",
				classification: {
					safeFlags: ["jurisdiction", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf durable-objects namespaces query",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/workers/durable_objects/namespaces/${argv["id"] == null ? "<id>" : encodeURIComponent(String(argv["id"]))}/query/v2`,
						pathParams: { id: String(argv["id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										durable_object_id: resolveFileToken(
											argv["durable-object-id"] as string | undefined,
											"durable-object-id",
											"text"
										),
										queries: parseObjectArray(argv["queries"], "queries"),
										durable_object_name: resolveFileToken(
											argv["durable-object-name"] as string | undefined,
											"durable-object-name",
											"text"
										),
										jurisdiction: resolveFileToken(
											argv["jurisdiction"] as string | undefined,
											"jurisdiction",
											"text"
										),
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request["body"]>(argv.body);
					const result = await withProgress(`Loading`, async () =>
						client.durableObjects.namespaces.query({
							body: bodyData,
							account_id: accountId,
							id: argv["id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Loaded` });
					return;
				}
				if (argv["queries"] === undefined) {
					throw new Error(
						"--queries is required (or pass --body with this field set)."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					durable_object_id: resolveFileToken(
						argv["durable-object-id"] as string | undefined,
						"durable-object-id",
						"text"
					),
					queries: parseObjectArray(argv["queries"], "queries"),
					durable_object_name: resolveFileToken(
						argv["durable-object-name"] as string | undefined,
						"durable-object-name",
						"text"
					),
					jurisdiction: resolveFileToken(
						argv["jurisdiction"] as string | undefined,
						"jurisdiction",
						"text"
					),
				});
				const result = await withProgress(`Loading`, async () =>
					client.durableObjects.namespaces.query({
						body: bodyData,
						account_id: accountId,
						id: argv["id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
