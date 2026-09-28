import { createCommandClient, requestApi } from "#lib/auth.js";
import { compactBody, parseBody, setNestedValue } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * create command
 * @generated from apis/overlays/accounts.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 accounts create\n\nCreate an Account. To create the Account within an Organization, provide `unit.id` and omit `standalone`. To create a standalone Free Account, provide `standalone: true` and omit `unit`. Providing both fields is invalid. If you omit both fields, Cloudflare can determine the destination only when the User is an administrator of exactly one Organization. Cloudflare creates the Account in that Organization; otherwise, the request returns an error."
		)
		.option("idempotency-key", {
			type: "string",
			description:
				"Optional key that identifies an Account-creation request. Free Account creation can require exactly one valid key, so API clients should send a key with every Account-creation request. Reuse the same key when retrying the same request.",
		})
		.option("name", { type: "string", description: "Account name" })
		.option("standalone", {
			type: "boolean",
			description:
				"Set to `true` and omit `unit` to create a standalone Free Account. If provided, this field must be `true`.",
		})
		.option("unit-id", { type: "string", description: "Tenant unit ID" })
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Parameters for account creation",
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create an Account",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "accounts create",
				classification: {
					safeFlags: ["standalone", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const headers: Record<string, string> = {};
				if (argv["idempotency-key"] !== undefined)
					headers["Idempotency-Key"] = String(argv["idempotency-key"]);
				if (argv.dryRun) {
					formatDryRun({
						command: "cf accounts create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										standalone: argv["standalone"],
										unit: {
											id: resolveFileToken(
												argv["unit-id"] as string | undefined,
												"unit-id",
												"text"
											),
										},
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);

				if (argv.body) {
					const bodyData = parseBody(argv.body);
					const result = await withProgress(`Creating`, async () =>
						requestApi<unknown>(client, "POST", `/accounts`, {
							body: bodyData,
							headers: Object.keys(headers).length > 0 ? headers : undefined,
						})
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField("name", "Account name");
				}

				// Assemble request body from individual flags
				const bodyData: Record<string, unknown> = {};
				if (argv["name"] !== undefined)
					setNestedValue(
						bodyData,
						["name"],
						resolveFileToken(argv["name"] as string | undefined, "name", "text")
					);
				if (argv["standalone"] !== undefined)
					setNestedValue(bodyData, ["standalone"], argv["standalone"]);
				if (argv["unit-id"] !== undefined)
					setNestedValue(
						bodyData,
						["unit", "id"],
						resolveFileToken(
							argv["unit-id"] as string | undefined,
							"unit-id",
							"text"
						)
					);
				const result = await withProgress(`Creating`, async () =>
					requestApi<unknown>(client, "POST", `/accounts`, {
						body: Object.keys(bodyData).length > 0 ? bodyData : undefined,
						headers: Object.keys(headers).length > 0 ? headers : undefined,
					})
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
