import operation from "../../_operations/billing/rate-plans/get.js";
/**
 * get command
 * @generated from apis/overlays/billing.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "get <public-key>",
	describe: "Get Rate Plan by Public Key",
	usage:
		"$0 billing rate-plans get <public-key>\n\nGets a rate plan's details by its public key (e.g., 'teams_free', 'cf_pro_20_20'). This is a public catalog endpoint, so authentication is not enforced and credentials are accepted but not required.",
	flags: {
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "public-key",
			brief: "The public key identifier for the rate plan.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "billing rate-plans get",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf billing rate-plans get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/billing/rate_plans/${argv["public-key"] == null ? "<public-key>" : encodeURIComponent(String(argv["public-key"]))}`,
						pathParams: { "public-key": String(argv["public-key"] ?? "") },
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				const result = await withProgress(`Loading`, async () =>
					client.send(operation, { public_key: argv["public-key"] })
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
