/**
 * Helpers for checking method preconditions.
 * See {@link https://github.com/google/guava/wiki/PreconditionsExplained}
 *
 * Take care not to confuse precondition checking with other types of checks!
 * Precondition failures are used to signal that the *caller* has made an error
 * by calling a method at the wrong time.
 */
export class Preconditions {
  /**
   * Checks a condition of a method argument.
   *
   * @param {boolean} cond condition
   * @param {string=} msg optional message template
   * @param {...*} args optional arguments for the message template
   * @throws {Error} if {@code cond} is falsey
   */
  static checkArgument(cond: false, msg?: string, ...args: any[]): never;
  static checkArgument(cond: boolean, msg?: string, ...args: any[]): void;
  static checkArgument(cond: boolean, msg?: string, ...args: any[]) {
    if (!cond) {
      throw new Error(msg == null
        ? 'invalid argument'
        : Preconditions.format(msg, ...args));
    }
  }

  /**
   * Formats a template by interpolating some arguments for {} placeholders.
   *
   * @param {string} template template
   * @param {...*} args values to substitute for {}s in the template
   * @return {string}
   */
  private static format(template: string, ...args: any[]): string {
    let i = 0;
    return template.replace(/\{}/g, () => i < args.length ? args[i++] : '{}');
  }
}
