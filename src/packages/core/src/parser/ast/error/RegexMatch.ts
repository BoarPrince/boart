/**
 *
 */
export interface RegexMatch {
    readonly kind: 'RegexMatch';
    readonly negated: boolean;
    readonly literal: string;
}
