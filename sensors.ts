namespace microcode {
    /** The period that the scheduler should wait before comparing a reading with the event's inequality */
    export const SENSOR_EVENT_POLLING_PERIOD_MS: number = 100

    /** Value returned by default if the abstract getMinimum() is not overriddent */
    const DEFAULT_SENSOR_MINIMUM = 0
    /** Value returned by default if the abstract getMaximum() is not overriddent */
    const DEFAULT_SENSOR_MAXIMUM = 100

    /** How many times should a line be duplicated when drawn? */
    const PLOT_SMOOTHING_CONSTANT: number = 4

    /**
     * Only used within this sensor file.
     * Forcing prescence of below functions.
     */
    interface ISensorable {
        getReading(): number;
        getMinimum(): number;
        getMaximum(): number;

        getNthReading(n: number): number;
        setBufferSize(newBufferSize: number): void;
        getBufferLength(): number;

        log(): void;
        hasMeasurements(): boolean;
        getPeriod(): number;
    }


    /**
     * SENSOR_LOOKUP_TABLE is at the bottom of this file
     */


    /**
     * Abstraction for all available sensors,
     */
    export abstract class Sensor implements ISensorable {
        public readonly name: string
        public sensorFn: () => number

        /** Set upon the first reading */
        public totalMeasurements: number

        public maxBufferSize: number

        /** Used by the live data viewer to write the small abscissa
         * Always increases: even when data buffer is shifted to avoid reaching the BUFFER_LIMIT
         */
        public numberOfReadings: number

        public config: RecordingConfig
        public isInEventMode: boolean

        // Reading Statistics:
        public lastLoggedEventDescription: string
        private dataBuffer: number[]

        constructor(sensorFn: () => number, name: string, config?: RecordingConfig) {
            this.name = name
            this.sensorFn = sensorFn

            this.maxBufferSize = 80
            this.totalMeasurements = 0
            this.numberOfReadings = 0

            this.config = config
            this.isInEventMode = false

            this.lastLoggedEventDescription = ""
            this.dataBuffer = []
        }

        getReading(): number {return this.sensorFn()}
        getMinimum(): number {return DEFAULT_SENSOR_MINIMUM;}
        getMaximum(): number {return DEFAULT_SENSOR_MAXIMUM;}
        getNthReading(n: number): number {return this.dataBuffer[n]}

        setBufferSize(newBufferSize: number): void {
            // Remove additional values if neccessary:
            if (this.dataBuffer.length > newBufferSize) {
                const difference = this.maxBufferSize - newBufferSize
                this.dataBuffer.splice(this.dataBuffer.length - difference, difference)
            }
            this.maxBufferSize = newBufferSize
        }
        getBufferLength(): number {return this.dataBuffer.length}

        readIntoBufferOnce(): void {
            this.numberOfReadings += 1
            if (this.dataBuffer.length >= this.maxBufferSize) {
                this.dataBuffer.shift();
            }
            this.dataBuffer.push(this.getReading());
        }

        setConfig(config: RecordingConfig, isInEventMode: boolean) {
            this.config = config
            this.totalMeasurements = this.config.measurements
            this.isInEventMode = isInEventMode
        }

        hasMeasurements(): boolean {
            return this.config.measurements > 0;
        }

        getPeriod(): number {
            return this.config.period;
        }

        /**
         * Records a sensor's reading to the datalogger, or polls for an event
         * Invoked by dataRecorder.log()
         * Writes the "Time (Ms)" column using the cumulative period
         */
        log() {
            const reading = this.getReading()
            const time = (this.totalMeasurements - this.config.measurements) * this.config.period
            
            if (this.isInEventMode) {
                if (sensorEventFunctionLookup[this.config.inequality](reading, this.config.comparator)) {
                    datalogger.log(
                        datalogger.createCV("Sensor", this.name),
                        datalogger.createCV("Time (ms)", time),
                        datalogger.createCV("Reading", reading.toString()),
                        datalogger.createCV("Event", reading + " " + this.config.inequality + " " + this.config.comparator)
                    )
                    this.config.measurements -= 1
                }
            }

            else {
                datalogger.log(
                    datalogger.createCV("Sensor", this.name),
                    datalogger.createCV("Time (ms)", time.toString()),
                    datalogger.createCV("Reading", reading.toString()),
                    datalogger.createCV("Event", "N/A")
                )
                this.config.measurements -= 1
            }
        }

        /**
         * Default draw mode: may be overriden to accommodate multiple draw modes
         * Each value in the data buffer is normalised and scaled to screen size per frame.
         *      This is inefficient since only one value is added per frame
         * @param fromX starting x coordinate
         * @param fromY starting y coordinate
         * @param color
         */
        draw(fromX: number, fromY: number, color: number): void {
            const range: number = Math.abs(this.getMinimum()) + this.getMaximum();

            for (let i = 0; i < this.dataBuffer.length - 1; i++) {
                const norm1 = ((this.dataBuffer[i] - this.getMinimum()) / range) * (BUFFERED_SCREEN_HEIGHT - fromY);
                const norm2 = ((this.dataBuffer[i + 1] - this.getMinimum()) / range) * (BUFFERED_SCREEN_HEIGHT - fromY);
                const y1 = Math.round(Screen.HEIGHT - norm1) - fromY;
                const y2 = Math.round(Screen.HEIGHT - norm2) - fromY;

                for (let j = -(PLOT_SMOOTHING_CONSTANT / 2); j < PLOT_SMOOTHING_CONSTANT / 2; j++) {
                    screen.drawLine(
                        fromX + i,
                        y1 + j,
                        fromX + i + 1,
                        y2 + j,
                        color
                    );
                }
            }
        }
    }

    /**
     * Onboard Light Sensor; ranged between 0 and 255
     */
    export class LightSensor extends Sensor {
        constructor() {super(function () {return input.lightLevel()}, "Light")}

        public static getMinimum(): number {return 0;}
        public static getMaximum(): number {return 255;}
    }

    /**
     * Onboard Thermometer; ranged between 0 and 100
     */
    export class TemperatureSensor extends Sensor {
        constructor() {super(function () {return input.temperature()}, "Temp.")}
    }

    /**
     * Onboard Accelerometer for X, Y, Z dimensions; ranged between -1023, 1023
     */
    export class AccelerometerSensor extends Sensor {
        constructor(dim: Dimension) {super(function () {return input.acceleration(dim)}, "Accel. " + ['X', 'Y', 'Z'][dim])}

        public static getMinimum(): number {return -1023;}
        public static getMaximum(): number {return 1023;}
    }

    /**
     * Onboard Touch Pin Sensor for TouchPin 0, 1, 2; ranged between 0 and 1
     */
    export class PinSensor extends Sensor {
        constructor(pin: TouchPin) {
            super(function () {
                let res: number = 0
                input.onPinPressed(pin, function () {
                    res = 1
                })
                return res
            },
            "Pin " + (pin % 100),
            )
        }

        public static getMinimum(): number {return 0;}
        public static getMaximum(): number {return 1;}
    }

    /**
     * Onboard Magnometer for X, Y, Z dimensions
     * 
     * MIN & MAX RANGE UNVERIFIED
     */
    export class MagnetSensor extends Sensor {
        constructor(dim: Dimension) {super(function() {return input.magneticForce(dim)}, "Magnet " + dim.toString())}

        public static getMinimum(): number {return 0;}
        public static getMaximum(): number {return 1;}
    }

    /**
     * Onboard Pitch or Roll sensor
     * 
     * MIN & MAX RANGE UNVERIFIED
     */
    export class RotationSensor extends Sensor {
        constructor(rot: Rotation) {
            let name: string = "Pitch"

            if (rot === Rotation.Roll) {
                name = "Roll"
            }

            super(function () {return input.rotation(rot)}, name)
        }
    }

    /**
     * Detection of whether of not the Logo has been pressed
     * 
     * sensorMinReading may change in future
     * sensorMaxReading may change in future
     */
    export class LogoPressSensor extends Sensor {
        constructor() {super(function () {if(input.logoIsPressed()) {return 1} return 0}, "Logo Pressed")}

        public static getMinimum(): number {return 0;}
        public static getMaximum(): number {return 1;}
    }

    /**
     * Sensor for the current Compass Heading
     * Ranged between 0 and 360 degrees
     */
    export class CompassHeadingSensor extends Sensor {
        constructor() {super(function () {return input.compassHeading()}, "Compass")}

        public static getMinimum(): number {return 0;}
        public static getMaximum(): number {return 360;}
    }

    /**
     * Sensor for the Microphone
     * Ranged between 0 and 255
     */
    export class VolumeSensor extends Sensor {
        constructor() {super(function () {return input.soundLevel()}, "Volume")}

        public static getMinimum(): number {return 0;}
        public static getMaximum(): number {return 255;}
    }

    /**
     * modules.lightLevel1.lightLevel sensor from pxt-jacdac/jacdac-light-level
     */
    export class JacdacLightSensor extends Sensor {
        constructor() {super(function () {return modules.lightLevel1.lightLevel()}, "Jac Light")}
    }

    /**
     * modules.distance1.distance sensor from pxt-jacdac/jacdac-distance
     */
    export class JacdacDistanceSensor extends Sensor {
        constructor() {super(function () {return modules.distance1.distance()}, "Jac Dist")}
    }

    /**
     * modules.soilMoisture1.moisture sensor from pxt-jacdac/jacdac-soil-moisture
     */
    export class JacdacSoilMoistureSensor extends Sensor {
        constructor() {super(function () {return modules.soilMoisture1.moisture()}, "Jac Moist")}
    }

    /**
     * modules.flex1.bending sensor from pxt-jacdac/flex
     */
    export class JacdacFlexSensor extends Sensor {
        constructor() {super(function () {return modules.flex1.bending()}, "Jac Flex")}
    }

    /**
     * modules.temperature1.temperature sensor from pxt-jacdac/temperature
     */
    export class JacdacTemperatureSensor extends Sensor {
        constructor() {super(function () {return modules.temperature1.temperature()}, "Jac Temp")}
    }

    /**
     * modules.humidity1.humidity sensor from pxt-jacdac/humidity
     */
    export class JacdacHumiditySensor extends Sensor {
        constructor() {super(function () {return modules.humidity1.humidity()}, "Jac Humid")}
    }

    /**
     * Translates the Name for a sensor into a real sensor object
     */
    export const SENSOR_LOOKUP_TABLE: {[ariaID: string]: Sensor} = {
        "Accel. X"      : new AccelerometerSensor(Dimension.X),
        "Accel. Y"      : new AccelerometerSensor(Dimension.Y),
        "Accel. Z"      : new AccelerometerSensor(Dimension.Z),
        "Pitch"         : new RotationSensor(Rotation.Pitch),
        "Roll"          : new RotationSensor(Rotation.Roll),
        "Pin 0"         : new PinSensor(TouchPin.P0),
        "Pin 1"         : new PinSensor(TouchPin.P1),
        "Pin 2"         : new PinSensor(TouchPin.P2),
        "Light"         : new LightSensor(),
        "Temp."         : new TemperatureSensor(),
        "Magnet"        : new MagnetSensor(Dimension.X),
        "Logo Pressed"  : new LogoPressSensor(),
        "Volume"        : new VolumeSensor(),
        "Compass"       : new CompassHeadingSensor(),
        "Jac Flex"      : new JacdacLightSensor(),
        "Jac Temp"      : new JacdacSoilMoistureSensor(),
        "Jac Light"     : new JacdacDistanceSensor(),
        "Jac Moist"     : new JacdacFlexSensor(),
        "Jac Dist"      : new JacdacTemperatureSensor()
    }

    /**
     * Translates the ariaID into the Name used by that sensor
     */
    export const ARIAID_TO_SENSOR_NAME_LOOKUP_TABLE: {[ariaID: string]: string} = {
        "accelerometer X"    : "Accel. X",
        "accelerometer Y"    : "Accel. Y",
        "accelerometer Z"    : "Accel. Z",
        "Pitch"              : "Pitch",
        "Roll"               : "Roll",
        "Pin 0"              : "Pin 0",
        "Pin 1"              : "Pin 1",
        "Pin 2"              : "Pin 2",
        "led_light_sensor"   : "Light",
        "thermometer"        : "Temp.",
        "S10"                : "Magnet",
        "Logo Press"         : "Logo Pressed",
        "Volume"             : "Volume",
        "Compass"            : "Compass",
        "Jacdac Light"       : "Jac Flex",
        "Jacdac Moisture"    : "Jac Temp",
        "Jacdac Distance"    : "Jac Light",
        "Jacdac Flex"        : "Jac Moist",
        "Jacdac Temperature" : "Jac Dist"
    }
}