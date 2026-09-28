import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/leaked-credential-checks.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			'$0 leaked-credential-checks detections create\n\nCreate a detection location for credentials that the default scan locations do not cover, using Rules language expressions such as `lookup_json_string(http.request.body.raw, "user")`. Only the username expression is required, and Leaked Credential Checks must be enabled on the zone.'
		)
		.option("password", {
			type: "string",
			description:
				"Defines ehe ruleset expression to use in matching the password in a request.",
		})
		.option("username", {
			type: "string",
			description:
				"Defines the ruleset expression to use in matching the username in a request.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description:
				"Defines a custom set of username/password expressions to match Leaked Credential Checks on.",
		});
}

type Args = InferArgs<typeof builder>;

type Request =
	SdkRequest<"waf-product-api-leaked-credentials-create-detection">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create a custom detection location for a zone.",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "leaked-credential-checks detections create",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf leaked-credential-checks detections create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/leaked-credential-checks/detections`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										password: resolveFileToken(
											argv["password"] as string | undefined,
											"password",
											"text"
										),
										username: resolveFileToken(
											argv["username"] as string | undefined,
											"username",
											"text"
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
					const result = await withProgress(`Creating`, async () =>
						client.leakedCredentialChecks.detections.create({
							body: bodyData,
							zone_id: zoneId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					password: resolveFileToken(
						argv["password"] as string | undefined,
						"password",
						"text"
					),
					username: resolveFileToken(
						argv["username"] as string | undefined,
						"username",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.leakedCredentialChecks.detections.create({
						body: bodyData,
						zone_id: zoneId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
