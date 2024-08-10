namespace microcode {
    export class SensorFactory {
        public static getFromSensorName(ariaID: string): Sensor {
            switch (ariaID) {
                case("Accel. X")     : return new AccelerometerXSensor();
                case("Accel. Y")     : return new AccelerometerYSensor();
                case("Accel. Z")     : return new AccelerometerZSensor();
                case("Pitch")        : return new PitchSensor();
                case("Roll")         : return new RollSensor();
                case("T. Pin 0")     : return new TouchPinP0Sensor();
                case("T. Pin 1")     : return new TouchPinP1Sensor();
                case("T. Pin 2")     : return new TouchPinP2Sensor();
                case("A. Pin 0")     : return new AnalogPinP0Sensor();
                case("A. Pin 1")     : return new AnalogPinP1Sensor();
                case("A. Pin 2")     : return new AnalogPinP2Sensor();
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
                case("T. Pin 0")            : return new TouchPinP0Sensor();
                case("T. Pin 1")            : return new TouchPinP1Sensor();
                case("T. Pin 2")            : return new TouchPinP2Sensor();
                case("A. Pin 0")            : return new AnalogPinP0Sensor();
                case("A. Pin 1")            : return new AnalogPinP1Sensor();
                case("A. Pin 2")            : return new AnalogPinP2Sensor();
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

        public static getFromRadioName(radioName: string): Sensor {
            switch (radioName) {
                case("AX")  : return new AccelerometerXSensor();
                case("AY")  : return new AccelerometerYSensor();
                case("AZ")  : return new AccelerometerZSensor();
                case("P")   : return new PitchSensor();
                case("R")   : return new RollSensor();
                case("TP0") : return new TouchPinP0Sensor();
                case("TP1") : return new TouchPinP1Sensor();
                case("TP2") : return new TouchPinP2Sensor();
                case("AP0") : return new AnalogPinP0Sensor();
                case("AP1") : return new AnalogPinP1Sensor();
                case("AP2") : return new AnalogPinP2Sensor();
                case("L")   : return new LightSensor();
                case("T")   : return new TemperatureSensor();
                case("M")   : return new MagnetXSensor();
                case("LP")  : return new LogoPressSensor();
                case("V")   : return new VolumeSensor();
                case("C")   : return new CompassHeadingSensor();
                case("JL")  : return new JacdacLightSensor();
                case("JM")  : return new JacdacSoilMoistureSensor();
                case("JD")  : return new JacdacDistanceSensor();
                case("JF")  : return new JacdacFlexSensor();
                case("JT")  : return new JacdacTemperatureSensor();
                default     : return new AccelerometerXSensor()
            }
        }

        // public static radioToSensorName(radioName: string): string {
        //     switch (radioName) {
        //         case("AX")  : return "Accel. X"
        //         case("AY")  : return "Accel. Y"
        //         case("AZ")  : return "Accel. Z"
        //         case("P")   : return "Pitch"
        //         case("R")   : return "Roll"
        //         case("TP0") : return "T. Pin 0"
        //         case("TP1") : return "T. Pin 1"
        //         case("TP2") : return "T. Pin 2"
        //         case("AP0") : return "A. Pin 0"
        //         case("AP1") : return "A. Pin 1"
        //         case("AP2") : return "A. Pin 2"
        //         case("L")   : return "Light"
        //         case("T")   : return "Temp."
        //         case("M")   : return "Magnet"
        //         case("LP")  : return "Logo Pressed"
        //         case("V")   : return "Volume"
        //         case("C")   : return "Compass"
        //         case("JL")  : return "Jac Light"
        //         case("JM")  : return "Jac Moist"
        //         case("JD")  : return "Jac Dist"
        //         case("JF")  : return "Jac Flex"
        //         case("JT")  : return "Jac Temp"
        //         default     : return "Accel. X"
        //     }
        // }
    }
}
