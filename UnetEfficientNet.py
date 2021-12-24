import os
import skvideo
import skvideo.io
os.environ["CUDA_DEVICE_ORDER"] = "PCI_BUS_ID" 
os.environ["CUDA_VISIBLE_DEVICES"] = "2"
from keras import *
from keras.models import *
from keras.optimizers import Adam
from modelDropOut import *
from metrics import  dice,IU,recall,precision,f1,specificity
from losses import bce_dice_loss
import cv2
import numpy as np
class UnetEfficientNet():
    def __init__(self,weight_path):
        optim = Adam(lr = 1e-4)
        img_size_target = 384
        self.model = Unet( backbone_name='efficientnet-b4', input_shape=(img_size_target, img_size_target, 3), encoder_freeze=False, encoder_weights='imagenet')
        self.model.load_weights(weight_path)
        self.model.compile(optimizer=optim, loss=bce_dice_loss, metrics=['acc',dice,IU,recall,precision,f1,specificity])
    def merge_image(self,frame_inp,frame_out):
        frame_inp=cv2.resize(frame_inp,(384,384))
        h1,w1=frame_inp.shape[:2]
        h2,w2=frame_out.shape[:2]
        image=np.full((max(h1,h2),(w1+w2+50),3),255)
        image[0:h1,0:w1,:]=frame_inp
        image[0:h2,w1+50:w1+w2+50,:]=frame_out
        image=image.astype(np.uint8)
        return(image)
    def predict(self,image):
        input_image = image/255
        input_image = cv2.resize(input_image,(384,384))
        input_image = np.reshape(input_image,(1,)+input_image.shape)
        result = self.model.predict(input_image)
        result = result.reshape(384,384)
        score = np.sum(result)
        result = result*255
        result = result.astype('uint8')
        heat_map = cv2.applyColorMap(result,cv2.COLORMAP_JET)
        input_image = cv2.resize(image,(384,384))
        mask = input_image*0.7+heat_map*0.3
        mask = mask.astype('uint8')
        return mask,score
    def predict_image(self, img_path,output_path):
        cv2.imwrite(output_path,self.predict(cv2.imread(img_path))[0])
    def predict_video(self,input_path,output_path):
        success=True
        video_inp=cv2.VideoCapture(input_path)
        fps = video_inp.get(cv2.CAP_PROP_FPS)
        frameSize = (818, 384)
        #video_out = cv2.VideoWriter(output_path,cv2.VideoWriter_fourcc(*'mp4v') ,fps, frameSize)
        video_out = cv2.VideoWriter(output_path,cv2.VideoWriter_fourcc(*'H264') ,fps, frameSize)
        his=[]
        while success:
            success, frame = video_inp.read()
            if (success):            
                frame_out,score = self.predict(frame)
                his.append(score)
                res = self.merge_image(frame,frame_out)
                video_out.write(res)
        video_inp.release()
        video_out.release()
        his=list(map(float,his))
        return his
