import { createCommandClient } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * list command
 * @generated from apis/overlays/resource-sharing.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 resource-sharing excluded-recipients list\n\nLists the accounts excluded from an organization-targeted share. Only valid for shares with `target_type=organization`."
		)
		.option("account-id-path", {
			type: "string",
			description: "Account identifier.",
			demandOption: true,
		})
		.option("share-id", {
			type: "string",
			description: "Share identifier tag.",
			demandOption: true,
		})
		.option("page", {
			type: "number",
			description:
				"Page number. Defaults to `1` when `per_page` is supplied without\n`page`. May be omitted entirely along with `per_page` to receive a\nnon-paginated response.",
		})
		.option("per-page", {
			type: "number",
			description:
				"Number of objects to return per page. Defaults to `20` when `page`\nis supplied without `per_page`. May be omitted entirely along with\n`page` to receive a non-paginated response.",
		})
		.check((argv) => {
			if (argv["per-page"] !== undefined && !Number.isFinite(argv["per-page"]))
				throw new Error("--per-page must be a number");
			return true;
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"share-excluded-recipients-list">;
type Query = SdkQuery<"share-excluded-recipients-list">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List share excluded recipients by share ID",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "resource-sharing excluded-recipients list",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					page: argv["page"],
					per_page: argv["per-page"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf resource-sharing excluded-recipients list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${argv["account-id-path"] == null ? "<account-id-path>" : encodeURIComponent(String(argv["account-id-path"]))}/shares/${argv["share-id"] == null ? "<share-id>" : encodeURIComponent(String(argv["share-id"]))}/excluded-recipients`,
						pathParams: {
							"account-id-path": String(argv["account-id-path"] ?? ""),
							"share-id": String(argv["share-id"] ?? ""),
						},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				const result = await withProgress(`Loading`, async () =>
					client.resourceSharing.excludedRecipients.list({
						account_id_path: argv["account-id-path"],
						share_id: argv["share-id"],
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
