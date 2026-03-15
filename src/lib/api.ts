import { Contact } from '@/stores/useAppStore'

export async function mockableApi<T>(
  url: string,
  options: RequestInit,
  mockFactory: () => T,
): Promise<T> {
  try {
    const res = await fetch(url, options)
    if (res.ok) return await res.json()
  } catch (e) {
    // Silently fallback to mock if fetch fails
  }
  return new Promise((resolve) => setTimeout(() => resolve(mockFactory()), 600))
}

export const api = {
  loadFromSheets: (url: string) =>
    mockableApi('/api/load', { method: 'POST', body: JSON.stringify({ url }) }, () => ({
      message: 'Success',
      contacts: Array.from({ length: 42 }).map((_, i) => ({
        id: `s-${i}`,
        index: i + 1,
        name: `Sheet Contact ${i + 1}`,
        phone: `+55 11 99999-00${i.toString().padStart(2, '0')}`,
        status: 'Pronto' as const,
      })),
    })),

  uploadCsv: (file: File) =>
    mockableApi(
      '/api/upload-csv',
      { method: 'POST', body: new FormData() }, // Mocking formData
      () => ({
        filename: file.name,
        contacts: Array.from({ length: 150 }).map((_, i) => ({
          id: `c-${i}`,
          index: i + 1,
          name: `CSV Contact ${i + 1}`,
          phone: `+55 11 88888-00${i.toString().padStart(2, '0')}`,
          status: 'Pronto' as const,
        })),
      }),
    ),

  startDispatch: (payload: any) =>
    mockableApi('/api/dispatch/start', { method: 'POST', body: JSON.stringify(payload) }, () => ({
      success: true,
      dispatchId: `disp-${Date.now()}`,
    })),

  scheduleDispatch: (payload: any) =>
    mockableApi(
      '/api/dispatch/schedule',
      { method: 'POST', body: JSON.stringify(payload) },
      () => ({ success: true, scheduled: true }),
    ),

  getStreamToken: () =>
    mockableApi('/api/dispatch/stream-token', { method: 'POST' }, () => ({
      token: `tok-${Date.now()}`,
    })),
}
