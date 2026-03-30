const BASE_URL = '/api';

async function request(endpoint, options = {}) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `Request failed with status ${res.status}`);
  }

  return res.json();
}

// --- Documents ---

export async function uploadDocument(file) {
  const form = new FormData();
  form.append('file', file);

  const res = await fetch(`${BASE_URL}/documents`, {
    method: 'POST',
    body: form,
    // No Content-Type header — browser sets it automatically with boundary for multipart
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(error.error || 'Upload failed');
  }

  return res.json();
}

export async function listDocuments() {
  return request('/documents');
}

export async function getDocument(id) {
  return request(`/documents/${id}`);
}

export async function getDocumentChunks(id) {
  return request(`/documents/${id}/chunks`);
}

export async function deleteDocument(id) {
  return request(`/documents/${id}`, { method: 'DELETE' });
}

// --- Search ---

export async function searchDocuments({ query, limit = 10, documentIds = [], hybrid = true }) {
  return request('/search', {
    method: 'POST',
    body: JSON.stringify({ query, limit, documentIds, hybrid }),
  });
}

// --- RAG Answer (SSE stream) ---

export function streamAnswer(query, onText, onDone, onError) {
  fetch(`${BASE_URL}/search/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  }).then(async (res) => {
    if (!res.ok) {
      onError('Failed to start answer stream');
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.startsWith('data: '));

      for (const line of lines) {
        const data = line.replace('data: ', '').trim();
        if (data === '[DONE]') {
          onDone();
          return;
        }
        try {
          const parsed = JSON.parse(data);
          if (parsed.text) onText(parsed.text);
          if (parsed.error) onError(parsed.error);
        } catch {
          // Ignore malformed lines
        }
      }
    }
  }).catch(onError);
}

// --- Polling helper ---

export function pollDocument(id, onUpdate, onDone, onError) {
  const interval = setInterval(async () => {
    try {
      const { document } = await getDocument(id);
      onUpdate(document);

      if (document.status === 'ready') {
        clearInterval(interval);
        onDone(document);
      }

      if (document.status === 'error') {
        clearInterval(interval);
        onError(document.error_message);
      }
    } catch (err) {
      clearInterval(interval);
      onError(err.message);
    }
  }, 1500);

  return () => clearInterval(interval); // Return cleanup function
}