export function getNumeric(input?: string) {
  return input && !Number.isNaN(+input) ? +input : undefined;
}
