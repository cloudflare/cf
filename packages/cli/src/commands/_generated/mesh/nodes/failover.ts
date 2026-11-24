/**
 * failover command
 * @generated from apis/overlays/mesh.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	requestApi,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, setNestedValue } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { confirmDelete, promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "failover <node-id>",
	describe: "Trigger a manual failover for a Mesh node",
	usage:
		"$0 mesh nodes failover <node-id>\n\nTriggers a manual failover for a specific Mesh node, setting the specified client as the active connector. The tunnel must be configured for high availability (HA) and the client must be linked to the tunnel.",
	flags: {
		"connector-id": {
			kind: "parsed",
			brief: "UUID of the Cloudflare Tunnel connector.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{ placeholder: "node-id", brief: "UUID of the tunnel.", parse: String },
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "mesh nodes failover",
				classification: {
					safeFlags: ["dry-run", "force"],
					shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["connector-id"] === undefined) {
						argv["connector-id"] = await promptForRequiredField(
							"connector-id",
							"UUID of the Cloudflare Tunnel connector."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf mesh nodes failover",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/warp_connector/${argv["node-id"] == null ? "<node-id>" : encodeURIComponent(String(argv["node-id"]))}/failover`,
						pathParams: { "node-id": String(argv["node-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										client_id: resolveFileToken(
											argv["connector-id"] as string | undefined,
											"connector-id",
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

				if (
					!(await confirmDelete({
						force: Boolean(argv.force),
						message: `This operation triggers a manual failover, changing the active connector for a Mesh node.`,
					}))
				) {
					return;
				}

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Updating`, async () =>
						requestApi<unknown>(
							client,
							"PUT",
							`/accounts/${accountId}/warp_connector/${encodeURIComponent(String(argv["node-id"]))}/failover`,
							{ body: bodyData }
						)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData: Record<string, unknown> = {};
				if (argv["connector-id"] !== undefined)
					setNestedValue(
						bodyData,
						["client_id"],
						resolveFileToken(
							argv["connector-id"] as string | undefined,
							"connector-id",
							"text"
						)
					);
				const result = await withProgress(`Updating`, async () =>
					requestApi<unknown>(
						client,
						"PUT",
						`/accounts/${accountId}/warp_connector/${encodeURIComponent(String(argv["node-id"]))}/failover`,
						{ body: bodyData }
					)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
