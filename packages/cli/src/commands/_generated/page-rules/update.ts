import operation from "../_operations/page-rules/update.js";
/**
 * update command
 * @generated from apis/overlays/page-rules.ts
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
	command: "update <pagerule-id>",
	describe: "Update a Page Rule",
	usage:
		"$0 page-rules update <pagerule-id>\n\nReplaces the configuration of an existing Page Rule. The configuration of the updated Page Rule will exactly match the data passed in the API request.",
	flags: {
		actions: {
			kind: "parsed",
			brief:
				'The set of actions to perform if the targets of this rule match the\nrequest. Actions can redirect to another URL or override settings, but\nnot both. Provide as a JSON array of objects or @path/to/file.json. Shape: [({"id"?: "always_use_https"} | {"id"?: "automatic_https_rewrites", "value"?: "on" | "off"} | {"id"?: "browser_cache_ttl", "value"?: number} | ...more)]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		priority: {
			kind: "parsed",
			brief:
				"The priority of the rule, used to define which Page Rule is processed\nover another. A higher number indicates a higher priority. For example,\nif you have a catch-all Page Rule (rule A: `/images/*`) but want a more\nspecific Page Rule to take precedence (rule B: `/images/special/*`),\nspecify a higher priority for rule B so it overrides rule A.\n",
			optional: true,
			parse: Number,
		},
		status: {
			kind: "parsed",
			brief: "The status of the Page Rule.",
			optional: true,
			choices: ["active", "disabled"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "status", "text"),
		},
		targets: {
			kind: "parsed",
			brief:
				'The rule targets to evaluate on each request. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"constraint"?: {...}, "target"?: "url"}]. ? marks optional keys.',
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
		{ placeholder: "pagerule-id", brief: "Identifier.", parse: String },
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "page-rules update",
				classification: {
					safeFlags: ["status", "dry-run"],
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
					if (argv["targets"] === undefined) {
						throw new Error(
							"--targets is required (or pass --body with this field set)."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					formatDryRun({
						command: "cf page-rules update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/pagerules/${argv["pagerule-id"] == null ? "<pagerule-id>" : encodeURIComponent(String(argv["pagerule-id"]))}`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
							"pagerule-id": String(argv["pagerule-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										actions: parseObjectArray(argv["actions"], "actions"),
										priority: argv["priority"],
										status: argv["status"],
										targets: parseObjectArray(argv["targets"], "targets"),
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
							pagerule_id: argv["pagerule-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					actions: parseObjectArray(argv["actions"], "actions"),
					priority: argv["priority"],
					status: argv["status"],
					targets: parseObjectArray(argv["targets"], "targets"),
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						zone_id: zoneId,
						pagerule_id: argv["pagerule-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
