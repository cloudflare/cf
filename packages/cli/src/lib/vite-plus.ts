import type { AutoConfigDetails } from "@cloudflare/autoconfig";

// Keep this adapter until cf consumes the autoconfig release with Vite+ command
// detection. Vite+'s Vite alias intentionally does not expose a `vite` binary.
export function maybeApplyVitePlusCommandOverrides(
	details: AutoConfigDetails
): AutoConfigDetails {
	if (
		!details.packageJson?.dependencies?.["vite-plus"] &&
		!details.packageJson?.devDependencies?.["vite-plus"]
	) {
		return details;
	}
	const runner = details.packageManager.npx;
	return {
		...details,
		devCommand:
			details.devCommand === `${runner} vite` ||
			details.devCommand === `${runner} vite dev`
				? `${runner} vp dev`
				: details.devCommand,
		buildCommand:
			details.buildCommand === `${runner} vite build`
				? `${runner} vp build`
				: details.buildCommand,
	};
}
