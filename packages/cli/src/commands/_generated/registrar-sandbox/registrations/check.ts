import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * check command
 * @generated from apis/overlays/registrar-sandbox.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 registrar-sandbox registrations check <domains>\n\nPerforms real-time, authoritative availability checks directly against domain registries. Use this endpoint to verify a domain is available before attempting registration via `POST /registrations`. **Important:** Unlike the Search endpoint, these results are authoritative and reflect current registry status. Always check availability immediately before registration as domain status can change rapidly. **Note:** This endpoint uses POST to accept a list of domains in the request body. It is a read-only operation — it does not create, modify, or reserve any domains. ### Extension support Only domains on extensions supported for programmatic registration by this API can be registered. If you check a domain on an unsupported extension, the response will include `registrable: false` with a `reason` field explaining why: - `extension_not_supported_via_api` — Cloudflare Registrar supports this extension in the dashboard, but it is not yet available for programmatic registration via this API. Register via `https://dash.cloudflare.com/{account_id}/domains/registrations` instead. - `extension_not_supported` — This extension is not supported by Cloudflare Registrar. - `extension_disallows_registration` — The extension's registry has temporarily or permanently frozen new registrations. No registrar can register domains on this extension at this time. - `domain_premium` — The domain is premium priced. Premium registration is not currently supported by this API. - `domain_unavailable` — The domain is already registered, reserved, or otherwise not available for registration on a supported extension. The `reason` field is only present when `registrable` is `false`. ### Behavior - Maximum 20 domains per request - Pricing is only returned for domains where `registrable: true` - Results are not cached; each request queries the registry ### Workflow 1. Call this endpoint with domains the user wants to register. 2. For each domain where `registrable: true`, present pricing to the user. 3. If `tier: premium`, note that premium registration is not currently supported by this API and do not proceed to `POST /registrations`. 4. Proceed to `POST /registrations` only for supported non-premium domains."
		)
		.positional("domains", {
			type: "string",
			description:
				"List of fully qualified domain names (FQDNs) to check for availability. Each domain must include the extension. - Minimum: 1 domain. - Maximum: 20 domains per request. - The response returns domains on unsupported extensions with \`registrable: false\` and a \`reason\` field. - The response may omit malformed domain names (e.g., names missing an extension). ",
			demandOption: true,
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description:
				'List of fully qualified domain names (FQDNs) to check. Each domain must include the extension (e.g., "example.com", not "example").',
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"sandbox-registrar-domain-discovery-check">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "check <domains>",
	describe: "Check domain availability",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "registrar-sandbox registrations check",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf registrar-sandbox registrations check",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/registrar-sandbox/domain-check`,
						pathParams: {},
						bodyKind: "json",
						body: argv.body !== undefined ? parseBody(argv.body) : undefined,
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.registrarSandbox.registrations.check({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				if (argv.body === undefined) {
					throw new Error(
						"--body is required for this command. Pass --body '<json>' or --body @path/to/file.json."
					);
				}
			}
		),
};

export default command;
