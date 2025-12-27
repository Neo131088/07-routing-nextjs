import { QueryClient, HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { fetchNotes } from '@/lib/api';
import NotesClient from './Notes.client';
import type { FetchNotesParams } from '@/lib/api';

import { NoteTag } from '@/types/note';

type Props = {
  params: Promise<{ slug: string[] }>;
};

export default async function NotesPage({ params }: Props) {
  const queryClient = new QueryClient();

  const { slug } = await params;

  const tagValue: NoteTag | undefined = slug[0] === 'All' ? undefined : (slug[0] as NoteTag);

  const apiParams: FetchNotesParams = {
    search: '',
    page: 1,
    sortBy: 'created' as const,
    tag: tagValue,
  };

  await queryClient.prefetchQuery({
    queryKey: ['notes', apiParams.search, apiParams.sortBy, apiParams.page, apiParams.tag],
    queryFn: () => fetchNotes(apiParams),
  });

  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      <NotesClient tag={tagValue} />
    </HydrationBoundary>
  );
}