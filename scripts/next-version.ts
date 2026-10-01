#!/usr/bin/env bun
/**
 * Works out the next version from the conventional commits added since the last
 * v* tag and writes it into the two places that carry it: the plugin header and
 * package.json. composer.json has no version field on purpose -- Composer reads
 * the git tag, which is what the consuming site resolves `frontenda/frontenda-blocks`
 * against.
 *
 * The version is derived from the *tag*, never from the files. The release
 * pipeline runs on every push to main, so reading the header would compound an
 * earlier bump: three pushes would turn one `feat:` into three minor releases.
 * Deriving from the tag means a rerun on the same commit computes the same
 * number and changes nothing.
 *
 * Writes .next-version and .release-notes.md when a release is due. Their
 * absence is how the later pipeline steps know to stand down, so a push with
 * only chore/docs/refactor commits costs one step and publishes nothing.
 *
 * Usage: bun run scripts/next-version.ts [--dry-run]
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';

const DRY_RUN = process.argv.includes('--dry-run');

const PLUGIN_FILE = 'frontenda-blocks.php';
const PACKAGE_FILE = 'package.json';
const VERSION_FILE = '.next-version';
const NOTES_FILE = '.release-notes.md';

const HEADER_VERSION_PATTERN = /^(\s*\*\s*Version:\s*)(.+)$/m;

function git(...args: string[]): string {
    return execFileSync('git', args, { encoding: 'utf8' }).trim();
}

/** The last v* tag reachable from HEAD, or null when the repo has never been tagged. */
function lastTag(): string | null {
    try {
        return git('describe', '--tags', '--abbrev=0', '--match', 'v*') || null;
    } catch {
        return null;
    }
}

function commitsSince(tag: string | null): string[] {
    // %B is the raw body, so a `BREAKING CHANGE:` footer is seen as well as the
    // subject. The unit separator keeps multi-line messages apart.
    const range = tag ? `${tag}..HEAD` : 'HEAD';
    const log = git('log', range, '--no-merges', '--format=%B%x1f');

    return log
        .split('\x1f')
        .map((message) => message.trim())
        .filter(Boolean);
}

/**
 * Drops each `Revert "<subject>"` commit together with the commit it undoes, so
 * a feature that was added and then taken back out neither lands in the notes
 * nor drags the release up to a minor. git log is newest-first, so the revert
 * is always seen before its target.
 */
function dropReverted(messages: string[]): string[] {
    const reverted: string[] = [];
    const kept: string[] = [];

    for (const message of messages) {
        const revert = message.split('\n')[0].trim().match(/^Revert "(.+)"$/);

        if (revert) {
            reverted.push(revert[1]);
            continue;
        }

        const subject = message.split('\n')[0].trim();
        const index = reverted.indexOf(subject);

        if (index >= 0) {
            reverted.splice(index, 1);
            continue;
        }

        kept.push(message);
    }

    return kept;
}

function detectBump(messages: string[]): number {
    let level = 0;

    for (const message of messages) {
        if (/(^|\n)[a-z]+(\([^)]+\))?!: /i.test(message) || /BREAKING CHANGE:/i.test(message)) {
            level = Math.max(level, 3);
            continue;
        }

        if (/(^|\n)feat(\([^)]+\))?: /i.test(message)) {
            level = Math.max(level, 2);
            continue;
        }

        if (/(^|\n)fix(\([^)]+\))?: /i.test(message)) {
            level = Math.max(level, 1);
        }
    }

    return level;
}

function incrementVersion(version: string, bumpLevel: number): string {
    const match = version.match(/^(\d+)\.(\d+)\.(\d+)$/);

    if (!match) {
        throw new Error(`Unsupported version format: ${version}`);
    }

    const [major, minor, patch] = match.slice(1, 4).map(Number);

    if (bumpLevel === 3) return `${major + 1}.0.0`;
    if (bumpLevel === 2) return `${major}.${minor + 1}.0`;
    if (bumpLevel === 1) return `${major}.${minor}.${patch + 1}`;

    return version;
}

function releaseNotes(messages: string[], version: string): string {
    const sections: Array<[string, RegExp]> = [
        ['Breaking', /(^|\n)[a-z]+(\([^)]+\))?!: |BREAKING CHANGE:/i],
        ['Features', /(^|\n)feat(\([^)]+\))?: /i],
        ['Fixes', /(^|\n)fix(\([^)]+\))?: /i],
    ];

    const used = new Set<string>();
    const lines = [`## v${version}`, ''];

    for (const [heading, pattern] of sections) {
        const matched = messages.filter((message) => !used.has(message) && pattern.test(message));

        if (!matched.length) continue;

        for (const message of matched) {
            used.add(message);
        }

        lines.push(`### ${heading}`, '');

        for (const message of matched) {
            const subject = message.split('\n')[0].replace(/^[a-z]+(\([^)]+\))?!?:\s*/i, '');
            lines.push(`- ${subject}`);
        }

        lines.push('');
    }

    return `${lines.join('\n').trimEnd()}\n`;
}

function clearOutputs(): void {
    for (const file of [VERSION_FILE, NOTES_FILE]) {
        if (existsSync(file)) rmSync(file);
    }
}

function main(): void {
    const tag = lastTag();
    const baseVersion = tag ? tag.replace(/^v/, '') : '0.0.0';
    const messages = dropReverted(commitsSince(tag));
    const bumpLevel = detectBump(messages);

    if (bumpLevel === 0) {
        clearOutputs();
        console.log(
            `No feat/fix/breaking commits since ${tag ?? 'the start of history'}. Nothing to release.`,
        );
        return;
    }

    const nextVersion = incrementVersion(baseVersion, bumpLevel);

    console.log(`${tag ?? '(no tag)'} -> v${nextVersion} from ${messages.length} commit(s)`);

    if (DRY_RUN) {
        console.log(`\n${releaseNotes(messages, nextVersion)}`);
        return;
    }

    const pluginRaw = readFileSync(PLUGIN_FILE, 'utf8');

    if (!HEADER_VERSION_PATTERN.test(pluginRaw)) {
        throw new Error(`Failed to find a Version header in ${PLUGIN_FILE}`);
    }

    writeFileSync(PLUGIN_FILE, pluginRaw.replace(HEADER_VERSION_PATTERN, `$1${nextVersion}`));

    const packageJson = JSON.parse(readFileSync(PACKAGE_FILE, 'utf8'));
    packageJson.version = nextVersion;
    writeFileSync(PACKAGE_FILE, `${JSON.stringify(packageJson, null, 2)}\n`);

    writeFileSync(VERSION_FILE, `${nextVersion}\n`);
    writeFileSync(NOTES_FILE, releaseNotes(messages, nextVersion));
}

main();
