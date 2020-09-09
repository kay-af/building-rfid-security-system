import cv2
import time

class security_camera:
    
    def __init__(self, onframe = None):
        self.onframe = onframe
        self.__started = False
        self.__cap = None
    
    def __rescale(self, frame, percent=50):
        width = int(frame.shape[1] * percent / 100)
        height = int(frame.shape[0] * percent / 100)
        dim = (width, height)
        return cv2.resize(frame, dim, interpolation=cv2.INTER_AREA)
    
    def start(self):
        self.__started = True
        self.__cap = cv2.VideoCapture(0)
    
        while self.__started:
            ret, frame = self.__cap.read()
            frame = cv2.flip(frame, 1)
            frame = self.__rescale(frame)
            if self.onframe:
                self.onframe(frame)
            time.sleep(0.032)
        
        self.__cap.release()
                
    def end(self):
        self.__started = False