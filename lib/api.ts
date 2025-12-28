import axios from 'axios';
import { Note, NoteFormValues, NoteTag } from '@/types/note';

function getToken() {
  const token = process.env.NEXT_PUBLIC_NOTEHUB_TOKEN;
  if (!token) {
    throw new Error('NEXT_PUBLIC_NOTEHUB_TOKEN is missing');
  }
  return token;
}

axios.defaults.baseURL = 'https://notehub-public.goit.study/api';
axios.defaults.headers.common['Authorization'] = `Bearer ${getToken()}`;
axios.defaults.timeout = 2000;
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

export const fetchNotes = async ({
  search,
  page,
  sortBy,
  tag,
}: FetchNotesParams): Promise<FetchNotesResponse> => {
  const params: Record<string, string | number> = {
    search,
    page,
    perPage: 12,
    sortBy,
  };

  if (tag && tag !== 'all') {
    params.tag = tag;
  }

  const { data } = await axios.get<FetchNotesResponse>('/notes', {
    params,
  });

  return data;
};

export const createNote = async (noteData: NoteFormValues): Promise<Note> => {
  const { data } = await axios.post<Note>('/notes', noteData);
  return data;
};

export const deleteNote = async (id: string): Promise<Note> => {
  const { data } = await axios.delete<Note>(`/notes/${id}`); 
  return data;
};

export const fetchNoteById = async (id: string): Promise<Note> => {
  const { data } = await axios.get<Note>(`/notes/${id}`);
  return data;
};