import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * list command
 * @generated from apis/overlays/zero-trust.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { withArgTypes } from "#lib/cli-types.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 zero-trust cws rego-metadata list\n\nReturns a paginated list of Rego metadata documents in the account."
		)
		.option("cursor", {
			type: "string",
			description: "Pagination cursor from previous response",
		})
		.option("per-page", {
			type: "number",
			description: "Number of items per page (1-100, default 20)",
		})
		.option("order", {
			type: "string",
			description: "Field to order results by (default: created_at)",
			choices: ["name", "created_at", "updated_at"],
		})
		.option("direction", {
			type: "string",
			description: "Sort direction (default: asc)",
			choices: ["asc", "desc"],
		})
		.option("name", {
			type: "string",
			description:
				"Filter by rego metadata name (case-insensitive substring match)",
		})
		.option("import-path", {
			type: "string",
			description:
				"Filter by import path (case-sensitive literal substring match)",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request = SdkRequest<"cws-list-rego-metadata">;
type Query = SdkQuery<"cws-list-rego-metadata">;

const typedBuilder = withArgTypes<
	{
		order: Query["order"];
		direction: Query["direction"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List Rego metadata documents",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust cws rego-metadata list",
				classification: {
					safeFlags: ["order", "direction", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					cursor: argv["cursor"],
					per_page: argv["per-page"],
					order: argv["order"],
					direction: argv["direction"],
					name: argv["name"],
					import_path: argv["import-path"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust cws rego-metadata list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cws/rego-metadata`,
						pathParams: {},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.zeroTrust.cws.regoMetadata.list({
						account_id: accountId,
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
