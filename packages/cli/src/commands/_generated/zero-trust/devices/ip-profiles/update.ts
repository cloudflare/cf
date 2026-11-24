import operation from "../../../_operations/zero-trust/devices/ip-profiles/update.js";
/**
 * update command
 * @generated from apis/overlays/zero-trust.ts
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
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "update <profile-id>",
	describe: "Update IP profile",
	usage:
		"$0 zero-trust devices ip-profiles update <profile-id>\n\nUpdates a WARP Device IP profile. Currently, only IPv4 Device subnets can be associated.",
	flags: {
		description: {
			kind: "parsed",
			brief: "An optional description of the Device IP profile.",
			optional: true,
			parse: String,
		},
		enabled: {
			kind: "boolean",
			brief: "Whether the Device IP profile is enabled.",
			optional: true,
		},
		match: {
			kind: "parsed",
			brief:
				'The wirefilter expression to match registrations. Available values: "identity.name", "identity.email", "identity.groups.id", "identity.groups.name", "identity.groups.email", "identity.saml_attributes".',
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "A user-friendly name for the Device IP profile.",
			optional: true,
			parse: String,
		},
		precedence: {
			kind: "parsed",
			brief:
				"The precedence of the Device IP profile. Lower values indicate higher precedence. Device IP profile will be evaluated in ascending order of this field.",
			optional: true,
			parse: Number,
		},
		"subnet-id": {
			kind: "parsed",
			brief: "The ID of the Subnet.",
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
	operands: [{ placeholder: "profile-id", brief: "Profile ID", parse: String }],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust devices ip-profiles update",
				classification: {
					safeFlags: ["enabled", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust devices ip-profiles update",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/devices/ip-profiles/${argv["profile-id"] == null ? "<profile-id>" : encodeURIComponent(String(argv["profile-id"]))}`,
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
										enabled: argv["enabled"],
										match: resolveFileToken(
											argv["match"] as string | undefined,
											"match",
											"text"
										),
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										precedence: argv["precedence"],
										subnet_id: resolveFileToken(
											argv["subnet-id"] as string | undefined,
											"subnet-id",
											"text"
										),
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
					const result = await withProgress(`Updating`, async () =>
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							profile_id: argv["profile-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					description: resolveFileToken(
						argv["description"] as string | undefined,
						"description",
						"text"
					),
					enabled: argv["enabled"],
					match: resolveFileToken(
						argv["match"] as string | undefined,
						"match",
						"text"
					),
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					precedence: argv["precedence"],
					subnet_id: resolveFileToken(
						argv["subnet-id"] as string | undefined,
						"subnet-id",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						profile_id: argv["profile-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
