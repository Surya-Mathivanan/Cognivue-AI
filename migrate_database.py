"""
Database Migration Script
Adds new columns to interview_session table for resume analysis feature
Run this from project root: python migrate_database.py
"""

import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from app import app, db

def migrate_database():
    """Add new columns to interview_session table"""
    
    with app.app_context():
        try:
            # Try to add columns using raw SQL
            connection = db.engine.raw_connection()
            cursor = connection.cursor()
            
            # List of columns to add
            columns_to_add = [
                ("resume_filename", "VARCHAR(255)"),
                ("technical_skills", "TEXT"),
                ("soft_skills", "TEXT"),
                ("projects", "TEXT"),
                ("experience_level", "VARCHAR(20)"),
                ("resume_summary", "TEXT")
            ]
            
            print("Starting database migration...")
            
            for column_name, column_type in columns_to_add:
                try:
                    sql = f"ALTER TABLE interview_session ADD COLUMN {column_name} {column_type};"
                    cursor.execute(sql)
                    connection.commit()
                    print(f"✓ Added column: {column_name}")
                except Exception as e:
                    if "already exists" in str(e).lower() or "duplicate" in str(e).lower():
                        print(f"- Column {column_name} already exists, skipping")
                    else:
                        print(f"✗ Error adding {column_name}: {e}")
                        connection.rollback()
            
            cursor.close()
            connection.close()
            
            print("\n✅ Database migration completed!")
            print("You can now restart your application.")
            
        except Exception as e:
            print(f"\n❌ Migration failed: {e}")
            print("\nAlternative: If you want to start fresh, you can:")
            print("1. Drop all tables in your PostgreSQL database")
            print("2. Restart the application - tables will be recreated")

if __name__ == "__main__":
    migrate_database()
