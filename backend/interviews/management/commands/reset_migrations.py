"""
Management command: reset_migrations
Clears stale migration history from the remote PostgreSQL database
and then re-applies all migrations with --fake-initial.

This is needed when the DB has leftover Django migration records (e.g. from
admin tables) but is missing the accounts/interviews tables.

Usage:
    python manage.py reset_migrations
"""
from django.core.management.base import BaseCommand
from django.db import connection
from django.core.management import call_command


class Command(BaseCommand):
    help = 'Clears stale migration history and re-applies all migrations safely'

    def handle(self, *args, **options):
        self.stdout.write('Clearing stale migration history from django_migrations...')

        with connection.cursor() as cursor:
            cursor.execute('DELETE FROM django_migrations')

        self.stdout.write(self.style.WARNING('Migration history cleared.'))
        self.stdout.write('Running migrate --fake-initial ...')
        self.stdout.write('(This will SKIP creating tables that already exist, '
                          'and CREATE new tables like accounts_user and interviews_session)\n')

        call_command('migrate', '--fake-initial', verbosity=2)

        self.stdout.write(self.style.SUCCESS('\nDone! All migrations applied successfully.'))
