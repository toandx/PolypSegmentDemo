import sys
#for creating the mapper code
from sqlalchemy import Column, ForeignKey, Integer, String, DateTime, Float,VARCHAR, Boolean

#for configuration and class code
from sqlalchemy.ext.declarative import declarative_base

#for creating foreign key relationship between the tables
from sqlalchemy.orm import relationship

#for configuration
from sqlalchemy import create_engine

#create declarative_base instance
Base = declarative_base()

#we'll add classes here

class Patient(Base):
   __tablename__ = 'patient'
   __table_args__ =  {'mysql_charset': 'utf8mb4', 'mysql_collate': 'utf8mb4_unicode_ci'}
   id = Column(VARCHAR(100), primary_key = True)
   name = Column(VARCHAR(100))
   age = Column(Integer)
   sex = Column(VARCHAR(10))
   address = Column(VARCHAR(100))
   tien_su_benh_an = Column(VARCHAR(100))

class User(Base):
   __tablename__ = 'user'
   __table_args__ =  {'mysql_charset': 'utf8mb4', 'mysql_collate': 'utf8mb4_unicode_ci'}
   id = Column(Integer, primary_key = True)
   email = Column(VARCHAR(100))
   name = Column(VARCHAR(100))
   password = Column(VARCHAR(30))
   hospital = Column(VARCHAR(100))
   division = Column(VARCHAR(100))
   status = Column(Boolean)

class Session(Base):
   __tablename__ = 'session'
   __table_args__ =  {'mysql_charset': 'utf8mb4', 'mysql_collate': 'utf8mb4_unicode_ci'}
   id = Column(Integer, primary_key = True, autoincrement=True)
   creator_id = Column(Integer)
   patient_id = Column(VARCHAR(100))
   input_path = Column(VARCHAR(100))
   output_path = Column(VARCHAR(100))
   data_type = Column(VARCHAR(10))
   time = Column(DateTime)
   dau_hieu_lam_sang =  Column(VARCHAR(100))
   diagnostic = Column(VARCHAR(100))
   huong_dieu_tri = Column(VARCHAR(100))

class Histogram(Base):
   __tablename__ = 'histogram'
   id = Column(Integer, primary_key = True,autoincrement=True)
   session_id = Column(Integer)
   frame_id=Column(Integer)
   value=Column(Float)

#creates a create_engine instance at the bottom of the file
#engine = create_engine("mysql+pymysql://newuser:27081998@localhost/web?charset=utf8mb4")

#create engine for mysql
engine = create_engine('sqlite:///myapp.db', echo = True)
Base.metadata.create_all(engine)
