from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# Nạp mật khẩu từ file .env
load_dotenv()
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# Tạo động cơ kết nối (Engine)
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Tạo phiên làm việc (Session)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Class cha cho tất cả các bảng dữ liệu sau này
Base = declarative_base()

# Hàm tiện ích để lấy kết nối DB (dùng dependency injection)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()