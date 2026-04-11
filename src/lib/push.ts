export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const result = await Notification.requestPermission()
  return result === 'granted'
}

export function showEventNotification(event: { icon: string; title: string; message: string }): void {
  if (!('Notification' in window)) return
  if (Notification.permission !== 'granted') return
  try {
    new Notification(`${event.icon} ${event.title}`, {
      body: event.message,
      icon: '/icon-192.png',
    })
  } catch { /* ignore */ }
}
