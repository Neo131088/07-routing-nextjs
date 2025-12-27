'use client';

import Modal from '@/components/Modal/Modal';
import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { fetchNoteById } from '@/lib/api';
import css from './NotePreview.module.css';

import type { Note } from '@/types/note';

interface NotePreviewProps {
  onClose: () => void;
}

const NotePreview = ({ onClose }: NotePreviewProps) => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const {
    data: note,
    isLoading,
    error,
  } = useQuery<Note, Error>({
    queryKey: ['note', id],
    queryFn: () => fetchNoteById(id),
    refetchOnMount: false,
    staleTime: Infinity,
    enabled: !!id,
  });

  const handleClose = () => router.back();

  const formatDate = (date: string) =>
    new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  let content;

  if (!id) {
    content = <p>Error: Note ID is missing from the URL.</p>;
  } else if (isLoading) {
    content = <p>Loading, please wait...</p>;
  } else if (error || !note) {
    content = <p>Something went wrong.</p>;
  } else {
    const formattedDate = note.updatedAt
      ? `Updated: ${formatDate(note.updatedAt)}`
      : `Created: ${formatDate(note.createdAt)}`;

    content = (
      <div className={css.item}>
        <div className={css.header}>
          <h2>{note.title}</h2>
          <p className={css.tag}>{note.tag}</p>
        </div>
        <p className={css.content}>{note.content}</p>
        <p className={css.date}>{formattedDate}</p>
      </div>
    );
  }

  return (
    <Modal onClose={handleClose}>
      <div className={css.container}>
        {content}
        <button type="button" className={css.backBtn} onClick={handleClose}>
          Back
        </button>
      </div>
    </Modal>
  );
};

export default NotePreview;