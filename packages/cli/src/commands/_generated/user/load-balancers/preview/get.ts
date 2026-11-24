import operation from "../../../_operations/user/load-balancers/preview/get.js";
/**
 * get command
 * @generated from apis/overlays/user.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "get <preview-id>",
	describe: "Preview Result",
	usage:
		"$0 user load-balancers preview get <preview-id>\n\nGet the result of a previous preview operation using the provided preview_id.",
	flags: {
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [{ placeholder: "preview-id", brief: "Preview ID", parse: String }],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "user load-balancers preview get",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf user load-balancers preview get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/user/load_balancers/preview/${argv["preview-id"] == null ? "<preview-id>" : encodeURIComponent(String(argv["preview-id"]))}`,
						pathParams: { "preview-id": String(argv["preview-id"] ?? "") },
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				const result = await withProgress(`Loading`, async () =>
					client.send(operation, { preview_id: argv["preview-id"] })
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
