import operation from "../../_operations/magic-transit/bgp-filter-profiles/create.js";
/**
 * create command
 * @generated from apis/overlays/magic-transit.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
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
import {
	promptForRequiredEnumField,
	promptForRequiredField,
} from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "create",
	describe: "Create BGP Filter Profile",
	usage:
		"$0 magic-transit bgp-filter-profiles create\n\nCreates a new BGP filter profile for an account.",
	flags: {
		description: {
			kind: "parsed",
			brief: "Description of the filter profile",
			default: "",
			parse: String,
		},
		"match-action": {
			kind: "parsed",
			brief:
				"Action to take when a route matches one of the targets in this profile",
			optional: true,
			choices: ["allow", "deny"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "match-action", "text"),
		},
		name: {
			kind: "parsed",
			brief: "Friendly name for the filter profile",
			optional: true,
			parse: String,
		},
		targets: {
			kind: "parsed",
			brief:
				"List of CIDR prefixes. Each entry may carry an optional suffix that specifies which prefix lengths to match relative to the prefix length N: '{X,Y}' matches prefix lengths in the inclusive range [X, Y] where N <= X <= Y <= max (max is 32 for IPv4, 128 for IPv6), '{X}' matches exactly length X (equivalent to {X,X}), '+' is shorthand for {N, max} (the prefix and all more-specific subnets, including at length N itself; valid even when N is the maximum length). Omit the suffix to match the prefix exactly at length N.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "magic-transit bgp-filter-profiles create",
				classification: {
					safeFlags: ["match-action", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["match-action"] === undefined) {
						argv["match-action"] = await promptForRequiredEnumField(
							"match-action",
							"Action to take when a route matches one of the targets in this profile",
							["allow", "deny"] as const
						);
					}
					if (argv["name"] === undefined) {
						argv["name"] = await promptForRequiredField(
							"name",
							"Friendly name for the filter profile"
						);
					}
					if (argv["targets"] === undefined) {
						throw new Error(
							"--targets is required (or pass --body with this field set)."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf magic-transit bgp-filter-profiles create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/magic/bgp/filter_profiles`,
						pathParams: {},
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
										match_action: argv["match-action"],
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
				const parsedBody =
					argv.body !== undefined ? parseBody(argv.body) : undefined;
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Creating`, async () =>
						client.send(operation, { body: bodyData, account_id: accountId })
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					description: resolveFileToken(
						argv["description"] as string | undefined,
						"description",
						"text"
					),
					match_action: argv["match-action"],
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					targets: argv["targets"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
