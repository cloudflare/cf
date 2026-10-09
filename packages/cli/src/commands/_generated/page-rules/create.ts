import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/page-rules.ts
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
		.usage("$0 page-rules create\n\nCreates a new Page Rule.")
		.option("actions", {
			type: "string",
			description:
				"The set of actions to perform if the targets of this rule match the\nrequest. Actions can redirect to another URL or override settings, but\nnot both.\n. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("priority", {
			type: "number",
			description:
				"The priority of the rule, used to define which Page Rule is processed\nover another. A higher number indicates a higher priority. For example,\nif you have a catch-all Page Rule (rule A: `/images/*`) but want a more\nspecific Page Rule to take precedence (rule B: `/images/special/*`),\nspecify a higher priority for rule B so it overrides rule A.\n",
			default: 1,
		})
		.option("status", {
			type: "string",
			description: "The status of the Page Rule.",
			choices: ["active", "disabled"],
			default: "disabled",
		})
		.coerce("status", (value: string | undefined) =>
			resolveFileToken(value, "status", "text")
		)
		.option("targets", {
			type: "string",
			description:
				"The rule targets to evaluate on each request. Provide as a JSON array of objects or @path/to/file.json.",
		})
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

type Request = SdkRequest<"page-rules-create-a-page-rule">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create a Page Rule",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "page-rules create",
				classification: {
					safeFlags: ["status", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf page-rules create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/pagerules`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
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
				const client = await createCommandClient(argv);
				const zoneId = await getZoneId({ zone: argv.zone }, client, {
					quiet: argv.quiet,
				});
				argv.zoneId = zoneId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.pageRules.create({
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
				if (argv["targets"] === undefined) {
					throw new Error(
						"--targets is required (or pass --body with this field set)."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					actions: parseObjectArray(argv["actions"], "actions"),
					priority: argv["priority"],
					status: argv["status"],
					targets: parseObjectArray(argv["targets"], "targets"),
				});
				const result = await withProgress(`Creating`, async () =>
					client.pageRules.create({
						...bodyData,
						zone_id: zoneId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
