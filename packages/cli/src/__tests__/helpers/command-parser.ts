import type { CommandModule } from "yargs";
import { createParser } from "#lib/stricli.js";

export function commandParser<Input, Output>(
	args: string[],
	command: CommandModule<Input, Output>
) {
	let parsed: Record<string, unknown> = {};
	const parser = createParser(args, [command as unknown as CommandModule], {
		resolve() {},
		helpWidth: Infinity,
		help: (text) => text,
		shown() {},
		fail(message) {
			throw new Error(message);
		},
		async startup(argv) {
			parsed = argv;
		},
	});
	return {
		getHelp: parser.getHelp,
		async parse() {
			await parser.parse();
			return parsed;
		},
	};
}
