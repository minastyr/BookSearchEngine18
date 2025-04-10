export const handleError = (err: any, message: string): never => {
  console.error(`${message}:`, err);
  throw new Error(message);
};