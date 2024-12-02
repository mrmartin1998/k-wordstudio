export async function fetchTexts() {
  try {
    console.log('Fetching texts from API...');
    const res = await fetch('/api/texts');
    console.log('API Response status:', res.status);
    const data = await res.json();
    console.log('API Response data:', data);
    if (!res.ok) throw new Error('Failed to fetch texts');
    return data;
  } catch (error) {
    console.error('Error in fetchTexts:', error);
    throw error;
  }
}

export async function createText(data) {
  const res = await fetch('/api/texts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create text');
  return res.json();
}

export async function deleteText(id) {
  const res = await fetch(`/api/texts/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete text');
  return res.json();
}

export async function updateTextStats(id, stats) {
  const res = await fetch(`/api/texts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(stats)
  });
  if (!res.ok) throw new Error('Failed to update text stats');
  return res.json();
}

export async function fetchFlashcards(textId) {
  try {
    const url = textId ? `/api/flashcards?textId=${textId}` : '/api/flashcards';
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch flashcards');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

export async function createFlashcard(data) {
  const res = await fetch('/api/flashcards', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create flashcard');
  return res.json();
}

export async function updateFlashcard(id, data) {
  const res = await fetch(`/api/flashcards/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update flashcard');
  return res.json();
}

export async function deleteFlashcard(id) {
  const res = await fetch(`/api/flashcards/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete flashcard');
  return res.json();
}

export async function fetchText(id) {
  const res = await fetch(`/api/texts/${id}`);
  if (!res.ok) throw new Error('Failed to fetch text');
  return res.json();
}

export async function fetchCollections() {
  const res = await fetch('/api/collections');
  if (!res.ok) throw new Error('Failed to fetch collections');
  return res.json();
}

export async function createCollection(data) {
  const res = await fetch('/api/collections', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create collection');
  return res.json();
}

export async function updateCollection(id, data) {
  const res = await fetch(`/api/collections/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update collection');
  return res.json();
}

export async function deleteCollection(id) {
  const res = await fetch(`/api/collections/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete collection');
  return res.json();
} 