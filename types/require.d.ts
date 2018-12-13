export default function require(
  name: string
): {
  default?: any;
  [namedExport: string]: any;
};
