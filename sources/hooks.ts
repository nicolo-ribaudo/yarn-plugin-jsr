import { Hooks, structUtils, Workspace } from "@yarnpkg/core";
import { hasProcol, stripProtocol } from "./jsr-protocol/utils";

const has = Function.call.bind(Object.prototype.hasOwnProperty);

export async function beforeWorkspacePacking(
  workspace: Workspace,
  rawManifest: object
) {
  let updated = false;

  for (const dependencyType of ["dependencies", "peerDependencies"]) {
    const descs = workspace.manifest.getForScope(dependencyType).values();
    for (const descriptor of descs) {
      if (!hasProcol(descriptor.range)) continue;

      const raw = stripProtocol(descriptor.range);
      let scope, name, range;
      if (raw.startsWith("@")) {
        ({ scope, name, range } = structUtils.parseDescriptor(raw));
      } else {
        range = raw;
        ({ scope, name } = descriptor);
      }

      const newRange = `npm:@jsr/${scope}__${name}@${range}`;
      const ident = structUtils.stringifyIdent(descriptor);

      rawManifest[dependencyType][ident] = newRange;
      workspace.manifest.raw[dependencyType][ident] = newRange;
      workspace.manifest[dependencyType].set(
        descriptor.identHash,
        structUtils.makeDescriptor(descriptor, newRange)
      );

      updated = true;
    }
  }

  if (updated) {
    await workspace.project.configuration.triggerHook(
      (hooks: Hooks) => (hooks as any).beforeWorkspacePacking,
      workspace,
      rawManifest
    );
  }
}
