import axios from 'axios';
import { Note, NoteFormValues, NoteTag } from '@/types/note';

// Функція для отримання токена
function getToken(): string | null {
  const token = process.env.NEXT_PUBLIC_NOTEHUB_TOKEN;
  if (!token) {
    console.warn('NEXT_PUBLIC_NOTEHUB_TOKEN is missing. Запит буде без авторизації.');
    return null;
  }
  return token;
}

// Створюємо екземпляр axios
const api = axios.create({
  baseURL: 'https://notehub-public.goit.study/api',
  timeout: 2000,
});

// Хелпер для підстановки токена у заголовок Authorization
function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Типи параметрів і відповіді
export interface FetchNotesParams {
  search: string;
  page: number;
  sortBy: 'created' | 'updated';
  tag?: NoteTag;
}

export interface FetchNotesResponse {
  notes: Note[];
  totalPages: number;
}

// API-функції
export const fetchNotes = async ({
  search,
  page,
  sortBy,
  tag,
}: FetchNotesParams): Promise<FetchNotesResponse> => {
  const params: Record<string, string | number> = { search, page, perPage: 12, sortBy };
  if (tag && tag !== 'all') params.tag = tag;

  const { data } = await api.get<FetchNotesResponse>('/notes', {
    params,
    headers: authHeaders(),
  });

  return data;
};

export const createNote = async (noteData: NoteFormValues): Promise<Note> => {
  const { data } = await api.post<Note>('/notes', noteData, {
    headers: authHeaders(),
  });
  return data;
};

export const deleteNote = async (id: string): Promise<Note> => {
  const { data } = await api.delete<Note>(`/notes/${id}`, {
    headers: authHeaders(),
  });
  return data;
};

export const fetchNoteById = async (id: string): Promise<Note> => {
  const { data } = await api.get<Note>(`/notes/${id}`, {
    headers: authHeaders(),
  });
  return data;
};