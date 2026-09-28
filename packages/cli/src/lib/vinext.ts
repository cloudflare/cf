// TODO: The logic in this file is to make sure that for vinext projects we run
// `vite dev` and `vite build` instead of `next dev` and `next build`.
// This is done here for a quick fix but a more proper change should be applied
// to @cloudflare/autoconfig (and this file should then be deleted).

import { isPackageInstalled } from "@cloudflare/workers-utils";
import type { AutoConfigDetails } from "@cloudflare/autoconfig";

type VinextProjectDetails = AutoConfigDetails & {
	framework: NonNullable<AutoConfigDetails["framework"]>;
};

export function maybeApplyVinextCommandOverrides(
	details: AutoConfigDetails
): AutoConfigDetails {
	if (!isVinextProject(details)) {
		return details;
	}

	return {
		...details,
		// Skip Next.js autoconfiguration, which would run the incompatible
		// @opennextjs/cloudflare migration before delegating to Vite.
		configured: true,
		framework: Object.assign(Object.create(details.framework), {
			supportsMode: true,
		}),
		devCommand: getVinextCommand(details, "dev"),
		buildCommand: getVinextCommand(details, "build"),
		env: {
			...details.env,
			CLOUDFLARE_VITE_FORCE_BUILD_OUTPUT: "true",
		},
	};
}

function isVinextProject(
	details: AutoConfigDetails
): details is VinextProjectDetails {
	return (
		details.framework?.id === "next" &&
		(details.packageJson?.dependencies?.vinext !== undefined ||
			details.packageJson?.devDependencies?.vinext !== undefined) &&
		isPackageInstalled("vinext", details.projectPath)
	);
}

function getVinextCommand(
	details: AutoConfigDetails,
	command: "dev" | "build"
): string {
	return `${details.packageManager.npx} vite ${command}`;
}
