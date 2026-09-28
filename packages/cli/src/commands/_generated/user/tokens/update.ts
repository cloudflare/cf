import { createCommandClient } from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/user.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage("$0 user tokens update <token-id>\n\nUpdate an existing token.")
		.positional("token-id", {
			type: "string",
			description: "Token identifier tag.",
			demandOption: true,
		})
		.option("condition-request-ip-in", {
			type: "string",
			array: true,
			description: "List of IPv4/IPv6 CIDR addresses.",
		})
		.option("condition-request-ip-not-in", {
			type: "string",
			array: true,
			description: "List of IPv4/IPv6 CIDR addresses.",
		})
		.option("expires-on", {
			type: "string",
			description:
				"The expiration time on or after which the JWT MUST NOT be accepted for processing.",
		})
		.option("name", { type: "string", description: "Token name." })
		.option("not-before", {
			type: "string",
			description:
				"The time before which the token MUST NOT be accepted for processing.",
		})
		.option("policies", {
			type: "string",
			description:
				"List of access policies assigned to the token. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("status", {
			type: "string",
			description: "Status of the token.",
			choices: ["active", "disabled", "expired"],
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

type Request = SdkRequest<"user-api-tokens-update-token">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <token-id>",
	describe: "Update Token",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "user tokens update",
				classification: {
					safeFlags: ["status", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf user tokens update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/user/tokens/${argv["token-id"] == null ? "<token-id>" : encodeURIComponent(String(argv["token-id"]))}`,
						pathParams: { "token-id": String(argv["token-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										condition: {
											request_ip: {
												in: argv["condition-request-ip-in"],
												not_in: argv["condition-request-ip-not-in"],
											},
										},
										expires_on: resolveFileToken(
											argv["expires-on"] as string | undefined,
											"expires-on",
											"text"
										),
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										not_before: resolveFileToken(
											argv["not-before"] as string | undefined,
											"not-before",
											"text"
										),
										policies: parseObjectArray(argv["policies"], "policies"),
										status: resolveFileToken(
											argv["status"] as string | undefined,
											"status",
											"text"
										),
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);

				if (argv.body) {
					const bodyData = parseBody<Request["body"]>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.user.tokens.update({
							body: bodyData,
							token_id: argv["token-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField("name", "Token name.");
				}
				if (argv["policies"] === undefined) {
					throw new Error(
						"--policies is required (or pass --body with this field set)."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					condition: {
						request_ip: {
							in: argv["condition-request-ip-in"],
							not_in: argv["condition-request-ip-not-in"],
						},
					},
					expires_on: resolveFileToken(
						argv["expires-on"] as string | undefined,
						"expires-on",
						"text"
					),
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					not_before: resolveFileToken(
						argv["not-before"] as string | undefined,
						"not-before",
						"text"
					),
					policies: parseObjectArray(argv["policies"], "policies"),
					status: resolveFileToken(
						argv["status"] as string | undefined,
						"status",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.user.tokens.update({
						body: bodyData,
						token_id: argv["token-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
