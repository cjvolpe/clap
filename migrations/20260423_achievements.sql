-- Achievements / badges system.
-- Creates a catalog of achievements and a per-user unlock table.

create table if not exists achievements (
    id           serial primary key,
    code         text not null unique,
    name         text not null,
    description  text not null,
    icon         text not null,
    sort_order   integer not null default 0
);

create table if not exists user_achievements (
    id             bigserial primary key,
    user_id        uuid not null,
    achievement_id integer not null references achievements(id) on delete cascade,
    unlocked_at    timestamptz not null default now(),
    unique (user_id, achievement_id)
);

create index if not exists user_achievements_user_id_idx on user_achievements(user_id);

-- Seed the initial achievement catalog. The backend evaluates these by code,
-- so the codes are the stable identifier and must not change.
insert into achievements (code, name, description, icon, sort_order) values
    ('first_climb',       'First Ascent',     'Log your very first climb.',                              'trophy',   10),
    ('five_climbs',       'Getting Warm',     'Log 5 climbs.',                                           'flame',    20),
    ('ten_climbs',        'Regular',          'Log 10 climbs.',                                          'medal',    30),
    ('fifty_climbs',      'Gym Rat',          'Log 50 climbs.',                                          'crown',    40),
    ('first_v5',          'First V5',         'Send your first V5 boulder.',                             'boulder',  50),
    ('first_510',         'Breaking Into 10', 'Send your first 5.10 rope.',                              'rope',     60),
    ('ten_in_a_week',     'Crusher Week',     'Log 10 climbs within a single rolling 7-day window.',     'calendar', 70),
    ('send_streak_3',     'Send Streak',      'Log at least one climb on 3 different days in a row.',    'streak',   80),
    ('color_collector',   'Color Collector',  'Send climbs in at least 5 different route colors.',       'palette',  90),
    ('rainbow',           'Rainbow',          'Send climbs in at least 10 different route colors.',      'rainbow', 100)
on conflict (code) do update
    set name        = excluded.name,
        description = excluded.description,
        icon        = excluded.icon,
        sort_order  = excluded.sort_order;
