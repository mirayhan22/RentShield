-- Migration: Create the risk_checks table for the RentShield backend.
-- Matches the insert payload in backend/main.py create_risk_check() and
-- the RiskCheckCreate / RiskCheckResponse models in backend/models.py.

create table public.risk_checks (
    id                     uuid                     primary key default gen_random_uuid(),
    user_id                uuid                     not null,
    suburb                 varchar(120)             not null,
    weekly_rent            varchar(32)              not null,
    listing_source         varchar(120)             not null,
    viewed_in_person       boolean                  not null default false,
    payment_before_viewing boolean                  not null default false,
    pressured_to_pay       boolean                  not null default false,
    no_written_agreement   boolean                  not null default false,
    unregulated_source     boolean                  not null default false,
    unusually_low_rent     boolean                  not null default false,
    risk_level             varchar(32)              not null,
    risk_signals           jsonb,
    verification_actions   jsonb,
    evidence_note          varchar(4000),
    created_at             timestamptz              not null default now()
);

comment on table public.risk_checks is 'Saved rental safety checks created by RentShield users';

-- Index for the list endpoint which filters by user_id and orders by created_at
create index idx_risk_checks_user_id_created_at
    on public.risk_checks (user_id, created_at desc);

-- Row Level Security: users can only see and insert their own rows
alter table public.risk_checks enable row level security;

create policy "Users can insert own risk checks"
    on public.risk_checks
    for insert
    with check (auth.uid() = user_id);

create policy "Users can select own risk checks"
    on public.risk_checks
    for select
    using (auth.uid() = user_id);