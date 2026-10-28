import { useOutletContext } from 'react-router';

// Auth forms render inside <AuthLayout>, which owns the neural core. This returns its mood setter:
// onMoodChange(MOOD.X, lookProgress?)
export function useCoreMood() {
  return useOutletContext()?.onMoodChange ?? (() => {});
}
