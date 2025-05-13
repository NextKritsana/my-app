import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { Accelerometer } from 'expo-sensors';

const ShakeContext = createContext();

export function ShakeProvider({ children }) {
  const [shake, setShake] = useState(false);
  
  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 1500);  // Reset after 1.5 seconds
  };

  useEffect(() => {
    if (Platform.OS === 'web') {
      console.log('Shake not supported on web.');
      return;
    }

    let subscription;

    const subscribe = () => {
      let lastX, lastY, lastZ;
      let lastShakeTimestamp = Date.now();

      subscription = Accelerometer.addListener(accelerometerData => {
        const { x, y, z } = accelerometerData;

        if (lastX !== undefined && lastY !== undefined && lastZ !== undefined) {
          const deltaX = Math.abs(x - lastX);
          const deltaY = Math.abs(y - lastY);
          const deltaZ = Math.abs(z - lastZ);

          if (deltaX + deltaY + deltaZ > 1.5) { // threshold เขย่า
            const now = Date.now();
            if (now - lastShakeTimestamp > 1000) { // กันกดซ้ำ
              setShake(true);
              lastShakeTimestamp = now;
              setTimeout(() => setShake(false), 1500);
            }
          }
        }

        lastX = x;
        lastY = y;
        lastZ = z;
      });
    };

    subscribe();

    return () => {
      subscription && subscription.remove();
    };
  }, []);

  return (
    <ShakeContext.Provider value={{ shake, triggerShake }}>
      {children}
    </ShakeContext.Provider>
  );
}

export function useShake() {
  return useContext(ShakeContext);
}
