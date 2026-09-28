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
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/zero-trust.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 zero-trust gateway proxy-endpoints create\n\nCreate a new Zero Trust Gateway proxy endpoint."
		)
		.option("kind", {
			type: "string",
			description: "The proxy endpoint kind.",
			choices: ["ip", "identity"],
			default: "ip",
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

type Request =
	SdkRequest<"zero-trust-gateway-proxy-endpoints-create-proxy-endpoint">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create a proxy endpoint",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust gateway proxy-endpoints create",
				classification: {
					safeFlags: ["kind", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust gateway proxy-endpoints create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/gateway/proxy_endpoints`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										kind: resolveFileToken(
											argv["kind"] as string | undefined,
											"kind",
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
					const bodyData = parseBody<Request["body"]>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.zeroTrust.gateway.proxyEndpoints.create({
							body: bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				if (argv["kind"] === "ip") {
					throw new Error(
						"The ip variant requires ips, which cannot be supplied as flags. Pass --body with a complete request body."
					);
				}
				if (argv["kind"] === "identity" && argv["kind"] === undefined) {
					argv["kind"] = await promptForRequiredField(
						"kind",
						"The proxy endpoint kind.",
						{ question: "Enter value for --kind" }
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					kind: resolveFileToken(
						argv["kind"] as string | undefined,
						"kind",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.zeroTrust.gateway.proxyEndpoints.create({
						body: bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
