import operation from "../../_operations/waiting-rooms/page/preview.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./preview.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "waiting-rooms page preview",
			classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
				typeof argv
			>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["custom-html"] === undefined) {
					argv["custom-html"] = await promptForRequiredField(
						"custom-html",
						"Only available for the Waiting Room Advanced subscription. This is a template html file that will be rendered at the edge. If no custom_page_html is provided, the default waiting room will be used. The template is based on mustache ( https://mustache.github.io/ ). There are several variables that are evaluated by the Cloudflare edge: 1. {{\`waitTimeKnown\`}} Acts like a boolean value that indicates the behavior to take when wait time is not available, for instance when queue_all is **true**. 2. {{\`waitTimeFormatted\`}} Estimated wait time for the user. For example, five minutes. Alternatively, you can use: 3. {{\`waitTime\`}} Number of minutes of estimated wait for a user. 4. {{\`waitTimeHours\`}} Number of hours of estimated wait for a user (\`Math.floor(waitTime/60)\`). 5. {{\`waitTimeHourMinutes\`}} Number of minutes above the \`waitTimeHours\` value (\`waitTime%60\`). 6. {{\`queueIsFull\`}} Changes to **true** when no more people can be added to the queue.  To view the full list of variables, look at the \`cfWaitingRoom\` object described under the \`json_response_enabled\` property in other Waiting Room API calls."
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				formatDryRun({
					command: "cf waiting-rooms page preview",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/waiting_rooms/preview`,
					pathParams: { "zone-id": String(argv.zone ?? argv["zone-id"] ?? "") },
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									custom_html: resolveFileToken(
										argv["custom-html"] as string | undefined,
										"custom-html",
										"text"
									),
								}),
				});
				return;
			}
			const parsedBody =
				argv.body !== undefined ? parseBody(argv.body) : undefined;
			const client = await createCommandClient(argv);
			const zoneId = await getZoneId({ zone: argv.zone }, client, {
				quiet: argv.quiet,
			});
			argv.zoneId = zoneId;

			if (argv.body !== undefined) {
				const bodyData = parsedBody;
				const result = await withProgress(`Loading`, async () =>
					client.send(operation, { body: bodyData, zone_id: zoneId })
				);
				formatOutput(result, { successLabel: `Loaded` });
				return;
			}
			await resolveRequiredFields();

			// Assemble request body from individual flags
			const bodyData = compactBody({
				custom_html: resolveFileToken(
					argv["custom-html"] as string | undefined,
					"custom-html",
					"text"
				),
			});
			const result = await withProgress(`Loading`, async () =>
				client.send(operation, { body: bodyData, zone_id: zoneId })
			);
			formatOutput(result, { successLabel: `Loaded` });
		}
	);
}
