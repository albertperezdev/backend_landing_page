-- Recrea la base de datos "landingpage" (PostgreSQL 15)
-- Uso: psql -U alumno -d landingpage -f prisma/seed.sql

BEGIN;

DROP TABLE IF EXISTS public.users;

CREATE TABLE public.users (
    id            uuid                     NOT NULL DEFAULT gen_random_uuid(),
    name          varchar(100)             NOT NULL,
    email         varchar(254)             NOT NULL,
    password_hash varchar(255)             NOT NULL,
    created_at    timestamp with time zone NOT NULL DEFAULT now(),
    updated_at    timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT users_id_pk PRIMARY KEY (id),
    CONSTRAINT users_email_uk UNIQUE (email)
);

-- Usuarios de prueba. Contraseña de todos: Password123!
-- (hash argon2id con los mismos parámetros que ARGON2_OPTIONS en users.service.ts)
INSERT INTO public.users (name, email, password_hash) VALUES
    ('Ana López',     'ana@example.test',    '$argon2id$v=19$m=19456,p=1,t=2$/LtB6sv55YHDv8qbXhbxGA$oOx6XNJDPC90kOu5SK8PPlpIoWQh8GjhetagKfcHOpI'),
    ('Carlos Ruiz',   'carlos@example.test', '$argon2id$v=19$m=19456,p=1,t=2$/LtB6sv55YHDv8qbXhbxGA$oOx6XNJDPC90kOu5SK8PPlpIoWQh8GjhetagKfcHOpI'),
    ('María García',  'maria@example.test',  '$argon2id$v=19$m=19456,p=1,t=2$/LtB6sv55YHDv8qbXhbxGA$oOx6XNJDPC90kOu5SK8PPlpIoWQh8GjhetagKfcHOpI'),
    ('Admin Demo',    'admin@example.test',  '$argon2id$v=19$m=19456,p=1,t=2$/LtB6sv55YHDv8qbXhbxGA$oOx6XNJDPC90kOu5SK8PPlpIoWQh8GjhetagKfcHOpI');

COMMIT;
