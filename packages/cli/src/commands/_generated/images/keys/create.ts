import operation from "../../_operations/images/keys/create.js";
/**
 * create command
 * @generated from apis/overlays/images.ts
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
	command: "create <signing-key-name>",
	describe: "Create a new Signing Key",
	usage:
		"$0 images keys create <signing-key-name>\n\nCreate a new CF Images signing key with specified name. Returns all keys available.",
	flags: {
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "signing-key-name",
			brief: "Signing key name",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "images keys create",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf images keys create",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/images/v1/keys/${argv["signing-key-name"] == null ? "<signing-key-name>" : encodeURIComponent(String(argv["signing-key-name"]))}`,
						pathParams: {
							"signing-key-name": String(argv["signing-key-name"] ?? ""),
						},
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						account_id: accountId,
						signing_key_name: argv["signing-key-name"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
