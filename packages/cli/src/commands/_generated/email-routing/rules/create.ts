import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/email-routing.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 email-routing rules create\n\nRules consist of a set of criteria for matching emails (such as an email being sent to a specific custom email address) plus a set of actions to take on the email (like forwarding it to a specific destination address). Forward actions require exactly one verified destination address."
		)
		.option("actions", {
			type: "string",
			description:
				"List actions patterns. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("enabled", {
			type: "boolean",
			description: "Routing rule status.",
			default: true,
		})
		.option("matchers", {
			type: "string",
			description:
				"Matching patterns to forward to your actions. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("name", { type: "string", description: "Routing rule name." })
		.option("owner-worker-tag", {
			type: "string",
			description:
				"Public tag (script_tag) of the Worker that owns this rule. Required when\n`source` is `wrangler`.\n",
		})
		.option("priority", {
			type: "number",
			description: "Priority of the routing rule.",
			default: 0,
		})
		.option("source", {
			type: "string",
			description:
				"Who manages the rule. `api` covers dashboard, generic API, and Terraform;\n`wrangler` means the rule is managed by a Worker's wrangler.jsonc. Defaults\nto `api` when omitted on write.\n",
			choices: ["api", "wrangler"],
			default: "api",
		})
		.coerce("source", (value: string | undefined) =>
			resolveFileToken(value, "source", "text")
		)
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"email-routing-routing-rules-create-routing-rule">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create routing rule",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "email-routing rules create",
				classification: {
					safeFlags: ["enabled", "source", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf email-routing rules create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/email/routing/rules`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
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
				const client = await createCommandClient(argv);
				const zoneId = await getZoneId({ zone: argv.zone }, client, {
					quiet: argv.quiet,
				});
				argv.zoneId = zoneId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.emailRouting.rules.create({
							...bodyData,
							zone_id: zoneId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
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

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
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
				const result = await withProgress(`Creating`, async () =>
					client.emailRouting.rules.create({
						...bodyData,
						zone_id: zoneId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
