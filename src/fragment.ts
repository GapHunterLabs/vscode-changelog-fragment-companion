/**
 * Pure logic -- no `vscode` dependency. Ported from the IntelliJ-
 * family changelog-fragment-companion (FragmentFileNameParser +
 * FragmentType), the towncrier-style convention: instead of every PR
 * editing the same CHANGELOG.md and fighting merge conflicts, each PR
 * adds a small `changelog.d/<issue>.<type>.md` file, collected into a
 * real changelog at release time.
 */

export interface FragmentType {
  id: string;
  label: string;
}

// The well-established default type set towncrier itself uses.
// Stated honestly (same as the original): a team that configures
// towncrier with a custom type list isn't covered in this v0.1.
export const FRAGMENT_TYPES: FragmentType[] = [
  { id: 'feature', label: 'New feature' },
  { id: 'bugfix', label: 'Bug fix' },
  { id: 'doc', label: 'Documentation' },
  { id: 'removal', label: 'Deprecation / removal' },
  { id: 'misc', label: 'Miscellaneous' },
];

export function fragmentTypeById(id: string): FragmentType | undefined {
  return FRAGMENT_TYPES.find((type) => type.id === id);
}

export type FragmentFileNameResult =
  | { valid: true; issueId: string; type: FragmentType }
  | { valid: false; reason: string };

const PATTERN = /^(\d+)\.([a-z]+)\.md$/;

export function parseFragmentFileName(fileName: string): FragmentFileNameResult {
  const match = PATTERN.exec(fileName);
  if (!match) {
    return { valid: false, reason: 'expected "<issue-number>.<type>.md" (e.g. "123.feature.md")' };
  }
  const [, issueId, typeId] = match;
  const type = fragmentTypeById(typeId);
  if (!type) {
    return {
      valid: false,
      reason: `unrecognized type "${typeId}" -- expected one of: ${FRAGMENT_TYPES.map((t) => t.id).join(', ')}`,
    };
  }
  return { valid: true, issueId, type };
}

/** Inverse of parseFragmentFileName -- the single place both the
 * validator and the "New Changelog Fragment" command agree on the
 * exact naming convention. */
export function fragmentFileName(issueId: string, type: FragmentType): string {
  return `${issueId}.${type.id}.md`;
}
