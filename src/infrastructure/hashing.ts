import md5 from 'md5';

export function hash(content?: string): string {
  if (!content) {
    return '';
  }
  return md5(content);
}
