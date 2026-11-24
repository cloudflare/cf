import operation from "../../_operations/firewall/lockdowns/update.js";
/**
 * update command
 * @generated from apis/overlays/firewall.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "update <lock-downs-id>",
	describe: "Update a Zone Lockdown rule",
	usage:
		"$0 firewall lockdowns update <lock-downs-id>\n\nUpdates an existing Zone Lockdown rule.",
	flags: {
		configurations: {
			kind: "parsed",
			brief:
				'A list of IP addresses or CIDR ranges that will be allowed to access the URLs specified in the Zone Lockdown rule. You can include any number of `ip` or `ip_range` configurations. Provide as a JSON array of objects or @path/to/file.json. Shape: [({"target"?: "ip", "value"?: string} | {"target"?: "ip_range", "value"?: string})]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		urls: {
			kind: "parsed",
			brief:
				"The URLs to include in the current WAF override. You can use wildcards. Each entered URL will be escaped before use, which means you can only use simple wildcard patterns.",
			variadic: true,
			optional: true,
			parse: String,
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
			placeholder: "lock-downs-id",
			brief: "The unique identifier of the Zone Lockdown rule.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "firewall lockdowns update",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["configurations"] === undefined) {
						throw new Error(
							"--configurations is required (or pass --body with this field set)."
						);
					}
					if (argv["urls"] === undefined) {
						throw new Error(
							"--urls is required (or pass --body with this field set)."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					formatDryRun({
						command: "cf firewall lockdowns update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/firewall/lockdowns/${argv["lock-downs-id"] == null ? "<lock-downs-id>" : encodeURIComponent(String(argv["lock-downs-id"]))}`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
							"lock-downs-id": String(argv["lock-downs-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										configurations: parseObjectArray(
											argv["configurations"],
											"configurations"
										),
										urls: argv["urls"],
									}),
					});
					return;
				}
				const parsedBody =
					argv.body !== undefined ? parseBody(argv.body) : undefined;
				const client = await createCommandClient(argv);
				const zoneId = await getZoneId({ zone: argv.zone }, client, {
					quiet: argv.quiet,
				});
				argv.zoneId = zoneId;

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Updating`, async () =>
						client.send(operation, {
							body: bodyData,
							zone_id: zoneId,
							lock_downs_id: argv["lock-downs-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					configurations: parseObjectArray(
						argv["configurations"],
						"configurations"
					),
					urls: argv["urls"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						zone_id: zoneId,
						lock_downs_id: argv["lock-downs-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
