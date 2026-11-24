/**
 * Legacy builder argv types for hand-written commands. Generated API commands
 * infer handler inputs from their native parameter declarations in api-command.ts.
 *
 * Modelled on wrangler's `StrictYargsOptionsToInterface` /
 * `CommonYargsOptions` pair (see `packages/wrangler/src/yargs-types.ts`
 * in workers-sdk); the conventions are intentionally identical so the
 * future wrangler ⇄ cf convergence has one less surface to reconcile.
 */
import type { Argv } from "yargs";

/**
 * Yargs options registered on every cf command via `.option(..., {
 * global: true })` in `src/index.ts`. Mirror any addition / removal
 * there.
 *
 * Fields are kept in the on-the-wire spelling (kebab) the user actually
 * types. The camelCase aliases (`persistTo`) are added by
 * {@link ArgumentsCamelCase} downstream, so handlers can reach for
 * either form.
 */
export interface CommonYargsOptions {
	quiet: boolean;
	zone: string | undefined;
	profile: string | undefined;
	mode: string | undefined;
	"temporary-account": boolean;
	"event-code": string | undefined;
	local: boolean;
	"persist-to": string | undefined;
}

/**
 * Strip the `[key: string]: unknown` index signature off a yargs argv
 * type. Without this, every property access on a derived `Args` is
 * `unknown` and the handler has to cast everywhere.
 *
 * Lifted verbatim from wrangler.
 */
export type RemoveIndex<T> = {
	[
		K in keyof T as string extends K ? never : number extends K ? never : K
	]: T[K];
};

/**
 * Project a yargs builder function (`(y: Argv<…>) => Argv<P>`) back
 * into the raw option-set type `P`.
 *
 * This is what {@link import("yargs").CommandModule} expects as its
 * second generic parameter — yargs internally wraps it in
 * `ArgumentsCamelCase<…>` when typing the handler's `argv`, so the
 * handler sees both kebab and camelCase forms without us having to
 * pre-apply the wrapper here. (Pre-applying breaks the type:
 * `Argv<ArgumentsCamelCase<P>>` is not assignable to
 * `Argv<P>` because of contravariance on the `.check` callback.)
 *
 * Usage:
 *
 * ```ts
 * function build(y: Argv<CommonYargsOptions>) {
 *   return y.option('count', { type: 'number' });
 * }
 * type Args = InferArgs<typeof build>;
 * const cmd: CommandModule<CommonYargsOptions, Args> = {
 *   builder: build,
 *   handler: (argv) => { argv.count; argv.local; },
 * };
 * ```
 */
export type InferArgs<Builder extends (y: never) => Argv> =
	ReturnType<Builder> extends Argv<infer P> ? RemoveIndex<P> : never;
