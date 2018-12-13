export function restartableTask(
  target: object,
  propertyKey: string | symbol,
  descriptor?: PropertyDescriptor
): void;
export function restartableTask(
  options: object
): (
  target: object,
  propertyKey: string | symbol,
  descriptor?: PropertyDescriptor
) => void;
