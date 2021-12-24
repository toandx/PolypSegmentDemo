from flask import Flask, render_template, request, redirect, url_for, flash,send_from_directory,send_file
from flask import session,Response,jsonify
from werkzeug.utils import secure_filename
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import update
import io
import cv2
import numpy as np
import os
import time
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database_setup import Base
from database_setup import Patient,User,Histogram
from database_setup import Session as PatientSession
from datetime import datetime
#from database_support import *
from UnetEfficientNet import UnetEfficientNet
import tensorflow as tf
app = Flask(__name__)

#engine = create_engine("mysql+pymysql://newuser:27081998@localhost/web?charset=utf8mb4")
engine = create_engine('sqlite:///myapp.db', echo = True, connect_args={"check_same_thread": False})
Base.metadata.bind = engine
DBSession = sessionmaker(bind=engine)
dbSession = DBSession()

UPLOAD_FOLDER = './static/'
ADMIN_EMAIL='admin@gmail.com'
ALLOWED_IMAGE_EXTENSIONS = {'png', 'jpg', 'jpeg','tif','tiff'}
ALLOWED_VIDEO_EXTENSIONS = {'mp4','avi'}
model=UnetEfficientNet('./SaveModels/model_efficientnetb4_TrainAllUsePretrainedWeightDropOut05_bce04.h5')
graph = tf.get_default_graph()
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0 #To Set No Cache
def allowed_image_file(filename):
    return '.' in filename and filename.split('.')[-1].lower() in ALLOWED_IMAGE_EXTENSIONS
def allowed_video_file(filename):
    return '.' in filename and filename.split('.')[-1].lower() in ALLOWED_VIDEO_EXTENSIONS

@app.route('/')
def indexpage():
   return redirect('/home')

@app.route('/home')
def homepage():
   return render_template('home.html')

@app.route('/add_patient')
def add_patient_page():
	if ('user_id' in session):
		return render_template('add_patient.html')
	return redirect('/home')

@app.route('/diagnostic')
def diagnostic_page():
	if ('user_id' in session):
		return render_template('diagnostic.html')
	return redirect('/home')

@app.route('/statistic')
def statistic_page():
	if ('user_id' in session):
		return render_template('statistic.html')
	return redirect('/home')

@app.route('/change_pw')
def change_pw_page():
   return render_template('change_pw.html')

@app.route('/admin')
def adminpage():
   if ('user_id' in session):
      if (session.get('email')==ADMIN_EMAIL):
      	return render_template('admin.html')
   return redirect('/home')

@app.route('/signup')
def signuppage():
   return render_template('sign_up.html')

@app.route('/user/add',methods = ['POST'])
def add_user():
   result=dbSession.query(User).filter(User.email==request.json['email']).first();
   if (result):
      return('0')
   newUser=User(email=request.json['email'],name=request.json['name'],password=request.json['pass'],
   	hospital=request.json['hospital'],division=request.json['division'],status=True)
   dbSession.add(newUser)
   dbSession.commit();
   return('1')

@app.route('/user/login',methods = ['POST'])
def login():
   email=request.json['email']
   pw=request.json['pw']
   result=dbSession.query(User).filter(User.email==email).filter(User.password==pw).first();
   if (result):
   	if (not result.status):
   		return jsonify({'user_id':-2,'user_name':result.name})
   	else:
   		session['user_id'] = result.id
   		session['user_name'] = result.name
   		session['status']=result.status
   		session['email']=result.email
   		return jsonify({'user_id':result.id,'user_name':result.name})
   return jsonify({'user_id':-1,'user_name':''})

@app.route('/user/logout',methods = ['POST'])
def logout():
   session.pop('user_id', None)
   return ''

@app.route('/user/change_pw',methods = ['PUT'])
def change_pw():
   email=request.json['email']
   old_pw=request.json['old_pass']
   new_pw=request.json['new_pass']
   result=dbSession.query(User).filter(User.email==email).filter(User.password==old_pw).first();
   if (not result):
   	return '0'
   result.password=new_pw
   dbSession.commit()
   return '1'

@app.route('/user/delete',methods = ['DELETE'])
def delete_user():
   user_id=request.json['user_id']
   dbSession.query(User).filter(User.id==user_id).delete();
   return '1'

