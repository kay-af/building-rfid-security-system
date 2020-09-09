# Original work here:
# https://github.com/arpit-jadon/FireNet-LightWeight-Network-for-Fire-Detection

from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array
import numpy as np
import cv2
import time

model=load_model(r'Fire-64x64-color-v7-soft.h5')

IMG_SIZE = 64

class FireDetector:
    def __init__(self, trigger=None, threshold : float=90.0, accumulation_time=1.5, degrade_fac=4):
        self.accumulation_time = accumulation_time
        self.__triggerd = False
        self.__threshold = threshold
        self.trigger = trigger
        self.__internal_timer = 0
        self.degrade_fac = degrade_fac
        self.__a = -1

    def update_frame(self, frame):
        
        frame1 = frame.copy()
        frame1 = cv2.resize(frame1, (IMG_SIZE, IMG_SIZE))  
        frame1 = frame1.astype("float") / 255.0
        frame1 = img_to_array(frame1)
        frame1 = np.expand_dims(frame1, axis=0)
        pred = model.predict(frame1)[0][0] * 100
        
        if self.__a == -1:
            self.__a = time.time()
        
        diff = time.time() - self.__a
        self.__a = time.time()
        
        print("(Prediction, Internal timer): ", (pred, self.__internal_timer))
        
        if pred >= self.__threshold:
            self.__internal_timer += diff
            if self.__internal_timer >= self.accumulation_time and not self.__triggerd and self.trigger != None:
                self.trigger()
                self.__triggerd = True
        else:
            self.__internal_timer -= diff / self.degrade_fac
            if self.__internal_timer < 0:
                self.__internal_timer = 0
                
        