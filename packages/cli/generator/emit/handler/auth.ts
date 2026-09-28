/**
 * Emit the post-dry-run auth + context-resolution block.
 *
 * Three pieces in order:
 *   1. `createCommandClient(argv)` — builds the SDK client so `--local`
 *      can swap the fetch transport transparently.
 *   2. Account-id resolution (when needed): in `--local` mode use the
 *      placeholder constant, otherwise call `getAccountId`. The
 *      resolved value is stashed on `argv.accountId` so downstream
 *      error-handling URL templates can render the real id. `account_id`
 *      is passed per-call to the SDK, so the client no longer binds it.
 *   3. Zone-id resolution (when needed): pull from positional or the
 *      global `--zone` flag via `getZoneId`.
 *   4. Worker-name resolution (when needed): same pattern but for
 *      `--worker`.
 */
import { toKebabCase } from "@cloudflare/forge";
import { argLocalIdent, argvKey } from "../../codegen/identifiers.js";
import { positionalArgs } from "../../intermediate-representation.js";
import type { EmitContext } from "../context.js";

export function emitAuth(ctx: EmitContext): string[] {
	const {
		needsAccountId,
		needsZoneId,
		needsWorkerName,
		hasAccountOrZoneScope,
		firstPositionalIsZone,
		firstPositionalIsWorkerName,
		derived,
	} = ctx;
	const lines: string[] = [];

	lines.push(`      const client = await createCommandClient(argv);`);

	if (hasAccountOrZoneScope) {
		// The combined template represents two concrete API routes. Account
		// scope is the default; --zone switches the request to /zones/.
		lines.push(
			`      const accountOrZone = argv.zone === undefined ? "accounts" : "zones";`
		);
		lines.push(`      const accountOrZoneId = accountOrZone === "zones"`);
		lines.push(
			`        ? await getZoneId({ zone: argv.zone }, client, { quiet: argv.quiet })`
		);
		lines.push(
			`        : argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();`
		);
		lines.push(`      if (accountOrZone === "zones") {`);
		lines.push(`        argv.zoneId = accountOrZoneId;`);
		lines.push(`      } else {`);
		lines.push(`        argv.accountId = accountOrZoneId;`);
		lines.push(`      }`);
	} else if (needsAccountId) {
		// In `--local` mode skip the resolution entirely — the
		// local-explorer doesn't scope by account, and the fetch
		// wrapper strips `/accounts/{id}/` from every URL before it
		// lands.
		lines.push(
			`      const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();`
		);
		lines.push(`      argv.accountId = accountId;`);
	}

	if (needsZoneId && !hasAccountOrZoneScope) {
		if (firstPositionalIsZone) {
			// Resolve into a snake_case local (a hyphenated kebab key can't
			// be a JS identifier); util.ts references the same
			// `argLocalIdent`-derived name when building the URL.
			const pos = positionalArgs(derived.args)[0]!;
			const localIdent = argLocalIdent(pos.name);
			const read = argvKey(pos.name);
			lines.push(
				`      const ${localIdent} = await getZoneId({ zone: argv.zone, zoneId: ${read} }, client, { quiet: argv.quiet });`
			);
			lines.push(`      ${read} = ${localIdent};`);
		} else {
			// Auto-derive: zone comes from --zone flag, not a positional.
			lines.push(
				`      const zoneId = await getZoneId({ zone: argv.zone }, client, { quiet: argv.quiet });`
			);
			lines.push(`      argv.zoneId = zoneId;`);
		}
	}

	if (needsWorkerName) {
		// The local var is always `scriptName` (the URL substitution in
		// substitutePathTemplate hard-codes `${scriptName}`); only the
		// argv read key differs between a positional and the --worker
		// option.
		const read = firstPositionalIsWorkerName
			? argvKey(toKebabCase(positionalArgs(derived.args)[0]!.name))
			: `argv["worker"]`;
		lines.push(
			`      const scriptName = getWorkerName({ scriptName: ${read} });`
		);
		lines.push(`      ${read} = scriptName;`);
	}

	return lines;
}
