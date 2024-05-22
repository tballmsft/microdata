namespace microcode {
    export enum SensorLoggingMode {
        RECORDING,
        EVENTS
    }

    /** The period that the scheduler should wait before comparing a reading with the event's inequality */
    export const SENSOR_EVENT_POLLING_PERIOD_MS: number = 100
    /** The maximum number of elements permissable in any sensor's buffer */
    export const SENSOR_BUFFER_LIMIT: number = 80;

    /** Value returned by default if the abstract getMinimum() is not overriddent */
    const DEFAULT_SENSOR_MINIMUM = 0
    /** Value returned by default if the abstract getMaximum() is not overriddent */
    const DEFAULT_SENSOR_MAXIMUM = 100

    /** How many times should a line be duplicated when drawn? */
    const PLOT_SMOOTHING_CONSTANT: number = 3

    /**
     * Only used within this sensor file.
     * Forcing prescence of below functions.
     */
    interface ISensorable {
        getReading(): number;
        getMinimum(): number;
        getMaximum(): number;

        getNthReading(n: number): number;
        getBufferLength(): number;
        /** Successful? */
        log(): boolean;
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
        public startTime: number

        /** Used by the live data viewer to write the small abscissa
         * Always increases: even when data buffer is shifted to avoid reaching the BUFFER_LIMIT
         */
        public numberOfReadings: number

        public config: RecordingConfig | EventConfig
        public loggingMode: SensorLoggingMode

        // Reading Statistics:
        public lastLoggedEventDescription: string
        private dataBuffer: number[]
        private totalMeasurements: number;

        constructor(sensorFn: () => number, name: string, config?: RecordingConfig) {
            this.name = name
            this.sensorFn = sensorFn
            this.startTime = 0
            this.numberOfReadings = 0

            this.config = config
            this.loggingMode = null

            this.lastLoggedEventDescription = ""
            this.dataBuffer = []
            this.totalMeasurements = 0
        }

        getReading(): number {return this.sensorFn()}
        getMinimum(): number {return DEFAULT_SENSOR_MINIMUM;}
        getMaximum(): number {return DEFAULT_SENSOR_MAXIMUM;}
        getNthReading(n: number): number {return this.dataBuffer[n]}
        getBufferLength(): number {return this.dataBuffer.length}

        readIntoBufferOnce(): void {
            this.numberOfReadings += 1
            if (this.dataBuffer.length >= SENSOR_BUFFER_LIMIT) {
                this.dataBuffer.shift();
            }
            this.dataBuffer.push(this.getReading());
        }

        setRecordingConfig(config: RecordingConfig) {
            this.config = config
            this.loggingMode = SensorLoggingMode.RECORDING
            this.totalMeasurements = config.measurements
        }

        setEventConfig(config: EventConfig) {
            this.config = config
            this.loggingMode = SensorLoggingMode.EVENTS
            this.totalMeasurements = config.measurements
        }
 
        /**
         * Invokes logData() if this is a RecordingSensor, logEvent() if logging events
         * Currently writes the "Time (Ms)" column using the cumulative period - rather than the real-time
         * @returns Has measurements left
         */
        log(): boolean {
            // if (this.startTime == 0) {
            //     this.startTime = input.runningTime()
            // }

            if (this.config.measurements <= 0) {
                return false
            }

            const reading = this.getReading()
            // const time = input.runningTime() - this.startTime

            if (this.loggingMode == SensorLoggingMode.EVENTS) {
                const config = this.config as EventConfig
                const reading = this.getReading()

                if (sensorEventFunctionLookup[config.inequality](reading, config.comparator)) {
                    datalogger.log(
                        datalogger.createCV("Sensor", this.name),
                        datalogger.createCV("Time (ms)", SENSOR_EVENT_POLLING_PERIOD_MS),
                        datalogger.createCV("Reading", reading.toString()),
                        datalogger.createCV("Event", reading + " " + config.inequality + " " + config.comparator)
                    )
                }
            }

            else {
                const config = this.config as RecordingConfig
                const time = (this.totalMeasurements - config.measurements) * config.period

                datalogger.log(
                    datalogger.createCV("Sensor", this.name),
                    datalogger.createCV("Time (ms)", time.toString()),
                    datalogger.createCV("Reading", reading.toString()),
                    datalogger.createCV("Event", "N/A")
                )
            }
            this.config.measurements -= 1
            return true
        }

        /**
         * Default draw mode: may be overriden to accommodate multiple draw modes
         * Each value in the data buffer is normalised and scaled to screen size per frame.
         *      This is inefficient since only one value is added per frame
         * 
         * @param fromX starting x coordinate
         * @param fromY starting y coordinate
         * @param color
         */
        draw(fromX: number, fromY: number, color: number): void {
            for (let i = 0; i < this.dataBuffer.length - 1; i++) {
                // Normalise the data points, then calculate their position for the graph:
                const norm1 = ((this.dataBuffer[i] - this.getMinimum()) / (this.getMaximum() + Math.abs(this.getMinimum()))) * (screen.height - fromY);
                const norm2 = ((this.dataBuffer[i + 1] - this.getMinimum()) / (this.getMaximum() + Math.abs(this.getMinimum()))) * (screen.height - fromY);
                const y1 = Math.round(screen.height - norm1) - fromY;
                const y2 = Math.round(screen.height - norm2) - fromY;

                for (let j = 0; j < PLOT_SMOOTHING_CONSTANT; j++) {
                    screen.drawLine(
                        fromX + i, 
                        y1 - (PLOT_SMOOTHING_CONSTANT / 2) + j, 
                        fromX + i - 1, 
                        y2 - (PLOT_SMOOTHING_CONSTANT / 2) + j, 
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
     * Translates the ariaID for a sensor into a real sensor object
     */
    export const SENSOR_LOOKUP_TABLE: {[ariaID: string]: Sensor} = {
        "accelerometer X": new AccelerometerSensor(Dimension.X),
        "accelerometer Y": new AccelerometerSensor(Dimension.Y),
        "accelerometer Z": new AccelerometerSensor(Dimension.Z),
        "Pitch": new RotationSensor(Rotation.Pitch),
        "Roll": new RotationSensor(Rotation.Roll),
        "Pin 0": new PinSensor(TouchPin.P0), 
        "Pin 1": new PinSensor(TouchPin.P1),
        "Pin 2": new PinSensor(TouchPin.P2),
        "led_light_sensor": new LightSensor(),
        "thermometer": new TemperatureSensor(),
        "S10": new MagnetSensor(Dimension.X),
        "Logo Press": new LogoPressSensor(),
        "Volume": new VolumeSensor(),
        "Compass": new CompassHeadingSensor(),
        "Jacdac Light": new JacdacLightSensor(),
        "Jacdac Moisture": new JacdacSoilMoistureSensor(),
        "Jacdac Distance": new JacdacDistanceSensor(),
        "Jacdac Flex": new JacdacFlexSensor(),
        "Jacdac Temperature": new JacdacTemperatureSensor()
    }
}