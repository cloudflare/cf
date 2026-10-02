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
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * list command
 * @generated from apis/overlays/zero-trust.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 zero-trust devices registrations list\n\nLists WARP registrations."
		)
		.option("user-id", { type: "string", description: "Filter by user ID." })
		.option("seen-after", {
			type: "string",
			description:
				"Filter by the last_seen timestamp - returns only registrations last seen after this timestamp.",
		})
		.option("seen-before", {
			type: "string",
			description:
				"Filter by the last_seen timestamp - returns only registrations last seen before this timestamp.",
		})
		.option("status", {
			type: "string",
			description: "Filter by registration status. Defaults to 'active'.",
			choices: ["active", "all", "revoked"],
		})
		.option("registration-type", {
			type: "string",
			description: "Filter by registration client type.",
			choices: ["warp", "browser_extension"],
		})
		.option("per-page", {
			type: "number",
			description:
				"The maximum number of devices to return in a single response.",
		})
		.option("search", {
			type: "string",
			description: "Filter by registration details.",
		})
		.option("sort-by", {
			type: "string",
			description: "The registration field to order results by.",
			choices: ["id", "user.name", "user.email", "last_seen_at", "created_at"],
		})
		.option("sort-order", {
			type: "string",
			description: "Sort direction.",
			choices: ["asc", "desc"],
		})
		.option("cursor", {
			type: "string",
			description:
				"Opaque token indicating the starting position when requesting the next set of records. A cursor value can be obtained from the result_info.cursor field in the response.",
		})
		.option("id", { type: "string", description: "Filter by registration ID." })
		.option("device-id", {
			type: "string",
			description: "Filter by WARP device ID.",
		})
		.option("policy-id", {
			type: "string",
			description:
				"Filter by the ID of the device settings profile assigned to the registration.",
		})
		.option("include", {
			type: "string",
			description:
				'Comma-separated list of additional information that should be included in the registration response. Supported values are: "policy".',
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request = SdkRequest<"list-registrations">;
type Query = SdkQuery<"list-registrations">;

const typedBuilder = withArgTypes<
	{
		status: Query["status"];
		"registration-type": Query["registration_type"];
		"sort-by": Query["sort_by"];
		"sort-order": Query["sort_order"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List registrations",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust devices registrations list",
				classification: {
					safeFlags: [
						"status",
						"registration-type",
						"sort-by",
						"sort-order",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					"user.id": argv["user-id"],
					seen_after: argv["seen-after"],
					seen_before: argv["seen-before"],
					status: argv["status"],
					registration_type: argv["registration-type"],
					per_page: argv["per-page"],
					search: argv["search"],
					sort_by: argv["sort-by"],
					sort_order: argv["sort-order"],
					cursor: argv["cursor"],
					id: argv["id"],
					"device.id": argv["device-id"],
					"policy.id": argv["policy-id"],
					include: argv["include"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust devices registrations list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/devices/registrations`,
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
					client.zeroTrust.devices.registrations.list({
						account_id: accountId,
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
