import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./create.js";
import {
	createCommandClient,
	getAccountId,
	requestApi,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, setNestedValue } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { readFileForFlag, resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "stream watermarks create",
			classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
				typeof argv
			>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf stream watermarks create",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/stream/watermarks`,
					pathParams: {},
					bodyKind: "multipart",
					body: {
						name: argv["name"],
						opacity: argv["opacity"],
						padding: argv["padding"],
						position: argv["position"],
						scale: argv["scale"],
						url: argv["url"],
						body: argv["body"],
						file: argv["file"],
					},
				});
				return;
			}
			const client = await createCommandClient(argv);
			const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
			argv.accountId = accountId;

			if (
				argv.file !== undefined ||
				argv.body !== undefined ||
				argv["name"] !== undefined ||
				argv["opacity"] !== undefined ||
				argv["padding"] !== undefined ||
				argv["position"] !== undefined ||
				argv["scale"] !== undefined
			) {
				const formData = new FormData();
				if (argv.file !== undefined) {
					const fileContent = readFileForFlag(argv.file);
					formData.append(
						"file",
						new Blob([fileContent]),
						argv.file.split(/[\\/]/).filter(Boolean).pop()
					);
				} else if (argv.body !== undefined) {
					formData.append("file", argv.body);
				}
				if (argv["name"] !== undefined)
					formData.append(
						"name",
						String(
							resolveFileToken(
								argv["name"] as string | undefined,
								"name",
								"text"
							) ?? ""
						)
					);
				if (argv["opacity"] !== undefined)
					formData.append("opacity", String(argv["opacity"]));
				if (argv["padding"] !== undefined)
					formData.append("padding", String(argv["padding"]));
				if (argv["position"] !== undefined)
					formData.append(
						"position",
						String(
							resolveFileToken(
								argv["position"] as string | undefined,
								"position",
								"text"
							) ?? ""
						)
					);
				if (argv["scale"] !== undefined)
					formData.append("scale", String(argv["scale"]));
				const result = await withProgress(`Creating`, async () =>
					requestApi<unknown>(
						client,
						"POST",
						`/accounts/${accountId}/stream/watermarks`,
						{ body: formData }
					)
				);
				formatOutput(result, { successLabel: `Created` });
				return;
			}

			if (argv.body !== undefined) {
				const bodyData = parseBody(argv.body);
				const result = await withProgress(`Creating`, async () =>
					requestApi<unknown>(
						client,
						"POST",
						`/accounts/${accountId}/stream/watermarks`,
						{ body: bodyData }
					)
				);
				formatOutput(result, { successLabel: `Created` });
				return;
			}

			// Assemble request body from individual flags
			const bodyData: Record<string, unknown> = {};
			if (argv["name"] !== undefined)
				setNestedValue(
					bodyData,
					["name"],
					resolveFileToken(argv["name"] as string | undefined, "name", "text")
				);
			if (argv["opacity"] !== undefined)
				setNestedValue(bodyData, ["opacity"], argv["opacity"]);
			if (argv["padding"] !== undefined)
				setNestedValue(bodyData, ["padding"], argv["padding"]);
			if (argv["position"] !== undefined)
				setNestedValue(
					bodyData,
					["position"],
					resolveFileToken(
						argv["position"] as string | undefined,
						"position",
						"text"
					)
				);
			if (argv["scale"] !== undefined)
				setNestedValue(bodyData, ["scale"], argv["scale"]);
			if (argv["url"] !== undefined)
				setNestedValue(
					bodyData,
					["url"],
					resolveFileToken(argv["url"] as string | undefined, "url", "text")
				);
			const result = await withProgress(`Creating`, async () =>
				requestApi<unknown>(
					client,
					"POST",
					`/accounts/${accountId}/stream/watermarks`,
					{ body: bodyData }
				)
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
