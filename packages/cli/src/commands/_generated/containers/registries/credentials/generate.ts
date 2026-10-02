import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * generate command
 * @generated from apis/overlays/containers.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 containers registries credentials generate <domain>\n\nGenerates credentials for accessing a configured container image registry."
		)
		.positional("domain", {
			type: "string",
			description: "The domain to get credentials for.",
			demandOption: true,
		})
		.option("expiration-minutes", {
			type: "number",
			description:
				"The number of minutes Cloudflare managed registry credentials stay valid. Required for managed registries and must remain positive. Cloudflare ignores this value for external registries.",
		})
		.option("permissions", {
			type: "string",
			array: true,
			description:
				"The permissions for Cloudflare managed registry credentials. Required for managed registries. Cloudflare ignores this value for external registries.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description:
				"Specifies the configuration for the image registry credential to create. Cloudflare requires both fields for managed registries. For external registries, Cloudflare ignores both fields, and the registry provider determines the returned credentials' permissions and lifetime.",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"generateImageRegistryCredentials">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "generate <domain>",
	describe: "Generate a JWT to interact with the specified image registry.",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "containers registries credentials generate",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf containers registries credentials generate",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/containers/registries/${argv["domain"] == null ? "<domain>" : encodeURIComponent(String(argv["domain"]))}/credentials`,
						pathParams: { domain: String(argv["domain"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										expiration_minutes: argv["expiration-minutes"],
										permissions: argv["permissions"],
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
						client.containers.registries.credentials.generate({
							...bodyData,
							account_id: accountId,
							domain: argv["domain"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					expiration_minutes: argv["expiration-minutes"],
					permissions: argv["permissions"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.containers.registries.credentials.generate({
						...bodyData,
						account_id: accountId,
						domain: argv["domain"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
