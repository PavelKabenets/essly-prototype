// Thin wrapper over the browser Notification API.
// On native or environments without the API, all calls are no-ops.

type Permission = 'default' | 'granted' | 'denied' | 'unsupported';

function api(): typeof Notification | null {
  if (typeof window === 'undefined') return null;
  if (typeof Notification === 'undefined') return null;
  return Notification;
}

export function getNotificationPermission(): Permission {
  const N = api();
  if (!N) return 'unsupported';
  return N.permission as Permission;
}

// Returns the resolved permission after the request. If unsupported, returns
// 'unsupported'. The browser only shows the prompt once per origin — calling
// again after 'denied' resolves immediately to 'denied'.
export async function requestNotificationPermission(): Promise<Permission> {
  const N = api();
  if (!N) return 'unsupported';
  if (N.permission === 'granted' || N.permission === 'denied') {
    return N.permission as Permission;
  }
  try {
    const result = await N.requestPermission();
    return result as Permission;
  } catch {
    return 'denied';
  }
}

export function fireBrowserNotification(title: string, body: string) {
  const N = api();
  if (!N || N.permission !== 'granted') return;
  try {
    new N(title, { body, icon: '/favicon.png', badge: '/favicon.png' });
  } catch {}
}
