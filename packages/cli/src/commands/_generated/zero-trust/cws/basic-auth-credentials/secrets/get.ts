import operation from "../../../../_operations/zero-trust/cws/basic-auth-credentials/secrets/get.js";
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
	command: "get <secret-id>",
	describe: "Get a basic-auth secret by ID",
	usage:
		"$0 zero-trust cws basic-auth-credentials secrets get <secret-id>\n\nReturns the specified secret's metadata without exposing its password or hash.",
	flags: {
		"credential-id": {
			kind: "parsed",
			brief: "ID of the parent credential",
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
			placeholder: "secret-id",
			brief: "ID of the secret to retrieve",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust cws basic-auth-credentials secrets get",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust cws basic-auth-credentials secrets get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cws/basic-auth-credentials/${argv["credential-id"] == null ? "<credential-id>" : encodeURIComponent(String(argv["credential-id"]))}/secrets/${argv["secret-id"] == null ? "<secret-id>" : encodeURIComponent(String(argv["secret-id"]))}`,
						pathParams: {
							"credential-id": String(argv["credential-id"] ?? ""),
							"secret-id": String(argv["secret-id"] ?? ""),
						},
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
						credential_id: argv["credential-id"],
						secret_id: argv["secret-id"],
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