@app.route('/user/status',methods = ['PUT'])
def update_user_status():
   user_id=request.json['user_id']
   status=request.json['status']
   result=dbSession.query(User).filter(User.id==user_id).first();
   result.status=status;
   return '1'

@app.route('/user/get_infor',methods = ['GET'])
def get_user_infor():
	if ('user_id' in session):
		return jsonify({'user_id':session.get('user_id'),'user_name':session.get('user_name')})
	else:
		return jsonify({'user_id':-1,'user_name':''})

def merge_image(frame_inp,frame_out):
	frame_out=cv2.cvtColor(frame_out,cv2.COLOR_GRAY2BGR)
	h1,w1=frame_inp.shape[:2]
	h2,w2=frame_out.shape[:2]
	image=np.full((max(h1,h2),(w1+w2+50),3),255)
	image[0:h1,0:w1,:]=frame_inp
	image[0:h2,w1+50:w1+w2+50,:]=frame_out
	return(image)

@app.route('/upload/data',methods = ['GET','POST'])
def upload_data():
   if request.method == 'POST':
      file = request.files['file']
      if file.filename == '':
         flash('No selected file')
         return jsonify({'input_path':'','output_path':'','his':[],'data_type':'none'})
      if (file and allowed_video_file(file.filename)):
         video_file=file.filename
         input_path = './static/'+video_file
         output_path= './static/o'+video_file
         file.save(input_path)
         #his=[i for i in range(26)]
         with graph.as_default():
              his = model.predict_video(input_path,output_path)
         print(his)
         return jsonify({'input_path':input_path,'output_path':output_path,'his':his,'data_type':'video'})
      if (file and allowed_image_file(file.filename)):
         f=file.filename.split('.')[0]
         bio = io.BytesIO()
         file.save(bio)
         img = cv2.imdecode(np.frombuffer(bio.getvalue(), dtype='uint8'), 1)
         img = cv2.resize(img,(384,384))
         input_path = UPLOAD_FOLDER+'i'+f+'.jpg'
         output_path= UPLOAD_FOLDER+'o'+f+'.jpg'
         cv2.imwrite(input_path,img)
         with graph.as_default():
            model.predict_image(input_path,output_path)
         print('Predict image')
         #cv2.imwrite(output_path,img)
         return jsonify({'input_path':input_path,'output_path':output_path,'his':[],'data_type':'image'})
      return jsonify({'input_path':'','output_path':'','his':[],'data_type':'none'})

@app.route('/download/<path:filename>')
def downloadFile(filename):
    return send_file(filename, as_attachment=True)

@app.route('/patient/add',methods = ['POST'])
def add_patient():
   result=dbSession.query(Patient).filter(Patient.id==request.json['id']).first();
   if (result):
      return('0')
   newPatient=Patient(id=request.json['id'],name=request.json['name'],age=request.json['age'],sex=request.json['sex'],address=request.json['address'],
      tien_su_benh_an=request.json['tien_su_benh_an'])
   dbSession.add(newPatient)
   dbSession.commit()
   return('1')

@app.route('/patient/search',methods = ['POST'])
def search_patient():
   patient_id=request.json['id']
   patient=dbSession.query(Patient).filter(Patient.id==patient_id).first()
   if (not patient):
   	return jsonify({'patient_name':'','patient_age':-1,'patient_sex':'','patient_address':'',
      'tien_su_benh_an':'', 'session_id':[],
      'session_time':[],'diagnostic':[]})
   session_id=dbSession.query(PatientSession.id).filter(PatientSession.patient_id==patient_id).order_by(PatientSession.time.desc()).all()   
   session_time_object=dbSession.query(PatientSession.time).filter(PatientSession.patient_id==patient_id).order_by(PatientSession.time.desc()).all()  
   session_time=[]
   for obj in session_time_object:
      session_time.append(obj[0].strftime('%d/%m/%Y %H:%M'))
   diagnostic = dbSession.query(PatientSession.diagnostic).filter(PatientSession.patient_id==patient_id).order_by(PatientSession.time.desc()).all()
   return jsonify({'patient_name':patient.name,'patient_age':patient.age,'patient_sex':patient.sex,
      'patient_address':patient.address,
      'tien_su_benh_an':patient.tien_su_benh_an, 'session_id':session_id,
      'session_time':session_time,'diagnostic':diagnostic})
      
