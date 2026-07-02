/**
 * Pauses the execution for a specified duration.
 * @param duration - The duration to wait in milliseconds. Default is 1000ms.
 */
export const wait = async (duration = 1000) => {
  await new Promise((resolve) => setTimeout(resolve, duration));
};
