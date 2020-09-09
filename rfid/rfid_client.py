# RFID Client

from rfid_handler import RFID_handler
import socketio
import time
import configparser

config = configparser.ConfigParser()
config.read('config.ini')

port = int(config['RFID']['PORT'])

sio = socketio.Client()
sio.connect(f'http://127.0.0.1:{port}?device=rfid')

def position_changed(rfid, position):
    print('Location of RFID', rfid, 'changed. Position: ', position)
    sio.emit('rfid_location_update', {
        'rfid': rfid,
        'position': {
            'x': position[0],
            'y': position[1],
            'z': position[2]
        }
    })

handler = RFID_handler([0,1,0,1,0,1], on_pos_change=position_changed)

@sio.on('register_rfid')
def register_rfid(data):
    handler.register_rfid(data['rfid'])

@sio.on('unregister_rfid')
def unregister_rfid(data):
    handler.unregister_rfid(data['rfid'])
    
if __name__ == '__main__':
    print('Client is running...')
    while True:
        handler.update()
        time.sleep(0.5)