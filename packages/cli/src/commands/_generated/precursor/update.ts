import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/precursor.ts
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
			"$0 precursor update\n\nUpdates the Precursor configuration for a zone. `default_mode` sets the zone-level enforcement mode. `enforcement_rules` is the ordered list of rules that override enforcement for matching requests. This is a partial update: only the fields present in the request body are changed. - Sending an empty array (`[]`) clears all enforcement rules. - At least one of `default_mode` or `enforcement_rules` must be present; an empty body (`{}`) is rejected with `400`. - Rule `id` is read-only (assigned by Cloudflare) and ignored on input. - Rule `mode` must be `min-friction` or `max-security` (`off` is not a valid rule mode; use `default_mode` to disable enforcement). - Rule `expression` is limited to 4000 characters. The limit applies to each rule individually, not to the combined size of all rules."
		)
		.option("default-mode", {
			type: "string",
			description:
				"The zone-level Precursor enforcement mode applied to requests that do\nnot match a more specific enforcement rule.\n",
			choices: ["off", "min-friction", "max-security"],
		})
		.coerce("default-mode", (value) =>
			resolveFileToken(value, "default-mode", "text")
		)
		.option("enforcement-rules", {
			type: "string",
			description:
				"The ordered list of enforcement rules for the zone. Provide as a JSON array of objects or @path/to/file.json.",
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

type Request = SdkRequest<"precursor-for-a-zone-update-config">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update",
	describe: "Update Zone Precursor Config",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "precursor update",
				classification: {
					safeFlags: ["default-mode", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf precursor update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/precursor`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										default_mode: argv["default-mode"],
										enforcement_rules: parseObjectArray(
											argv["enforcement-rules"],
											"enforcement-rules"
										),
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
					const bodyData = parseBody<Request["body"]>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.precursor.update({
							body: bodyData,
							zone_id: zoneId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					default_mode: argv["default-mode"],
					enforcement_rules: parseObjectArray(
						argv["enforcement-rules"],
						"enforcement-rules"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.precursor.update({
						body: bodyData,
						zone_id: zoneId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
