// Builds a GitHub dependency submission snapshot from bun.lock. GitHub's dependency graph
// does not parse bun.lock, so without this Dependabot alerts never see the real dependencies.
// Usage: node bun-lock-snapshot.mjs <sha> <ref> <job-correlator> <run-id>
import { readFileSync } from "node:fs";

const [sha, ref, correlator, runId] = process.argv.slice(2);

// bun.lock is JSONC with trailing commas
const lock = JSON.parse(readFileSync("bun.lock", "utf8").replace(/,(\s*[}\]])/g, "$1"));
const root = lock.workspaces[""];
const direct = new Set(Object.keys(root.dependencies ?? {}));
const dev = new Set(Object.keys(root.devDependencies ?? {}));

const purl = (spec) => {
    const at = spec.lastIndexOf("@");
    const name = spec.slice(0, at);
    return `pkg:npm/${name.replace("@", "%40")}@${spec.slice(at + 1)}`;
};

const resolved = {};
for (const [key, entry] of Object.entries(lock.packages)) {
    const spec = entry[0];
    // skip workspace, git and file packages: they have no npm version
    if (!/^(@[^/]+\/)?[^@]+@\d/.test(spec)) continue;
    const id = purl(spec);
    const name = spec.slice(0, spec.lastIndexOf("@"));
    const isTop = !key.includes("/") || (key.startsWith("@") && key.split("/").length === 2);
    resolved[id] = {
        package_url: id,
        relationship: isTop && (direct.has(name) || dev.has(name)) ? "direct" : "indirect",
        scope: isTop && dev.has(name) ? "development" : "runtime",
    };
}

process.stdout.write(
    JSON.stringify({
        version: 0,
        sha,
        ref,
        job: { correlator, id: runId },
        detector: { name: "bun-lock-snapshot", version: "1.0.0", url: "https://github.com/DCC-BS/coursebooker" },
        scanned: new Date().toISOString(),
        manifests: { "bun.lock": { name: "bun.lock", file: { source_location: "bun.lock" }, resolved } },
    }),
);
