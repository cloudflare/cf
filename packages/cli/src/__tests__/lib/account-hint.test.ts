import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { Writable } from "node:stream";
import { stripVTControlCharacters } from "node:util";
import { runInTempDir } from "@cloudflare/workers-utils/test-helpers";
import chalk from "chalk";
import { describe, expect, it } from "vite-plus/test";
import { printAccountConfigHint } from "../../lib/oauth/account-hint.js";

const ACCOUNT_ID = "023e105f4ecef8ad9ca31a8372d0c353";

function render(options: { cwd?: string; columns?: number } = {}): string {
	let text = "";
	const output = new Writable({
		write(chunk, _encoding, callback) {
			text += String(chunk);
			callback();
		},
	});
	printAccountConfigHint(ACCOUNT_ID, { columns: 100, ...options, output });
	// Bold is shown as **…**. Relative config paths use native separators.
	return stripVTControlCharacters(
		text.replaceAll("\u001b[1m", "**").replaceAll("\u001b[22m", "**")
	).replaceAll("\\", "/");
}

describe("printAccountConfigHint", () => {
	runInTempDir();

	it("shows only the property to add to the project's config", () => {
		writeFileSync(join(process.cwd(), "cloudflare.config.ts"), "");
		const nested = join(process.cwd(), "src");
		mkdirSync(nested);

		expect(render({ cwd: nested })).toMatchInlineSnapshot(`
			"│
			●  To make this the project's default account, add accountId to ../cloudflare.config.ts:

			   accountId: "023e105f4ecef8ad9ca31a8372d0c353",

			"
		`);
	});

	it("wraps inside clack's guide, keeping names and the account ID emphasized", () => {
		writeFileSync(join(process.cwd(), "cloudflare.config.ts"), "");
		// Below truecolor, the theme emphasizes with bold.
		const level = chalk.level;
		chalk.level = 1;
		try {
			expect(render({ columns: 50 })).toMatchInlineSnapshot(`
				"│
				●  To make this the project's default account, add
				│  **accountId** to **cloudflare.config.ts**:

				   accountId: **"023e105f4ecef8ad9ca31a8372d0c353"**,

				"
			`);
		} finally {
			chalk.level = level;
		}
	});
});
