import operation from "../../_operations/firewall/lockdowns/create.js";
/**
 * create command
 * @generated from apis/overlays/firewall.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "create",
	describe: "Create a Zone Lockdown rule",
	usage: "$0 firewall lockdowns create\n\nCreates a new Zone Lockdown rule.",
	flags: {
		configurations: {
			kind: "parsed",
			brief:
				'A list of IP addresses or CIDR ranges that will be allowed to access the URLs specified in the Zone Lockdown rule. You can include any number of `ip` or `ip_range` configurations. Provide as a JSON array of objects or @path/to/file.json. Shape: [({"target"?: "ip", "value"?: string} | {"target"?: "ip_range", "value"?: string})]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		description: {
			kind: "parsed",
			brief:
				"An informative summary of the rule. This value is sanitized and any tags will be removed.",
			optional: true,
			parse: String,
		},
		paused: {
			kind: "boolean",
			brief: "When true, indicates that the rule is currently paused.",
			optional: true,
		},
		priority: {
			kind: "parsed",
			brief:
				"The priority of the rule to control the processing order. A lower number indicates higher priority. If not provided, any rules with a configured priority will be processed before rules without a priority.",
			optional: true,
			parse: Number,
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
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "firewall lockdowns create",
				classification: {
					safeFlags: ["paused", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
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
						command: "cf firewall lockdowns create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/firewall/lockdowns`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
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
										description: resolveFileToken(
											argv["description"] as string | undefined,
											"description",
											"text"
										),
										paused: argv["paused"],
										priority: argv["priority"],
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
					const result = await withProgress(`Creating`, async () =>
						client.send(operation, { body: bodyData, zone_id: zoneId })
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					configurations: parseObjectArray(
						argv["configurations"],
						"configurations"
					),
					description: resolveFileToken(
						argv["description"] as string | undefined,
						"description",
						"text"
					),
					paused: argv["paused"],
					priority: argv["priority"],
					urls: argv["urls"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, zone_id: zoneId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
