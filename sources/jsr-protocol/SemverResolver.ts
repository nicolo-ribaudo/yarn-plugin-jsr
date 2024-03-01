import type {
  Resolver,
  ResolveOptions,
  Descriptor,
  Locator,
  Package,
} from "@yarnpkg/core";

import { IdentHash, LinkType, structUtils } from "@yarnpkg/core";
import * as semver from "semver";

import { PROTOCOL, hasProcol, stripProtocol } from "./utils";

import * as jsr from "../jsr-registry";

export default class JsrSemverResolver implements Resolver {
  supportsDescriptor(descriptor: Descriptor): boolean {
    return (
      hasProcol(descriptor.range) &&
      !!semver.validRange(stripProtocol(descriptor.range))
    );
  }

  supportsLocator(locator: Locator): boolean {
    return hasProcol(locator.reference);
  }

  shouldPersistResolution(): boolean {
    return true;
  }

  bindDescriptor(descriptor: Descriptor): Descriptor {
    return descriptor;
  }

  getResolutionDependencies() {
    return {};
  }

  async getCandidates(descriptor: Descriptor) {
    if (!descriptor.scope) {
      throw new Error("jsr packages are scoped: @???/" + descriptor.name);
    }

    const range = new semver.Range(stripProtocol(descriptor.range));

    const versions = await jsr.getVersions(descriptor.scope, descriptor.name);

    let candiateVersions = versions.valid
      .map((v) => new semver.SemVer(v))
      .filter((v) => range.test(v));
    if (candiateVersions.length === 0) {
      candiateVersions = versions.yanked
        .map((v) => new semver.SemVer(v))
        .filter((v) => range.test(v));
    }
    candiateVersions.sort((a, b) => {
      return -a.compare(b);
    });

    return candiateVersions.map((version) =>
      structUtils.makeLocator(descriptor, `${PROTOCOL}${version.raw}`)
    );
  }

  async getSatisfying(
    descriptor: Descriptor,
    dependencies: Record<string, Package>,
    locators: Locator[],
    opts: ResolveOptions
  ): Promise<{ locators: Locator[]; sorted: boolean }> {
    throw new Error("Not implemented");
  }

  async resolve(locator: Locator, opts: ResolveOptions): Promise<Package> {
    const version = stripProtocol(locator.reference);

    const manifest = await jsr.getNpmMetadata(locator.scope, locator.name);
    const versionManifest = (manifest as any).versions[version];

    const dependencies = new Map<IdentHash, Descriptor>();
    for (let [fullName, range] of Object.entries(
      versionManifest.dependencies as { [name: string]: string }
    )) {
      const ident = structUtils.parseIdent(fullName);
      if (fullName.startsWith("@jsr/")) {
        const [scope, name] = fullName.slice("@jsr/".length).split("__");
        range = `jsr:@${scope}/${name}@${range}`;
      } else {
        range = `npm:${range}`;
      }
      const desc = structUtils.makeDescriptor(ident, range);
      dependencies.set(desc.identHash, desc);
    }

    return {
      ...locator,
      version,
      languageName: "node",
      linkType: LinkType.HARD,
      bin: new Map(),
      dependencies,
      dependenciesMeta: new Map(),
      peerDependencies: new Map(),
      peerDependenciesMeta: new Map(),
    };
  }
}
