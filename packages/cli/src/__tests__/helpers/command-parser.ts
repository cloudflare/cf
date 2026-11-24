import { stripTypeScriptTypes } from "node:module";
import { Script } from "node:vm";
import type { CommandModule } from "yargs";
import type { Options } from "yargs";
import { apiCommand } from "#lib/api-command.js";
import { createParser } from "#lib/stricli.js";

export function generatedParameters(lines: string[]) {
	const parameters = new Script(
		stripTypeScriptTypes(`({${lines.join("\n")}})`)
	).runInNewContext() as Pick<
		Parameters<typeof apiCommand>[0],
		"flags" | "operands" | "rules"
	>;
	return apiCommand({
		command: "test",
		describe: "test",
		usage: "",
		...parameters,
		async handler() {},
	});
}

export function generatedOptions(source: string) {
	const code = stripTypeScriptTypes(source)
		.replace(/^import[\s\S]*?;\n/gm, "")
		.replace("export default command;", "command;");
	const command = new Script(code).runInNewContext({
		apiCommand,
	}) as ReturnType<typeof apiCommand>;
	const flags: Record<string, Options> = {};
	command.configure({
		usage() {},
		positional() {},
		group() {},
		check() {},
		implies() {},
		conflicts() {},
		option(name, options) {
			flags[name] = Object.fromEntries(
				Object.entries(options).filter(
					([key, value]) =>
						value !== undefined && !(key === "demandOption" && !value)
				)
			);
		},
	});
	return flags;
}

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
