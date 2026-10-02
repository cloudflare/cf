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
		.usage("$0 zero-trust devices list\n\nLists WARP devices.")
		.option("cursor", {
			type: "string",
			description:
				"Opaque token indicating the starting position when requesting the next set of records. A cursor value can be obtained from the result_info.cursor field in the response.",
		})
		.option("sort-by", {
			type: "string",
			description: "The device field to order results by.",
			choices: [
				"name",
				"id",
				"client_version",
				"last_seen_user.email",
				"last_seen_at",
				"active_registrations",
				"created_at",
			],
		})
		.option("sort-order", {
			type: "string",
			description: "Sort direction.",
			choices: ["asc", "desc"],
		})
		.option("last-seen-user-email", {
			type: "string",
			description: "Filter by the last seen user's email.",
		})
		.option("seen-after", {
			type: "string",
			description:
				"Filter by the last_seen timestamp - returns only devices last seen after this timestamp.",
		})
		.option("seen-before", {
			type: "string",
			description:
				"Filter by the last_seen timestamp - returns only devices last seen before this timestamp.",
		})
		.option("per-page", {
			type: "number",
			description:
				"The maximum number of devices to return in a single response.",
		})
		.option("search", {
			type: "string",
			description: "Search by device details.",
		})
		.option("active-registrations", {
			type: "string",
			description:
				'Include or exclude devices with active registrations. The default is "only" - return only devices with active registrations.',
			choices: ["include", "only", "exclude"],
		})
		.option("has-registration-type", {
			type: "string",
			description:
				"Filter by the type of active registration associated with the device.",
			choices: ["warp", "browser_extension"],
		})
		.option("id", {
			type: "string",
			description: "Filter by a one or more device IDs.",
		})
		.option("tag", {
			type: "string",
			description:
				"Filter by one or more device tags in key:value format. Devices must match all provided tags.",
		})
		.option("last-seen-registration-policy-id", {
			type: "string",
			description:
				"Filter by the ID of the device settings profile assigned to the device registration.",
		})
		.option("include", {
			type: "string",
			description:
				'Comma-separated list of additional information that should be included in the device response. Supported values are: "last_seen_registration.policy".',
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request = SdkRequest<"list-devices">;
type Query = SdkQuery<"list-devices">;

const typedBuilder = withArgTypes<
	{
		"sort-by": Query["sort_by"];
		"sort-order": Query["sort_order"];
		"active-registrations": Query["active_registrations"];
		"has-registration-type": Query["has_registration_type"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List devices",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust devices list",
				classification: {
					safeFlags: [
						"sort-by",
						"sort-order",
						"active-registrations",
						"has-registration-type",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					cursor: argv["cursor"],
					sort_by: argv["sort-by"],
					sort_order: argv["sort-order"],
					"last_seen_user.email": argv["last-seen-user-email"],
					seen_after: argv["seen-after"],
					seen_before: argv["seen-before"],
					per_page: argv["per-page"],
					search: argv["search"],
					active_registrations: argv["active-registrations"],
					has_registration_type: argv["has-registration-type"],
					id: argv["id"],
					tag: argv["tag"],
					"last_seen_registration.policy.id":
						argv["last-seen-registration-policy-id"],
					include: argv["include"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust devices list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/devices/physical-devices`,
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
					client.zeroTrust.devices.list({
						account_id: accountId,
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