@app.route('/patient/update',methods = ['PUT'])
def update_patient():
   result=dbSession.query(Patient).filter(Patient.id==request.json['id']).first();
   if (not result):
      return '0'
   result.name=request.json['name']
   result.age=request.json['age']
   result.sex=request.json['sex']
   result.address=request.json['address']
   result.tien_su_benh_an=request.json['tien_su_benh_an']
   dbSession.commit()
   return('1')

@app.route("/patient/delete", methods = ['DELETE'])
def delete_patient():
   patient_id=request.json['patient_id'][0]
   dbSession.query(Patient).filter(Patient.id==patient_id).delete();
   print(patient_id)
   return '1'

@app.route('/patient_session/add',methods = ['POST'])
def add_patient_session():
   datetime_object=datetime.strptime(request.json['time'], '%d/%m/%Y %H:%M')
   newPatientSession = PatientSession(creator_id=request.json['creator_id'],patient_id=request.json['patient_id'],input_path=request.json['input_path'],
      output_path=request.json['output_path'],data_type=request.json['data_type'],
      time=datetime_object,dau_hieu_lam_sang=request.json['dau_hieu_lam_sang'],diagnostic=request.json['diagnostic'],
      huong_dieu_tri=request.json['huong_dieu_tri'])
   dbSession.add(newPatientSession)
   dbSession.commit()
   histogram=request.json['histogram'];
   for i in range(len(histogram)):
   	dbSession.add(Histogram(session_id=newPatientSession.id,frame_id=i+1,value=histogram[i]))
   dbSession.commit()
   return('1')

@app.route('/patient_session/update',methods = ['PUT'])
def update_patient_session():
   result=dbSession.query(PatientSession).filter(PatientSession.id==request.json['session_id']).first();
   if (not result):
      return '0'
   datetime_object=datetime.strptime(request.json['time'], '%d/%m/%Y %H:%M')
   result.time=datetime_object;
   result.dau_hieu_lam_sang=request.json['dau_hieu_lam_sang'];
   result.diagnostic=request.json['diagnostic'];
   result.huong_dieu_tri=request.json['huong_dieu_tri'];
   dbSession.commit()
   return('1')

@app.route("/patient_session/delete", methods = ['DELETE'])
def del_patient_session():
   session_id=request.json['session_id']
   dbSession.query(PatientSession).filter(PatientSession.id==session_id).delete();
   return '1'

@app.route('/patient_session/search',methods = ['GET'])
def search_patient_session():
   session_id=request.json['session_id']
   patient_session=dbSession.query(PatientSession).filter(PatientSession.id==session_id).first()
   if (not patient_session):
      return jsonify({'creator_id':-1,'creator_name':'','input_path':'','output_path':'',
      'histogram':[],'data_type':'none','time':'','dau_hieu_lam_sang':'',
      'diagnostic':'','huong_dieu_tri':''})
   session_time=patient_session.time.strftime('%d/%m/%Y %H:%M')
   creator_name=get_creator_name(dbSession,patient_session.creator_id)
   histogram=dbSession.query(Histogram.value).filter(Histogram.session_id==session_id).order_by(Histogram.frame_id.asc()).all()
   if (not histogram):
   	histogram=[]
   return jsonify({'creator_id':patient_session.creator_id,'creator_name':creator_name, 'input_path':patient_session.input_path,
      'output_path':patient_session.output_path,'histogram':histogram,'data_type':patient_session.data_type,
      'time':session_time,'dau_hieu_lam_sang':patient_session.dau_hieu_lam_sang,
      'diagnostic':patient_session.diagnostic,'huong_dieu_tri':patient_session.huong_dieu_tri})

@app.route('/get_frame')
def get_frame():
   if(True):
      video_path = request.args.get('path', '')
      frame_id = int(request.args.get('id', '0'))
      print(video_path+' '+str(frame_id))
      cap=cv2.VideoCapture(video_path)
      cap.set(cv2.CAP_PROP_POS_FRAMES,frame_id)
      ret, frame = cap.read()
      cv2.imwrite('./static/capture.jpg',frame)
      return send_file('./static/capture.jpg', as_attachment=True)
   else:
      return('Xin lỗi. Đã có lỗi xảy ra!')

