import operation from "../../_operations/ssl/origin-ca-certificates/get.js";
/**
 * get command
 * @generated from apis/overlays/ssl.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "get <certificate-id>",
	describe: "Get Certificate",
	usage:
		"$0 ssl origin-ca-certificates get <certificate-id>\n\nGet an existing Origin CA certificate by its serial number. You can use an Origin CA Key as your User Service Key or an API token when calling this endpoint ([see above](#requests)).",
	flags: {
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "certificate-id",
			brief: "The x509 serial number of the Origin CA certificate.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "ssl origin-ca-certificates get",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf ssl origin-ca-certificates get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/certificates/${argv["certificate-id"] == null ? "<certificate-id>" : encodeURIComponent(String(argv["certificate-id"]))}`,
						pathParams: {
							"certificate-id": String(argv["certificate-id"] ?? ""),
						},
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				const result = await withProgress(`Loading`, async () =>
					client.send(operation, { certificate_id: argv["certificate-id"] })
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
