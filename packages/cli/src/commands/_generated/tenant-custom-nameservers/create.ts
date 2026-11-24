import operation from "../_operations/tenant-custom-nameservers/create.js";
/**
 * create command
 * @generated from apis/overlays/tenant-custom-nameservers.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "create <tenant-id>",
	describe: "Add Tenant Custom Nameserver",
	usage:
		"$0 tenant-custom-nameservers create <tenant-id>\n\nAdds a custom nameserver for a tenant.",
	flags: {
		"ns-name": {
			kind: "parsed",
			brief: "The FQDN of the name server.",
			optional: true,
			parse: String,
		},
		"ns-set": {
			kind: "parsed",
			brief: "The number of the set that this name server belongs to.",
			default: "1",
			parse: Number,
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
	operands: [
		{
			placeholder: "tenant-id",
			brief: "Tenant identifier tag.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "tenant-custom-nameservers create",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["ns-name"] === undefined) {
						argv["ns-name"] = await promptForRequiredField(
							"ns-name",
							"The FQDN of the name server."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					formatDryRun({
						command: "cf tenant-custom-nameservers create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/tenants/${argv["tenant-id"] == null ? "<tenant-id>" : encodeURIComponent(String(argv["tenant-id"]))}/custom_ns`,
						pathParams: { "tenant-id": String(argv["tenant-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										ns_name: resolveFileToken(
											argv["ns-name"] as string | undefined,
											"ns-name",
											"text"
										),
										ns_set: argv["ns-set"],
									}),
					});
					return;
				}
				const parsedBody =
					argv.body !== undefined ? parseBody(argv.body) : undefined;
				const client = await createCommandClient(argv);

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Creating`, async () =>
						client.send(operation, {
							body: bodyData,
							tenant_id: argv["tenant-id"],
						})
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					ns_name: resolveFileToken(
						argv["ns-name"] as string | undefined,
						"ns-name",
						"text"
					),
					ns_set: argv["ns-set"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, {
						body: bodyData,
						tenant_id: argv["tenant-id"],
					})
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
