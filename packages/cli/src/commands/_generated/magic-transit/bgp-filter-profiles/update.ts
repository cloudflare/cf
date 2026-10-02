import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/magic-transit.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			'$0 magic-transit bgp-filter-profiles update <profile-id>\n\nUpdates a BGP filter profile. Omitted properties are left unchanged. To clear an existing description send `description: ""`.'
		)
		.positional("profile-id", {
			type: "string",
			description: "Identifier",
			demandOption: true,
		})
		.option("description", {
			type: "string",
			description: "Description of the filter profile",
		})
		.option("match-action", {
			type: "string",
			description:
				"Action to take when a route matches one of the targets in this profile",
			choices: ["allow", "deny"],
		})
		.option("name", {
			type: "string",
			description: "Friendly name for the filter profile",
		})
		.option("targets", {
			type: "string",
			array: true,
			description:
				"List of CIDR prefixes. Each entry may carry an optional suffix that specifies which prefix lengths to match relative to the prefix length N: '{X,Y}' matches prefix lengths in the inclusive range [X, Y] where N <= X <= Y <= max (max is 32 for IPv4, 128 for IPv6), '{X}' matches exactly length X (equivalent to {X,X}), '+' is shorthand for {N, max} (the prefix and all more-specific subnets, including at length N itself; valid even when N is the maximum length). Omit the suffix to match the prefix exactly at length N.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description:
				'Partial update for a BGP filter profile. At least one property must be provided; omitted properties are left unchanged. To clear an existing description send \`description: ""\`.',
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"magic-bgp-update-filter-profile">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <profile-id>",
	describe: "Update BGP Filter Profile",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "magic-transit bgp-filter-profiles update",
				classification: {
					safeFlags: ["match-action", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf magic-transit bgp-filter-profiles update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/magic/bgp/filter_profiles/${argv["profile-id"] == null ? "<profile-id>" : encodeURIComponent(String(argv["profile-id"]))}`,
						pathParams: { "profile-id": String(argv["profile-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										description: resolveFileToken(
											argv["description"] as string | undefined,
											"description",
											"text"
										),
										match_action: resolveFileToken(
											argv["match-action"] as string | undefined,
											"match-action",
											"text"
										),
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										targets: argv["targets"],
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.magicTransit.bgpFilterProfiles.update({
							...bodyData,
							account_id: accountId,
							profile_id: argv["profile-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					description: resolveFileToken(
						argv["description"] as string | undefined,
						"description",
						"text"
					),
					match_action: resolveFileToken(
						argv["match-action"] as string | undefined,
						"match-action",
						"text"
					),
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					targets: argv["targets"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.magicTransit.bgpFilterProfiles.update({
						...bodyData,
						account_id: accountId,
						profile_id: argv["profile-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
