-- Deploy all schema files
CREATE DATABASE share_musician;
select * from users;
-- 00_extensions.sql
\ir 'schema/00_extensions.sql'

-- 01_enums.sql
\ir 'schema/01_enums.sql'

-- 02_tables.sql
\ir 'schema/02_tables.sql'

-- 02_1_event_types.sql
\ir 'schema/02_1_event_types.sql'

-- 03_foreign_keys.sql
\ir 'schema/03_foreign_keys.sql'

-- 04_indexes.sql
\ir 'schema/04_indexes.sql'

-- 05_functions.sql
\ir 'schema/05_functions.sql'

-- 06_triggers.sql
\ir 'schema/06_triggers.sql'

-- 07_rls_policies.sql
\ir 'schema/07_rls_policies.sql'

-- 08_seed_data.sql
\ir 'schema/08_seed_data.sql'

-- 08_1_seed_event_types.sql
\ir 'schema/08_1_seed_event_types.sql'

-- 09_materialized_views.sql
\ir 'schema/09_materialized_views.sql'