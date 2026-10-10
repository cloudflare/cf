/**
 * The tip printed after the interactive account picker. Its sentence joins
 * clack's guide; the snippet is indented to the same column but carries no
 * guide glyphs, so copying it from the terminal yields valid TypeScript.
 */
import { relative } from "node:path";
import * as clack from "@clack/prompts";
import {
	CLOUDFLARE_CONFIG_FILENAME,
	findCloudflareConfig,
} from "../project-settings.js";
import { wrapPlain } from "../ui/blocks.js";
import { theme } from "../ui/theme.js";
import type { Writable } from "node:stream";

/** clack prefixes message lines with a glyph and two spaces (`│  `). */
const GUIDE_WIDTH = 3;

export function printAccountConfigHint(
	accountId: string,
	options: {
		cwd?: string;
		output?: Writable & { columns?: number };
		columns?: number;
	} = {}
): void {
	const { cwd = process.cwd(), output = process.stderr } = options;
	const columns = options.columns ?? (output.columns || 80);
	const configPath = findCloudflareConfig(cwd);
	const target = configPath
		? relative(cwd, configPath)
		: CLOUDFLARE_CONFIG_FILENAME;

	const sentence = configPath
		? `To make this the project's default account, add accountId to ${target}:`
		: `To make this the project's default account, create ${target}:`;
	const codeTokens = new Set(["accountId", target]);
	const lines = wrapPlain(sentence, Math.max(20, columns - GUIDE_WIDTH)).map(
		(line) =>
			line
				.split(" ")
				.map((word) => {
					const token = word.replace(/:$/, "");
					return codeTokens.has(token)
						? `${theme.code(token)}${word.slice(token.length)}`
						: word;
				})
				.join(" ")
	);
	clack.log.info(lines.join("\n"), { output });

	// Only the account ID is styled: below truecolor the theme falls back to
	// bold, which would otherwise scatter emphasis across the snippet.
	const property = `accountId: ${theme.jsonString(JSON.stringify(accountId))},`;
	const snippet = configPath
		? [property]
		: [
				`import { defineConfig } from "cf/config";`,
				"",
				"export default defineConfig({",
				`  ${property}`,
				"});",
			];
	const indent = " ".repeat(GUIDE_WIDTH);
	output.write(
		`\n${snippet.map((line) => (line ? indent + line : line)).join("\n")}\n\n`
	);
}
