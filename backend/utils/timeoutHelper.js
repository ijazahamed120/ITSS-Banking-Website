/**
 * Timeout helper - ensures operations don't hang indefinitely
 */

/**
 * Run an async operation with a timeout
 * @param {Promise} promise - The promise to execute
 * @param {number} timeoutMs - Timeout in milliseconds
 * @param {string} timeoutMessage - Error message if timeout occurs
 * @returns {Promise} Either the promise result or timeout error
 */
export async function withTimeout(promise, timeoutMs = 5000, timeoutMessage = 'Operation timeout') {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs)
    ),
  ]);
}

/**
 * Safely connect to MongoDB with timeout
 * @param {Function} connectFn - The connection function
 * @returns {Promise} Connection result or null if timeout/error
 */
export async function safeMongoConnect(connectFn) {
  try {
    await withTimeout(
      connectFn(),
      5000,
      'MongoDB connection timeout - check credentials and network'
    );
    return true;
  } catch (err) {
    console.warn('[MongoDB] Connection warning:', err.message);
    return false;
  }
}
