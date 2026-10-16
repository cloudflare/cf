import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * update command
 * @generated from apis/overlays/zero-trust.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	requestApi,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import {
	compactBody,
	parseBody,
	parseObjectArray,
	setNestedValue,
} from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { readFileForFlag } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 zero-trust access user-populations users update <user-id>\n\nUpdates a SCIM user in a user population."
		)
		.positional("user-id", {
			type: "string",
			description: "The SCIM user identifier.",
			demandOption: true,
		})
		.option("user-population-id", {
			type: "string",
			description: "UUID.",
			demandOption: true,
		})
		.option("operations", {
			type: "string",
			description:
				"The Operations field. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("schemas", {
			type: "string",
			array: true,
			description: "The schemas field",
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
		.option("file", {
			type: "string",
			description: "Path to a file to upload as the request body",
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <user-id>",
	describe: "Update a user population user",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust access user-populations users update",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust access user-populations users update",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/access/user_populations/${argv["user-population-id"] == null ? "<user-population-id>" : encodeURIComponent(String(argv["user-population-id"]))}/users/${argv["user-id"] == null ? "<user-id>" : encodeURIComponent(String(argv["user-id"]))}`,
						pathParams: {
							"user-population-id": String(argv["user-population-id"] ?? ""),
							"user-id": String(argv["user-id"] ?? ""),
						},
						bodyKind: argv.file !== undefined ? "octet-stream" : "json",
						body:
							argv.file !== undefined
								? { file: argv.file }
								: argv.body !== undefined
									? parseBody(argv.body)
									: compactBody({
											Operations: parseObjectArray(
												argv["operations"],
												"operations"
											),
											schemas: argv["schemas"],
										}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.file) {
					const fileContent = readFileForFlag(argv.file);
					const result = await withProgress(`Updating`, async () =>
						requestApi<unknown>(
							client,
							"PATCH",
							`/accounts/${accountId}/access/user_populations/${encodeURIComponent(String(argv["user-population-id"]))}/users/${encodeURIComponent(String(argv["user-id"]))}`,
							{
								body: fileContent,
								headers: { "Content-Type": "application/scim+json" },
							}
						)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				if (argv.body) {
					const bodyData = parseBody(argv.body);
					const result = await withProgress(`Updating`, async () =>
						requestApi<unknown>(
							client,
							"PATCH",
							`/accounts/${accountId}/access/user_populations/${encodeURIComponent(String(argv["user-population-id"]))}/users/${encodeURIComponent(String(argv["user-id"]))}`,
							{ body: bodyData }
						)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["operations"] === undefined) {
					throw new Error(
						"--operations is required (or pass --body with this field set)."
					);
				}

				// Assemble request body from individual flags
				const bodyData: Record<string, unknown> = {};
				if (argv["operations"] !== undefined)
					setNestedValue(
						bodyData,
						["Operations"],
						parseObjectArray(argv["operations"], "operations")
					);
				if (argv["schemas"] !== undefined)
					setNestedValue(bodyData, ["schemas"], argv["schemas"]);
				const result = await withProgress(`Updating`, async () =>
					requestApi<unknown>(
						client,
						"PATCH",
						`/accounts/${accountId}/access/user_populations/${encodeURIComponent(String(argv["user-population-id"]))}/users/${encodeURIComponent(String(argv["user-id"]))}`,
						{ body: bodyData }
					)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
