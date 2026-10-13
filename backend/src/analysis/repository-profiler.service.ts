import { Injectable } from '@nestjs/common';
import type { RepositoryFile } from '../github/github.service.js';

export type RepositoryFramework = 'angular' | 'react' | 'nestjs' | 'node' | 'unknown';
export type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'unknown';

export interface RepositoryProfile {
  framework: RepositoryFramework;
  packageManager: PackageManager;
  scripts: ReadonlySet<string>;
  sourceFiles: RepositoryFile[];
  testFiles: RepositoryFile[];
  hasFrontend: boolean;
  hasBackend: boolean;
  hasCi: boolean;
}

export function isTestFile(path: string): boolean {
  return /(^|\/)(__tests__|test|tests)(\/|$)|\.(spec|test)\.[cm]?[jt]sx?$/i.test(path);
}

export function isSourceFile(path: string): boolean {
  return /\.[cm]?[jt]sx?$/i.test(path) && !isTestFile(path) && !/\.d\.ts$/i.test(path);
}

@Injectable()
export class RepositoryProfiler {
  profile(files: RepositoryFile[]): RepositoryProfile {
    const packageFile = files.find((file) => /(^|\/)package\.json$/i.test(file.path));
    let manifest: Record<string, unknown> = {};
    try {
      manifest = JSON.parse(packageFile?.content ?? '{}') as Record<string, unknown>;
    } catch {
      manifest = {};
    }
    const dependencies = {
      ...(this.record(manifest['dependencies'])),
      ...(this.record(manifest['devDependencies'])),
    };
    const scriptsRecord = this.record(manifest['scripts']);
    const framework: RepositoryFramework =
      '@angular/core' in dependencies ? 'angular' :
      'react' in dependencies ? 'react' :
      '@nestjs/core' in dependencies ? 'nestjs' :
      packageFile ? 'node' : 'unknown';

    return {
      framework,
      packageManager: this.packageManager(files, manifest['packageManager']),
      scripts: new Set(Object.keys(scriptsRecord)),
      sourceFiles: files.filter((file) => isSourceFile(file.path)),
      testFiles: files.filter((file) => isTestFile(file.path)),
      hasFrontend:
        framework === 'angular' || framework === 'react' ||
        files.some((file) => /\.html?$/i.test(file.path)),
      hasBackend:
        framework === 'nestjs' || ['express', 'fastify', 'koa'].some((name) => name in dependencies),
      hasCi: files.some((file) =>
        /(^|\/)(\.github\/workflows\/.*\.ya?ml|\.gitlab-ci\.yml|Jenkinsfile)$/i.test(file.path),
      ),
    };
  }

  private record(value: unknown): Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
      ? value as Record<string, unknown>
      : {};
  }

  private packageManager(files: RepositoryFile[], declared: unknown): PackageManager {
    const value = typeof declared === 'string' ? declared.toLowerCase() : '';
    if (value.startsWith('pnpm') || files.some((file) => /(^|\/)pnpm-lock\.yaml$/i.test(file.path))) return 'pnpm';
    if (value.startsWith('yarn') || files.some((file) => /(^|\/)yarn\.lock$/i.test(file.path))) return 'yarn';
    if (value.startsWith('npm') || files.some((file) => /(^|\/)package-lock\.json$/i.test(file.path))) return 'npm';
    return 'unknown';
  }
}
