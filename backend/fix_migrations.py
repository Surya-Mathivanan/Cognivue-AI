"""
Fix: Surgical migration fix for a shared PostgreSQL database.

The DB has standard Django tables from another project + stale migration records.
We need to:
1. Clear stale records
2. Fake ALL migrations INCLUDING accounts (in proper dependency order)
3. Then CREATE the actual accounts_user and interviews_session tables directly via SQL
   (since migrate would skip them as "already faked")

Run with: python fix_migrations.py
"""
import os
import django
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / '.env')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cognivue.settings')
django.setup()

from django.db import connection
from django.core.management import call_command

print("=" * 60)
print("Cognivue AI -- PostgreSQL Migration Fixer")
print("=" * 60)

cursor = connection.cursor()

# ── Step 1: Show existing tables ──────────────────────────────
cursor.execute("""
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public' ORDER BY tablename;
""")
tables = [row[0] for row in cursor.fetchall()]
print(f"\nFound {len(tables)} existing tables:")
for t in tables:
    print(f"  - {t}")

# ── Step 2: Clear stale migration records ────────────────────
if 'django_migrations' in tables:
    cursor.execute("DELETE FROM django_migrations")
    connection.commit()
    print("\nCleared stale django_migrations records.")

# ── Step 3: Fake ALL migrations in correct dependency order ──
# accounts MUST come before admin (admin depends on accounts via AUTH_USER_MODEL)
all_fakes = [
    ('contenttypes', '0001_initial'),
    ('contenttypes', '0002_remove_content_type_name'),
    ('auth', '0001_initial'),
    ('auth', '0002_alter_permission_name_max_length'),
    ('auth', '0003_alter_user_email_max_length'),
    ('auth', '0004_alter_user_username_opts'),
    ('auth', '0005_alter_user_last_login_null'),
    ('auth', '0006_require_contenttypes_0002'),
    ('auth', '0007_alter_validators_add_error_messages'),
    ('auth', '0008_alter_user_username_max_length'),
    ('auth', '0009_alter_user_last_name_max_length'),
    ('auth', '0010_alter_group_name_max_length'),
    ('auth', '0011_update_proxy_permissions'),
    ('auth', '0012_alter_user_first_name_max_length'),
    ('accounts', '0001_initial'),      # <-- Must be before admin
    ('sessions', '0001_initial'),
    ('admin', '0001_initial'),
    ('admin', '0002_logentry_remove_auto_add'),
    ('admin', '0003_logentry_add_action_flag_choices'),
    ('interviews', '0001_initial'),    # <-- Also faked for now
]

print("\nFaking all migrations in dependency order...")
from datetime import datetime, timezone
now = datetime.now(timezone.utc)

for app, name in all_fakes:
    cursor.execute(
        "INSERT INTO django_migrations (app, name, applied) VALUES (%s, %s, %s)",
        [app, name, now]
    )
    print(f"  Faked: [{app}] {name}")

connection.commit()
print("Done faking all migrations.")

# ── Step 4: Create accounts_user table directly via SQL ───────
print("\nCreating accounts_user table...")
cursor.execute("""
    CREATE TABLE IF NOT EXISTS accounts_user (
        id          BIGSERIAL PRIMARY KEY,
        password    VARCHAR(128) NOT NULL DEFAULT '',
        last_login  TIMESTAMPTZ,
        is_superuser BOOLEAN NOT NULL DEFAULT FALSE,
        is_staff    BOOLEAN NOT NULL DEFAULT FALSE,
        is_active   BOOLEAN NOT NULL DEFAULT TRUE,
        date_joined TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        email       VARCHAR(254) UNIQUE NOT NULL,
        username    VARCHAR(150) NOT NULL DEFAULT '',
        avatar_url  VARCHAR(200) NOT NULL DEFAULT '',
        google_id   VARCHAR(255) NOT NULL DEFAULT '',
        first_name  VARCHAR(150) NOT NULL DEFAULT '',
        last_name   VARCHAR(150) NOT NULL DEFAULT ''
    );
""")

cursor.execute("""
    CREATE TABLE IF NOT EXISTS accounts_user_groups (
        id      BIGSERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL REFERENCES accounts_user(id) ON DELETE CASCADE,
        group_id INT NOT NULL REFERENCES auth_group(id) ON DELETE CASCADE,
        UNIQUE (user_id, group_id)
    );
""")

cursor.execute("""
    CREATE TABLE IF NOT EXISTS accounts_user_user_permissions (
        id            BIGSERIAL PRIMARY KEY,
        user_id       BIGINT NOT NULL REFERENCES accounts_user(id) ON DELETE CASCADE,
        permission_id INT NOT NULL REFERENCES auth_permission(id) ON DELETE CASCADE,
        UNIQUE (user_id, permission_id)
    );
""")
connection.commit()
print("  accounts_user table created.")

# ── Step 5: Create interviews_session table directly via SQL ──
print("Creating interviews_session table...")
cursor.execute("""
    CREATE TABLE IF NOT EXISTS interviews_session (
        id                BIGSERIAL PRIMARY KEY,
        mode              VARCHAR(20) NOT NULL,
        difficulty        VARCHAR(20) NOT NULL,
        role              VARCHAR(100) NOT NULL DEFAULT '',
        resume_filename   VARCHAR(255) NOT NULL DEFAULT '',
        technical_skills  JSONB NOT NULL DEFAULT '[]',
        soft_skills       JSONB NOT NULL DEFAULT '[]',
        projects          JSONB NOT NULL DEFAULT '[]',
        experience_level  VARCHAR(20) NOT NULL DEFAULT '',
        resume_summary    TEXT NOT NULL DEFAULT '',
        questions         JSONB NOT NULL DEFAULT '{}',
        answers           JSONB NOT NULL DEFAULT '[]',
        feedback          JSONB NOT NULL DEFAULT '{}',
        status            VARCHAR(20) NOT NULL DEFAULT 'active',
        created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        completed_at      TIMESTAMPTZ,
        user_id           BIGINT NOT NULL REFERENCES accounts_user(id) ON DELETE CASCADE
    );
""")
connection.commit()
print("  interviews_session table created.")

# ── Step 6: Verify ────────────────────────────────────────────
cursor.execute("""
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename IN ('accounts_user', 'interviews_session')
""")
created = [row[0] for row in cursor.fetchall()]
print(f"\nNew tables verified in DB: {created}")

# ── Step 7: Run Django system check ──────────────────────────
print("\nRunning Django system check...")
call_command('check')

print("\n" + "=" * 60)
print("Migration fix complete!")
print("You can now run: python manage.py runserver")
print("=" * 60)
