import operation from "../../../_operations/ai-gateway/dynamic-routing/versions/create.js";
/**
 * create command
 * @generated from apis/overlays/ai-gateway.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "create <id>",
	describe: "Create a dynamic route version",
	usage:
		"$0 ai-gateway dynamic-routing versions create <id>\n\nCreates a new version of a dynamic route from the specified routing elements. The version does not serve traffic until you deploy it.",
	flags: {
		"gateway-id": { kind: "parsed", brief: "Gateway ID", parse: String },
		elements: {
			kind: "parsed",
			brief:
				'The elements field. Provide as a JSON array of objects or @path/to/file.json. Shape: [({"id": string, "outputs": {...}, "type": "start"} | {"id": string, "outputs": {...}, "properties": {...}, "type": "conditional"} | {"id": string, "outputs": {...}, "type": "percentage"} | ...more)].',
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [{ placeholder: "id", brief: "ID", parse: String }],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "ai-gateway dynamic-routing versions create",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["elements"] === undefined) {
						throw new Error(
							"--elements is required (or pass --body with this field set)."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf ai-gateway dynamic-routing versions create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/ai-gateway/gateways/${argv["gateway-id"] == null ? "<gateway-id>" : encodeURIComponent(String(argv["gateway-id"]))}/routes/${argv["id"] == null ? "<id>" : encodeURIComponent(String(argv["id"]))}/versions`,
						pathParams: {
							"gateway-id": String(argv["gateway-id"] ?? ""),
							id: String(argv["id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										elements: parseObjectArray(argv["elements"], "elements"),
									}),
					});
					return;
				}
				const parsedBody =
					argv.body !== undefined ? parseBody(argv.body) : undefined;
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Creating`, async () =>
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							gateway_id: argv["gateway-id"],
							id: argv["id"],
						})
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					elements: parseObjectArray(argv["elements"], "elements"),
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						gateway_id: argv["gateway-id"],
						id: argv["id"],
					})
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
