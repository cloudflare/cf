import operation from "../../../../_operations/zero-trust/access/user-populations/users/get.js";
/**
 * get command
 * @generated from apis/overlays/zero-trust.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "get <user-id>",
	describe: "Get a user population user",
	usage:
		"$0 zero-trust access user-populations users get <user-id>\n\nFetches a SCIM user from a user population.",
	flags: {
		"user-population-id": { kind: "parsed", brief: "UUID.", parse: String },
		attributes: {
			kind: "parsed",
			brief: "Comma-separated SCIM attributes to return.",
			optional: true,
			parse: String,
		},
		"excluded-attributes": {
			kind: "parsed",
			brief: "Comma-separated SCIM attributes to exclude from the response.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "user-id",
			brief: "The SCIM user identifier.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust access user-populations users get",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					attributes: argv["attributes"],
					excludedAttributes: argv["excluded-attributes"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust access user-populations users get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/access/user_populations/${argv["user-population-id"] == null ? "<user-population-id>" : encodeURIComponent(String(argv["user-population-id"]))}/users/${argv["user-id"] == null ? "<user-id>" : encodeURIComponent(String(argv["user-id"]))}`,
						pathParams: {
							"user-population-id": String(argv["user-population-id"] ?? ""),
							"user-id": String(argv["user-id"] ?? ""),
						},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.send(operation, {
						account_id: accountId,
						user_population_id: argv["user-population-id"],
						user_id: argv["user-id"],
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
