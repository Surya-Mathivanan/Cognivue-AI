import random
import string
from django.db import migrations, models


def assign_uids_to_existing_users(apps, schema_editor):
    """Assign unique UIDs to all existing users that don't have one."""
    User = apps.get_model('accounts', 'User')
    existing_uids = set()

    for user in User.objects.all():
        # Generate a unique UID
        attempts = 0
        while True:
            digits = ''.join(random.choices(string.digits, k=5))
            uid = f"22BAD{digits}"
            if uid not in existing_uids:
                existing_uids.add(uid)
                break
            attempts += 1
            if attempts > 1000:
                raise Exception("Could not generate unique UIDs for all users")
        user.uid = uid
        user.save()


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0001_initial'),
    ]

    operations = [
        # Step 1: Add uid field WITHOUT unique constraint, allowing blank
        migrations.AddField(
            model_name='user',
            name='uid',
            field=models.CharField(blank=True, default='', max_length=10),
        ),
        # Step 2: Populate UIDs for existing users
        migrations.RunPython(
            assign_uids_to_existing_users,
            reverse_code=migrations.RunPython.noop,
        ),
        # Step 3: Now add the unique constraint
        migrations.AlterField(
            model_name='user',
            name='uid',
            field=models.CharField(blank=True, default='', max_length=10, unique=True),
        ),
    ]
