import operation from "../../_operations/rum/site-info/validate-hostname.js";
/**
 * validate-hostname command
 * @generated from apis/overlays/rum.ts
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
	command: "validate-hostname <hostname>",
	describe: "Validate a Web Analytics site hostname",
	usage:
		"$0 rum site-info validate-hostname <hostname>\n\nValidates that the provided hostname is well-formed, does not contain wildcards, and has a valid TLD. Returns an empty result on success.",
	flags: {
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "hostname",
			brief:
				"The hostname to validate (e.g. example.com). The \`pattern\` below validates the hostname's structure (label syntax) only. In addition, the hostname must end in a valid public suffix (TLD). For the list of valid suffixes and how it is used, see the Public Suffix List: https://wiki.mozilla.org/Public_Suffix_List/Use_Cases",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "rum site-info validate-hostname",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf rum site-info validate-hostname",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/rum/site_info/validate/${argv["hostname"] == null ? "<hostname>" : encodeURIComponent(String(argv["hostname"]))}`,
						pathParams: { hostname: String(argv["hostname"] ?? "") },
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
						hostname: argv["hostname"],
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
