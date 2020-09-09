import socketio
from security_camera import security_camera
from fire_detection import FireDetector
import base64
import cv2
import configparser

config = configparser.ConfigParser()

config.read('config.ini')

port = int(config['CAMERA']['PORT'])
cam_id = int(config['CAMERA']['ID'])
posx = float(config['CAMERA']['X'])
posy = float(config['CAMERA']['Y'])
posz = float(config['CAMERA']['Z'])

connection = f'http://127.0.0.1:{port}?device=camera&pos={posx},{posy},{posz}&id={cam_id}'
print('Connection string:', connection)

sio = socketio.Client()
sio.connect(connection)

def onTrigger():
    sio.emit('danger', {
            'cameraId': cam_id,
            'description': 'Fire'        
        })
    
detector = FireDetector(trigger=onTrigger)

def onframe(frame):
    detector.update_frame(frame)
    ret, buffer = cv2.imencode('.jpg', frame)
    b64 = base64.b64encode(buffer)
    img = b64.decode('ascii')
    sio.emit('frame', {
            'cameraId': cam_id,
            'frame': img
        })

if __name__ == '__main__':
    cam = security_camera(onframe)
    print('Client is running...')
    cam.start()