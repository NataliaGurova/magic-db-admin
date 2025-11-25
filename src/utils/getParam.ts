
export function getParam(value: string | string[] | undefined): string {
  if (!value) throw new Error("URL param is missing");
  return Array.isArray(value) ? value[0] : value;
}
