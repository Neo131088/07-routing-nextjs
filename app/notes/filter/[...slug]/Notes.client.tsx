'use client';

import css from './NotesPage.module.css';
import { useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import SearchBox from '@/components/SearchBox/SearchBox';
import Pagination from '@/components/Pagination/Pagination';
import NoteList from '@/components/NoteList/NoteList';
import Modal from '@/components/Modal/Modal';
import NoteForm from '@/components/NoteForm/NoteForm';
import NoNotesMessage from '@/components/NoNotesMessage/NoNotesMessage';

import { fetchNotes } from '@/lib/api';
import type { FetchNotesParams, FetchNotesResponse } from '@/lib/api';
import useModalControl from '@/hooks/useModalControl';

import type { NoteTag } from '@/types/note';
interface NotesClientProps {
  tag?: NoteTag | undefined;
}

interface ClientParamsState {
  search: string;
  page: number;
  sortBy: 'created' | 'updated';
}

function NotesClient({ tag }: NotesClientProps) {
  const createNoteModal = useModalControl();

  const [clientParams, setClientParams] = useState<ClientParamsState>(() => ({
    search: '',
    page: 1,
    sortBy: 'created' as const,
  }));

  const finalParams: FetchNotesParams = {
    ...clientParams,
    tag: tag,
  };

  const { data, isLoading, isError, isFetching } = useQuery<FetchNotesResponse, Error>({
    queryKey: ['notes', finalParams.search, finalParams.sortBy, finalParams.page, finalParams.tag],
    queryFn: () => fetchNotes(finalParams),
    placeholderData: keepPreviousData,
    staleTime: Infinity,
  });

  const debounceSearch = useDebouncedCallback((value: string) => {
    setClientParams(prev => ({ ...prev, search: value, page: 1 }));
  }, 300);

  const handlePageChange = (page: number) => {
    setClientParams(prev => ({ ...prev, page }));
  };

  let content;

  if (isLoading) {
    content = <p>Loading, please wait...</p>;
  } else if (isError) {
    content = <p>Something went wrong.</p>;
  } else if (data && data.notes.length === 0) {
    content = <NoNotesMessage isSearch={clientParams.search.length > 0} />;
  } else if (data) {
    content = <NoteList notes={data.notes} />;
  }

  return (
    <div className={css.app}>
      <Toaster />

      <header className={css.toolbar}>
        <SearchBox search={clientParams.search} onChange={debounceSearch} />

        {isFetching && <p className={css.fetchingIndicator}>Updating...</p>}

        {data?.totalPages && data.totalPages > 1 && (
          <Pagination
            currentPage={clientParams.page}
            totalPages={data.totalPages}
            onPageChange={handlePageChange}
          />
        )}

        <button className={css.button} onClick={createNoteModal.openModal}>
          Create note +
        </button>
      </header>

      <div className={css.listContainer}>{content}</div>

      {createNoteModal.isModalOpen && (
        <Modal onClose={createNoteModal.closeModal}>
          <NoteForm onClose={createNoteModal.closeModal} />
        </Modal>
      )}
    </div>
  );
}

export default NotesClient;