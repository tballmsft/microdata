namespace microcode {
    export class SensorFactory {
        public static getFromSensorName(ariaID: string): Sensor {
            switch (ariaID) {
                case("Accel. X")     : return new AccelerometerXSensor();
                case("Accel. Y")     : return new AccelerometerYSensor();
                case("Accel. Z")     : return new AccelerometerZSensor();
                case("Pitch")        : return new PitchSensor();
                case("Roll")         : return new RollSensor();
                case("Pin 0")        : return new PinP0Sensor();
                case("Pin 1")        : return new PinP1Sensor();
                case("Pin 2")        : return new PinP2Sensor();
                case("Light")        : return new LightSensor();
                case("Temp.")        : return new TemperatureSensor();
                case("Magnet")       : return new MagnetXSensor();
                case("Logo Pressed") : return new LogoPressSensor();
                case("Volume")       : return new VolumeSensor();
                case("Compass")      : return new CompassHeadingSensor();
                case("Jac Light")    : return new JacdacLightSensor();
                case("Jac Moist")    : return new JacdacSoilMoistureSensor();
                case("Jac Dist")     : return new JacdacDistanceSensor();
                case("Jac Flex")     : return new JacdacFlexSensor();
                case("Jac Temp")     : return new JacdacTemperatureSensor();
                default              : return new AccelerometerXSensor()
            }
        }

        public static getFromAriaID(ariaID: string): Sensor {
            switch (ariaID) {
                case("accelerometer X")     : return new AccelerometerXSensor();
                case("accelerometer Y")     : return new AccelerometerYSensor();
                case("accelerometer Z")     : return new AccelerometerZSensor();
                case("Pitch")               : return new PitchSensor();
                case("Roll")                : return new RollSensor();
                case("Pin 0")               : return new PinP0Sensor();
                case("Pin 1")               : return new PinP1Sensor();
                case("Pin 2")               : return new PinP2Sensor();
                case("led_light_sensor")    : return new LightSensor();
                case("thermometer")         : return new TemperatureSensor();
                case("S10")                 : return new MagnetXSensor();
                case("Logo Press")          : return new LogoPressSensor();
                case("Volume")              : return new VolumeSensor();
                case("Compass")             : return new CompassHeadingSensor();
                case("Jacdac Light")        : return new JacdacLightSensor();
                case("Jacdac Moisture")     : return new JacdacSoilMoistureSensor();
                case("Jacdac Distance")     : return new JacdacDistanceSensor();
                case("Jacdac Flex")         : return new JacdacFlexSensor();
                case("Jacdac Temperature")  : return new JacdacTemperatureSensor();
                default                     : return new AccelerometerXSensor()
            }
        }
    }
}
