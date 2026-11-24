import operation from "../../_operations/ssl/origin-ca-certificates/list.js";
/**
 * list command
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
	command: "list",
	describe: "List Certificates",
	usage:
		"$0 ssl origin-ca-certificates list\n\nList all existing Origin CA certificates for a given zone. Revoked certificates are not included. You can use an Origin CA Key as your User Service Key or an API token when calling this endpoint ([see above](#requests)).",
	flags: {
		"zone-id": {
			kind: "parsed",
			brief: "Identifier.",
			optional: true,
			parse: String,
		},
		page: {
			kind: "parsed",
			brief: "Page number of paginated results.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Number of records per page.",
			optional: true,
			parse: Number,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "ssl origin-ca-certificates list",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					zone_id: argv["zone-id"],
					page: argv["page"],
					per_page: argv["per-page"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf ssl origin-ca-certificates list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/certificates`,
						pathParams: {},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				const result = await withProgress(`Loading`, async () =>
					client.send(operation, queryParams)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
