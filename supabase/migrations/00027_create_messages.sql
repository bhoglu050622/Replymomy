create table messages (
  id uuid primary key default gen_random_uuid(),
  chat_id text not null,         -- 'match-{matchId}' or 'concierge-{userId}'
  sender_id uuid not null references public.users(id) on delete cascade,
  content text,
  attachments jsonb not null default '[]',
  reactions jsonb not null default '{}',
  edited_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now()
);

create index messages_chat_created on messages(chat_id, created_at desc);
create index messages_sender_id on messages(sender_id);

alter table messages enable row level security;

-- Users can read messages in chats they belong to
create policy "users read own chat messages"
  on messages for select
  using (
    sender_id = auth.uid()
    or (
      chat_id like 'match-%'
      and exists (
        select 1 from matches
        where ('match-' || id::text) = messages.chat_id
          and (member_id = auth.uid() or mommy_id = auth.uid())
          and status = 'mutual'
      )
    )
    or ('concierge-' || auth.uid()::text) = messages.chat_id
  );

-- Users can send messages in mutual matches they belong to
create policy "users send messages"
  on messages for insert
  with check (
    sender_id = auth.uid()
    and (
      (
        chat_id like 'match-%'
        and exists (
          select 1 from matches
          where ('match-' || id::text) = messages.chat_id
            and (member_id = auth.uid() or mommy_id = auth.uid())
            and status = 'mutual'
        )
      )
      or ('concierge-' || auth.uid()::text) = messages.chat_id
    )
  );

-- Users can soft-delete/edit their own messages
create policy "users update own messages"
  on messages for update
  using (sender_id = auth.uid());
