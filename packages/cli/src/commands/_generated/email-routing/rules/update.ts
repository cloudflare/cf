import operation from "../../_operations/email-routing/rules/update.js";
/**
 * update command
 * @generated from apis/overlays/email-routing.ts
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
	command: "update <rule-identifier>",
	describe: "Update routing rule",
	usage:
		"$0 email-routing rules update <rule-identifier>\n\nUpdate actions and matches, or enable/disable specific routing rules. Forward actions require exactly one verified destination address.",
	flags: {
		actions: {
			kind: "parsed",
			brief:
				'List actions patterns. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"type": "drop" | "forward" | "worker", "value"?: [string]}]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		enabled: { kind: "boolean", brief: "Routing rule status.", optional: true },
		matchers: {
			kind: "parsed",
			brief:
				'Matching patterns to forward to your actions. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"type": "all" | "literal", "field"?: "to", "value"?: string}]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "Routing rule name.",
			optional: true,
			parse: String,
		},
		"owner-worker-tag": {
			kind: "parsed",
			brief:
				"Public tag (script_tag) of the Worker that owns this rule. Required when\n`source` is `wrangler`.\n",
			optional: true,
			parse: String,
		},
		priority: {
			kind: "parsed",
			brief: "Priority of the routing rule.",
			optional: true,
			parse: Number,
		},
		source: {
			kind: "parsed",
			brief:
				"Who manages the rule. `api` covers dashboard, generic API, and Terraform;\n`wrangler` means the rule is managed by a Worker's wrangler.jsonc. Defaults\nto `api` when omitted on write.\n",
			optional: true,
			choices: ["api", "wrangler"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "source", "text"),
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
			placeholder: "rule-identifier",
			brief: "Routing rule identifier.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "email-routing rules update",
				classification: {
					safeFlags: ["enabled", "source", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["actions"] === undefined) {
						throw new Error(
							"--actions is required (or pass --body with this field set)."
						);
					}
					if (argv["matchers"] === undefined) {
						throw new Error(
							"--matchers is required (or pass --body with this field set)."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					formatDryRun({
						command: "cf email-routing rules update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/email/routing/rules/${argv["rule-identifier"] == null ? "<rule-identifier>" : encodeURIComponent(String(argv["rule-identifier"]))}`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
							"rule-identifier": String(argv["rule-identifier"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										actions: parseObjectArray(argv["actions"], "actions"),
										enabled: argv["enabled"],
										matchers: parseObjectArray(argv["matchers"], "matchers"),
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										owner_worker_tag: resolveFileToken(
											argv["owner-worker-tag"] as string | undefined,
											"owner-worker-tag",
											"text"
										),
										priority: argv["priority"],
										source: argv["source"],
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
							rule_identifier: argv["rule-identifier"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					actions: parseObjectArray(argv["actions"], "actions"),
					enabled: argv["enabled"],
					matchers: parseObjectArray(argv["matchers"], "matchers"),
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					owner_worker_tag: resolveFileToken(
						argv["owner-worker-tag"] as string | undefined,
						"owner-worker-tag",
						"text"
					),
					priority: argv["priority"],
					source: argv["source"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						zone_id: zoneId,
						rule_identifier: argv["rule-identifier"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
