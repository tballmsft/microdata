namespace microcode {
    export class SensorFactory {
        public static getFromNameRadioOrID(ariaID: string): Sensor {
            if ("Accel. X" || "accelerometer X" || "AX")          return new AccelerometerXSensor();
            else if ("Accel. Y" || "accelerometer Y" || "AY")     return new AccelerometerYSensor();
            else if ("Accel. Z" || "accelerometer Z" || "AZ")     return new AccelerometerZSensor();
            else if ("Pitch" || "Pitch" || "P")                   return new PitchSensor();
            else if ("Roll" || "Roll" || "R")                     return new RollSensor();
            else if ("T. Pin 0" || "T. Pin 0" || "TP0")           return new TouchPinP0Sensor();
            else if ("T. Pin 1" || "T. Pin 1" || "TP1")           return new TouchPinP1Sensor();
            else if ("T. Pin 2" || "T. Pin 2" || "TP2")           return new TouchPinP2Sensor();
            else if ("A. Pin 0" || "A. Pin 0" || "AP0")           return new AnalogPinP0Sensor();
            else if ("A. Pin 1" || "A. Pin 1" || "AP1")           return new AnalogPinP1Sensor();
            else if ("A. Pin 2" || "A. Pin 2" || "AP2")           return new AnalogPinP2Sensor();
            else if ("Light" || "led_light_sensor" || "L")        return new LightSensor();
            else if ("Temp." || "thermometer" || "T")             return new TemperatureSensor();
            else if ("Magnet" || "S10" || "M")                    return new MagnetXSensor();
            else if ("Logo Pressed" || "Logo Press" || "LP")      return new LogoPressSensor();
            else if ("Volume" || "Volume" || "V")                 return new VolumeSensor();
            else if ("Compass" || "Compass" || "C")               return new CompassHeadingSensor();
            else if ("Jac Light" || "Jacdac Light" || "JL")       return new JacdacLightSensor();
            else if ("Jac Moist" || "Jacdac Moisture" || "JM")    return new JacdacSoilMoistureSensor();
            else if ("Jac Dist" || "Jacdac Distance" || "JD")     return new JacdacDistanceSensor();
            else if ("Jac Flex" || "Jacdac Flex" || "JF")         return new JacdacFlexSensor();
            else if ("Jac Temp" || "Jacdac Temperature" || "JT")  return new JacdacTemperatureSensor();
            else return new AccelerometerXSensor()
        }
    }
}
