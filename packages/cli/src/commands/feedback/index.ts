import { randomUUID } from "node:crypto";
import { isDoNotTrackEnabled } from "@cloudflare/workers-utils";
import { getAuthToken } from "../../lib/auth-token.js";
import { MissingCredentialsError } from "../../lib/errors.js";
import { readFileForFlag } from "../../lib/input-validation.js";
import { formatOutput, printSuccess } from "../../lib/output.js";
import { log } from "../../lib/ui/log.js";
import { buildClientContext } from "./context.js";
import { buildSubmission } from "./payload.js";
import { feedbackUrl, sendFeedback } from "./send.js";
import type { CommonYargsOptions, InferArgs } from "../../lib/cli-types.js";
import type { Argv, CommandModule } from "yargs";

const MAX_REPORT_KIB = 16;
const AGENT_EXAMPLE = `echo '{"task":"Deploy a Worker","expected":"Deploy succeeds","actual":"Error 10000","impact":"blocked","agent":{"name":"claude-code","model":"claude-opus-5-5","errors":[{"message":"Authentication error","code":10000}]}}' | cf feedback --input-json -`;

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.positional("note", {
			type: "string",
			description:
				"What happened or what would have helped; - reads it from stdin",
		})
		.option("field", {
			type: "string",
			array: true,
			description: "A key=value detail; repeat for more (see Fields below)",
		})
		.option("input-json", {
			type: "string",
			description:
				"A JSON report from a file, or - for stdin (put it last, or write --input-json=-); meant for agents",
		})
		.option("dry-run", {
			type: "boolean",
			default: false,
			description: "Print the submission without sending it",
		})
		.example(
			'cf feedback "the deploy output does not say which account it used"',
			"Send a note"
		)
		.example(
			"cf feedback --field type=bug --field product=workers --field expected=… --field actual=…",
			"Send structured detail"
		)
		.example(AGENT_EXAMPLE, "Send an agent report through --input-json -")
		.epilogue(
			[
				...(isDoNotTrackEnabled()
					? [
							"DO_NOT_TRACK is enabled. Sending feedback includes diagnostic context in the report.",
						]
					: []),
				"Sends bugs, friction and feature requests to the cf team. A note on its own is enough.",
				"Sign in with cf auth login or set CLOUDFLARE_API_TOKEN before running this command.",
				"Feedback reports include the CLI version, OS, and detected agent and model for diagnostics.",
				`The complete JSON report, including diagnostic context, is limited to ${MAX_REPORT_KIB} KiB.`,
				"Feedback request headers include the cf version, execution mode, and detected agent harness, if available.",
				"Fields (all optional): type (bug, friction, feature, docs, praise, other), product, command, task, attempted, expected, actual, impact (blocked, worked_around, friction, none), suggestion, rating (1–5), sentiment, model. Other keys are kept as free-form fields.",
				"Agents can send a JSON report with the same fields plus an agent object (name, model, commands, errors, repro_steps, docs_urls). --field values win over the report.",
				"Do not include secrets, personal data or account identifiers. Known secrets are removed before storage. Do not resend after seeing ignored fields.",
				"After sending feedback, agents should tell the user at the next natural break, such as the end of the current turn, and include the submission ID.",
			].join("\n\n")
		);
}

type FeedbackArgs = InferArgs<typeof builder>;

async function readStdin(): Promise<string> {
	if (process.stdin.isTTY) {
		throw new Error(
			"Nothing to read on stdin. Pipe the input or pass it as an argument."
		);
	}
	const chunks: Buffer[] = [];
	for await (const chunk of process.stdin) {
		chunks.push(Buffer.from(chunk));
	}
	const text = Buffer.concat(chunks).toString("utf-8");
	return text.endsWith("\n") ? text.slice(0, -1) : text;
}

// The root parser turns a bare "-" into "", so both mean stdin.
const isStdin = (value: string | undefined) => value === "-" || value === "";

async function readInputJson(source: string): Promise<unknown> {
	const text = isStdin(source)
		? await readStdin()
		: readFileForFlag(source).toString("utf-8");
	try {
		return JSON.parse(text);
	} catch (cause) {
		throw new Error(
			`--input-json is not valid JSON: ${(cause as Error).message}`,
			{ cause }
		);
	}
}

function reportReceiptNotes(
	receipt: Awaited<ReturnType<typeof sendFeedback>>
): void {
	if (receipt.notices?.includes("credential_redacted")) {
		log.warn(
			"A credential was removed from your feedback before it was stored. If it was real, rotate it."
		);
	}
	if (receipt.ignored && receipt.ignored.length > 0) {
		const listed = receipt.ignored
			.map((i) => `${i.path} (${i.reason})`)
			.join(", ");
		log.warn(
			`Some fields were not stored as sent: ${listed}. Do not resend; the rest was received.`
		);
	}
}

const feedbackCommand: CommandModule<CommonYargsOptions, FeedbackArgs> = {
	command: "feedback [note]",
	describe: "Send feedback about cf to the cf team",
	builder,
	handler: async (argv) => {
		if (argv["temporary-account"]) {
			throw new Error(
				"Temporary accounts cannot submit feedback. Run 'cf auth login' first."
			);
		}
		try {
			await getAuthToken();
		} catch (error) {
			if (error instanceof MissingCredentialsError) {
				throw new Error(
					`Authentication is required to submit feedback.\n\n${error.message}`,
					{ cause: error }
				);
			}
			throw error;
		}

		const inputSource = argv["input-json"];
		// `--input-json -` leaves its "-" behind as the note, which arrives as "".
		const displacedDash = inputSource === "" && argv.note === "";
		const noteFromStdin = !displacedDash && isStdin(argv.note);
		if (noteFromStdin && isStdin(inputSource)) {
			throw new Error(
				"Only one of the note and --input-json can read from stdin."
			);
		}
		const note = noteFromStdin
			? await readStdin()
			: displacedDash
				? undefined
				: argv.note;
		const inputJson =
			inputSource === undefined ? undefined : await readInputJson(inputSource);

		const { submission, overridden } = buildSubmission({
			note: note?.trim() ? note : undefined,
			fieldArgs: (argv.field ?? []).map(String),
			inputJson,
			client: buildClientContext(),
			submissionId: randomUUID(),
			sentAt: new Date().toISOString(),
		});
		for (const path of overridden) {
			log.warn(`--field replaced ${path} from --input-json.`);
		}

		if (Buffer.byteLength(JSON.stringify(submission)) > MAX_REPORT_KIB * 1024) {
			throw new Error(
				`Feedback is larger than ${MAX_REPORT_KIB} KiB. Shorten the note or the report.`
			);
		}

		const url = await feedbackUrl();
		if (argv["dry-run"]) {
			formatOutput({ dryRun: true, url, payload: submission });
			return;
		}

		const receipt = await sendFeedback(url, submission);
		formatOutput(receipt);
		reportReceiptNotes(receipt);
		printSuccess(`Feedback sent (${receipt.submission_id}). Thank you.`);
	},
};

export default feedbackCommand;
