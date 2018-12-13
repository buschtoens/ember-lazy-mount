export default interface Task<Args extends any[], T> {
  perform(...args: Args): TaskInstance<T>;
}

export interface TaskInstance<T> extends Promise<T> {
  cancel(): void;
}
