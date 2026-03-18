from database import SessionLocal
from models import User
from core.security import get_password_hash

def create_admin():
    db = SessionLocal()
    admin_user = db.query(User).filter(User.email == "admin@admin.com").first()
    if not admin_user:
        user = User(
            email="admin@admin.com",
            full_name="Admin",
            hashed_password=get_password_hash("admin123"),
            is_admin=True,
            is_active=True
        )
        db.add(user)
        db.commit()
        print("Admin user created: admin@admin.com / admin123")
    else:
        print("Admin user already exists")

if __name__ == "__main__":
    create_admin()
