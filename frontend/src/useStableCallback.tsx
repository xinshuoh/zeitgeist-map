import { useRef, useCallback, use} from 'react';

/**
 * Accepts a given callback, and provides a new callback with a stable reference,
 * which will itself always call the latest version of the provided callback.
 * Useful for dealing with third party components that use stale closures.
 * @param callback - the original callback desired to be called
 * @returns A new callback with a stable reference, which when called,
 * calls the latest provided callback
 * @deprecated -  This implementation may have future issues in concurrent mode, as it mutates
 * the ref value during the render.  
 * It is expected that react will provide opportunities for better solutions in the future.
 * See https://reactjs.org/docs/hooks-faq.html#how-to-read-an-often-changing-value-from-usecallback
 */
function useStableCallback<Args extends unknown[], Return>(callback: (...args: Args) => Return) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const stableCallback = useCallback((...args: Args) => {
    return callbackRef.current(...args);
  }, []);

  return stableCallback;
}

export default useStableCallback;