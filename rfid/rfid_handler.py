# RFID Handler
import random as rnd
        
class RFID_handler:
    
    # Ranges = xXyYzZ
    def __init__(self, ranges, on_pos_change = None, delta = 0.01):
        self.ranges = ranges
        self.registered_rfids = dict()
        self.on_pos_change = on_pos_change
        self.delta = 0.01
        
    def __clamp(self, val, a, b):
        if val < a:
            return a
        if val > b:
            return b
        return val

    def __random_chance(self, threshold = 0.5):
        return rnd.random() <= threshold
    
    def register_rfid(self, rfid):
        print('Registered ', rfid)
        self.registered_rfids[rfid] = self.__gen_position()
        
    def unregister_rfid(self, rfid):
        print('Unregistered ', rfid)
        del self.registered_rfids[rfid]
        
    def __gen_position(self):
        ranges = self.ranges
        position = [0, 0, 0, 0]
        position[0] = ranges[0] + rnd.random() * (ranges[1] - ranges[0])
        position[1] = ranges[2] + rnd.random() * (ranges[3] - ranges[2])
        position[2] = ranges[4] + rnd.random() * (ranges[5] - ranges[4])
        return position
    
    def update(self):
        for key in self.registered_rfids:
            if self.__random_chance(0.3):
                position = self.registered_rfids[key]
                position[0] = position[0] + (rnd.random() - 0.5) * 2 * self.delta
                position[1] = position[1] + (rnd.random() - 0.5) * 2 * self.delta
                position[2] = position[2] + (rnd.random() - 0.5) * 2 * self.delta
                
                position[0] = self.__clamp(position[0], self.ranges[0], self.ranges[1])
                position[1] = self.__clamp(position[1], self.ranges[2], self.ranges[3])
                position[2] = self.__clamp(position[2], self.ranges[4], self.ranges[5])
                self.registered_rfids[key] = position
                
                if self.on_pos_change:
                    self.on_pos_change(key, position)