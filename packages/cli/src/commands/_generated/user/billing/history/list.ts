import { createCommandClient } from "#lib/auth.js";
import { withArgTypes } from "#lib/cli-types.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery } from "#sdk";
/**
 * list command
 * @generated from apis/overlays/user.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 user billing history list\n\nAccesses your billing history object."
		)
		.option("page", {
			type: "number",
			description: "Page number of paginated results.",
		})
		.option("per-page", {
			type: "number",
			description: "Number of items per page.",
		})
		.check((argv) => {
			if (argv["per-page"] !== undefined && !Number.isFinite(argv["per-page"]))
				throw new Error("--per-page must be a number");
			return true;
		})
		.option("order", {
			type: "string",
			description: "Field to order billing history by.",
			choices: ["type", "occurred_at", "action"],
		})
		.option("occurred-at", {
			type: "string",
			description: "When the billing item was created.",
		})
		.option("type", { type: "string", description: "The billing item type." })
		.option("action", {
			type: "string",
			description: "The billing item action.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Query =
	SdkQuery<"user-billing-history-(-deprecated)-billing-history-details">;

const typedBuilder = withArgTypes<
	{
		order: Query["order"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "Billing History Details",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "user billing history list",
				classification: {
					safeFlags: ["order", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					page: argv["page"],
					per_page: argv["per-page"],
					order: argv["order"],
					occurred_at: argv["occurred-at"],
					type: argv["type"],
					action: argv["action"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf user billing history list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/user/billing/history`,
						pathParams: {},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				const result = await withProgress(`Loading`, async () =>
					client.user.billing.history.list(queryParams)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