@app.route('/export_patient_profile/<string:patient_id>')
def export_profile(patient_id):
   res=export_patient_profile(dbSession,patient_id,'./static/'+patient_id+'.xlsx')
   if (res):
      return send_file('./static/'+patient_id+'.xlsx',as_attachment=True)
   else:
      return 'Xin lỗi. Đã xảy ra lỗi!'

@app.route('/resetDB')
def resetDB():
   dbSession.query(User).delete()
   dbSession.query(Patient).delete()
   dbSession.query(Histogram).delete()
   dbSession.query(PatientSession).delete()
   dbSession.commit()
   return("OK")

@app.route('/statistic/patient',methods = ['GET'])
def statistic_patient():
   patient_id=dbSession.query(Patient.id).order_by(Patient.id.desc()).all()
   patient_name=dbSession.query(Patient.name).order_by(Patient.id.desc()).all()
   patient_age=dbSession.query(Patient.age).order_by(Patient.id.desc()).all()
   patient_sex=dbSession.query(Patient.sex).order_by(Patient.id.desc()).all()
   patient_address=dbSession.query(Patient.address).order_by(Patient.id.desc()).all()
   tien_su_benh_an=dbSession.query(Patient.tien_su_benh_an).order_by(Patient.id.desc()).all()
   return jsonify({'patient_id':patient_id,'patient_name':patient_name,'patient_age':patient_age,'patient_sex':patient_sex,
      'patient_address':patient_address,'tien_su_benh_an':tien_su_benh_an})

@app.route('/statistic/session',methods = ['GET'])
def statistic_session():
   session_id=dbSession.query(PatientSession.id).order_by(PatientSession.time.desc()).all()
   patient_id=dbSession.query(PatientSession.patient_id).order_by(PatientSession.time.desc()).all()
   creator_id=dbSession.query(PatientSession.creator_id).order_by(PatientSession.time.desc()).all()
   obj=dbSession.query(PatientSession.time).order_by(PatientSession.time.desc()).all()
   time=[]
   for x in obj:
      time.append(x[0].strftime('%d/%m/%Y %H:%M'))
   dau_hieu_lam_sang=dbSession.query(PatientSession.dau_hieu_lam_sang).order_by(PatientSession.time.desc()).all()
   diagnostic=dbSession.query(PatientSession.diagnostic).order_by(PatientSession.time.desc()).all()
   huong_dieu_tri=dbSession.query(PatientSession.huong_dieu_tri).order_by(PatientSession.time.desc()).all()
   return jsonify({'session_id':session_id,'patient_id':patient_id,'creator_id':creator_id,'time':time,
      'dau_hieu_lam_sang':dau_hieu_lam_sang,
      'diagnostic':diagnostic,
      'huong_dieu_tri':huong_dieu_tri})

@app.route('/statistic/user',methods = ['GET'])
def statistic_user():
   user_id=dbSession.query(User.id).filter(User.email!=ADMIN_EMAIL).order_by(User.id.asc()).all()
   user_name=dbSession.query(User.name).filter(User.email!=ADMIN_EMAIL).order_by(User.id.asc()).all()
   user_email=dbSession.query(User.email).filter(User.email!=ADMIN_EMAIL).order_by(User.id.asc()).all()
   user_hospital=dbSession.query(User.hospital).filter(User.email!=ADMIN_EMAIL).order_by(User.id.asc()).all()
   user_division=dbSession.query(User.division).filter(User.email!=ADMIN_EMAIL).order_by(User.id.asc()).all()
   user_status=dbSession.query(User.status).filter(User.email!=ADMIN_EMAIL).order_by(User.id.asc()).all()
   return jsonify({'user_id':user_id,'user_name':user_name,'user_email':user_email,
      'user_hospital':user_hospital,
      'user_division':user_division,
      'user_status':user_status})

if __name__ == '__main__':
	app.secret_key = os.urandom(12)
	app.run(debug = False)
