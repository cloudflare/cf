import { createCommandClient } from "#lib/auth.js";
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
 * edit command
 * @generated from apis/overlays/user.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage("$0 user edit\n\nEdit part of your user details.")
		.option("country", {
			type: "string",
			description: "The country in which the user lives.",
		})
		.option("first-name", { type: "string", description: "User's first name" })
		.option("last-name", { type: "string", description: "User's last name" })
		.option("telephone", {
			type: "string",
			description: "User's telephone number",
		})
		.option("zipcode", {
			type: "string",
			description: "The zipcode or postal code where the user lives.",
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

type Request = SdkRequest<"user-edit-user">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "edit",
	describe: "Edit User",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "user edit",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf user edit",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/user`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										country: resolveFileToken(
											argv["country"] as string | undefined,
											"country",
											"text"
										),
										first_name: resolveFileToken(
											argv["first-name"] as string | undefined,
											"first-name",
											"text"
										),
										last_name: resolveFileToken(
											argv["last-name"] as string | undefined,
											"last-name",
											"text"
										),
										telephone: resolveFileToken(
											argv["telephone"] as string | undefined,
											"telephone",
											"text"
										),
										zipcode: resolveFileToken(
											argv["zipcode"] as string | undefined,
											"zipcode",
											"text"
										),
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.user.edit({ ...bodyData } satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					country: resolveFileToken(
						argv["country"] as string | undefined,
						"country",
						"text"
					),
					first_name: resolveFileToken(
						argv["first-name"] as string | undefined,
						"first-name",
						"text"
					),
					last_name: resolveFileToken(
						argv["last-name"] as string | undefined,
						"last-name",
						"text"
					),
					telephone: resolveFileToken(
						argv["telephone"] as string | undefined,
						"telephone",
						"text"
					),
					zipcode: resolveFileToken(
						argv["zipcode"] as string | undefined,
						"zipcode",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.user.edit({ ...bodyData } satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
