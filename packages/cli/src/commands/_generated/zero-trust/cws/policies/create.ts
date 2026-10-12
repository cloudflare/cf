import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/zero-trust.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 zero-trust cws policies create\n\nCreates a policy from inline Rego source and an entrypoint. Omit filter to apply the policy to every request."
		)
		.option("description", {
			type: "string",
			description: "Optional free-form description.",
		})
		.option("entrypoint", {
			type: "string",
			description:
				"Non-function rule declared in rego_source. Evaluation uses data.<package_path>.<entrypoint>.",
		})
		.option("filter", {
			type: "string",
			description:
				"Optional filter expression that determines whether this policy applies. Omit or set null to apply the policy to every request. Maximum 4096 UTF-8 bytes.",
		})
		.option("name", { type: "string", description: "Name of the policy" })
		.option("rego-source", {
			type: "string",
			description:
				'Inline Rego source with a package beginning with "policy." Maximum 16384 UTF-8 bytes.',
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

type Request = SdkRequest<"cws-create-policy">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create a new policy",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust cws policies create",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust cws policies create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cws/policies`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										description: resolveFileToken(
											argv["description"] as string | undefined,
											"description",
											"text"
										),
										entrypoint: resolveFileToken(
											argv["entrypoint"] as string | undefined,
											"entrypoint",
											"text"
										),
										filter: resolveFileToken(
											argv["filter"] as string | undefined,
											"filter",
											"text"
										),
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										rego_source: resolveFileToken(
											argv["rego-source"] as string | undefined,
											"rego-source",
											"text"
										),
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.zeroTrust.cws.policies.create({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["entrypoint"] === undefined) {
					argv["entrypoint"] = await promptForRequiredField(
						"entrypoint",
						"Non-function rule declared in rego_source. Evaluation uses data.<package_path>.<entrypoint>."
					);
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField(
						"name",
						"Name of the policy"
					);
				}
				if (argv["rego-source"] === undefined) {
					argv["rego-source"] = await promptForRequiredField(
						"rego-source",
						'Inline Rego source with a package beginning with "policy." Maximum 16384 UTF-8 bytes.'
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					description: resolveFileToken(
						argv["description"] as string | undefined,
						"description",
						"text"
					),
					entrypoint: resolveFileToken(
						argv["entrypoint"] as string | undefined,
						"entrypoint",
						"text"
					),
					filter: resolveFileToken(
						argv["filter"] as string | undefined,
						"filter",
						"text"
					),
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					rego_source: resolveFileToken(
						argv["rego-source"] as string | undefined,
						"rego-source",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.zeroTrust.cws.policies.create({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
