namespace microcode {
    export enum SensorLoggingMode {
        RECORDING,
        EVENTS
    }


    const EVENT_POLLING_PERIOD_MS = 100

    /**
     * Abstraction for all available sensors,
     * Methods are seldom overidden
     */
    export abstract class Sensor {
        public static readonly BUFFER_LIMIT: number = 100;
        public static readonly PLOT_SMOOTHING_CONSTANT: number = 4

        public readonly name: string
        public sensorFn: () => number
        public iconName: string
        public ariaID: string
        public startTime: number

        public config: RecordingConfig | EventConfig
        public loggingMode: SensorLoggingMode

        // Reading Statistics:
        public minimum: number
        public maximum: number
        public peakDataPoint: number[]
        public lastLoggedEventDescription: string

        private dataBuffer: number[]

        constructor(sensorFn: () => number, 
            name: string,
            sensorMinReading: number,
            sensorMaxReading: number,
            iconName: string,
            ariaID: string,
            config?: RecordingConfig
        ) {
            this.name = name
            this.sensorFn = sensorFn
            this.iconName = iconName
            this.ariaID = ariaID
            this.startTime = 0 // This value will be set upon the first reading

            this.config = config
            this.loggingMode = null

            this.minimum = sensorMinReading
            this.maximum = sensorMaxReading
            this.peakDataPoint = [0, this.minimum] // [x, y]
            this.lastLoggedEventDescription = ""

            this.dataBuffer = []
        }

        setRecordingConfig(config: RecordingConfig) {
            this.config = config
            this.loggingMode = SensorLoggingMode.RECORDING
        }

        setEventConfig(config: EventConfig) {
            this.config = config
            this.loggingMode = SensorLoggingMode.EVENTS
        }

        getBufferSize(): number {return this.dataBuffer.length}
        getReading(): number {return this.sensorFn()}
        getNthReading(n: number): number {return this.dataBuffer[n]}
        getDataBufferLength(): number {return this.dataBuffer.length}
        getNormalisedReading(): number{return this.sensorFn() / this.maximum}

        readIntoBufferOnce(): void {
            if (this.dataBuffer.length >= Sensor.BUFFER_LIMIT) {
                this.dataBuffer.shift();
                this.peakDataPoint[0] -= 1
            }
            this.dataBuffer.push(this.getReading());
        }

        /**
         * Spawns an independent background fiber to log sensor data according to its .config
         */
        log() {
            control.inBackground(() => {
                if (this.startTime == 0) {
                    this.startTime = input.runningTime()
                }

                if (this.loggingMode == SensorLoggingMode.EVENTS) {
                    this.logEvent(this.config as EventConfig)
                }

                else {
                    this.logData(this.config as RecordingConfig)
                }
            })
        }

        private logData(config: RecordingConfig) {
            while (config.measurements > 0)  {
                datalogger.log(
                    datalogger.createCV("Sensor", this.name),
                    datalogger.createCV("Time (ms)", (input.runningTime() - this.startTime).toString()),
                    datalogger.createCV("Reading", this.getReading()),
                    datalogger.createCV("Event", "N/A")
                )

                basic.pause(config.period)
                config.measurements -= 1
            }
        }

        private logEvent(config: EventConfig) {
            let sensorEventFunction = sensorEventFunctionLookup[config.inequality]

            while (config.measurements > 0)  {
                const reading = this.getReading()

                if (sensorEventFunction(reading, config.comparator)) {
                    datalogger.log(
                        datalogger.createCV("Sensor", this.name),
                        datalogger.createCV("Time (ms)", (input.runningTime() - this.startTime).toString()),
                        datalogger.createCV("Reading", reading.toString()),
                        datalogger.createCV("Event", reading + " " + config.inequality + " " + config.comparator)
                    )
                    config.measurements -= 1
                }

                basic.pause(EVENT_POLLING_PERIOD_MS)
            }
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
                const norm1 = ((this.dataBuffer[i] - this.minimum) / (this.maximum + Math.abs(this.minimum))) * (screen.height - fromY)
                const norm2 = ((this.dataBuffer[i + 1] - this.minimum) / (this.maximum + Math.abs(this.minimum))) * (screen.height - fromY)
                const y1 = Math.round(screen.height - norm1) - fromY
                const y2 = Math.round(screen.height - norm2) - fromY

                if (this.dataBuffer[i] > this.peakDataPoint[1]) {
                    this.peakDataPoint = [i, this.dataBuffer[i]]
                }

                for (let j = 0; j < Sensor.PLOT_SMOOTHING_CONSTANT; j++) {
                    screen.drawLine(fromX + i, y1 - (Sensor.PLOT_SMOOTHING_CONSTANT / 2) + j, fromX + i - 1, y2 - (Sensor.PLOT_SMOOTHING_CONSTANT / 2) + j, color);
                }
            }
        }
    }

    /**
     * Onboard Light Sensor; ranged between 0 and 255
     */
    export class LightSensor extends Sensor {
        constructor() {
            super(function () {return input.lightLevel()}, "Light", 0, 255, "led_light_sensor", "led_light_sensor")
        }
    }

    /**
     * Onboard Thermometer; ranged between 0 and 100
     */
    export class TemperatureSensor extends Sensor {
        constructor() {
            super(function () {return input.temperature()}, "Temp.", 0, 100, "thermometer", "thermometer")
        }
    }


    /**
     * Onboard Accelerometer for X, Y, Z dimensions; ranged between -1023, 1023
     */
    export class AccelerometerSensor extends Sensor {
        constructor(dim: Dimension) {
            super(function () {return input.acceleration(dim)}, 
                "Accel. " + ['X', 'Y', 'Z'][dim], 
                -1023, 
                1023, 
                "accelerometer",
                "accelerometer " + + ['X', 'Y', 'Z'][dim],
            )
        }
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
                // Pins are 0, 1, 2 = 100, 101, 102
                "Pin " + (pin % 100),
                0,
                1,
                "pin_" + (pin % 100),
                "Pin " + (pin % 100)
            )
        }
    }


    /**
     * Onboard Magnometer for X, Y, Z dimensions
     * 
     * MIN & MAX RANGE UNVERIFIED
     */
    export class MagnetSensor extends Sensor {
        constructor(dim: Dimension) {
            super(function() {return input.magneticForce(dim)},
                "Magnet " + dim.toString(),
                0,
                1,
                "magnet",
                "Magnet"
            )
        }
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

            super(function () {return input.rotation(rot)}, name, 0, 100, "right_turn", name)    
        }
    }

    /**
     * Detection of whether of not the Logo has been pressed
     * 
     * sensorMinReading may change in future
     * sensorMaxReading may change in future
     */
    export class LogoPressSensor extends Sensor {
        constructor() {
            super(
                function () {if(input.logoIsPressed()) {return 1} return 0}, 
                "Logo Pressed", 
                0,
                1, 
                "finger_press", 
                "Logo Press"
            )
        }
    }

    /**
     * Sensor for the current Compass Heading
     * Ranged between 0 and 360 degrees
     */
    export class CompassHeadingSensor extends Sensor {
        constructor() {
            super(
                function () {return input.compassHeading()}, 
                "Compass", 
                0, 
                360, 
                "compass", 
                "Compass"
            )
        }
    }    

    /**
     * Sensor for the Microphone
     * Ranged between 0 and 255
     */
    export class VolumeSensor extends Sensor {
        constructor() {
            super(
                function () {return input.soundLevel()}, 
                "Volume", 
                0, 
                255, 
                "speaker", 
                "Volume"
            )
        }
    }

    /**
     * modules.lightLevel1.lightLevel sensor from pxt-jacdac/jacdac-light-level
     */
    export class JacdacLightSensor extends Sensor {
        constructor() {
            super(
                function () {return modules.lightLevel1.lightLevel()}, 
                "Jacdac Light", 
                0, 
                100,
                "microbitLogo", 
                "Jacdac Light"
            )
        }
    }

    /**
     * modules.distance1.distance sensor from pxt-jacdac/jacdac-distance
     */
    export class JacdacDistanceSensor extends Sensor {
        constructor() {
            super(
                function () {return modules.distance1.distance()}, 
                "Jacdac Dist", 
                0, 
                100,
                "microbitLogo", 
                "Jacdac Dist."
            )
        }
    }

    /**
     * modules.soilMoisture1.moisture sensor from pxt-jacdac/jacdac-soil-moisture
     */
    export class JacdacSoilMoistureSensor extends Sensor {
        constructor() {
            super(
                function () {return modules.soilMoisture1.moisture()}, 
                "Jacdac Moist.", 
                0, 
                100,
                "microbitLogo",
                "Jacdac Moist."
            )
        }
    }

    /**
     * modules.flex1.bending sensor from pxt-jacdac/flex
     */
    export class JacdacFlexSensor extends Sensor {
        constructor() {
            super(
                function () {return modules.flex1.bending()}, 
                "Jacdac Flex.", 
                0, 
                100,
                "microbitLogo",
                "Jacdac Flex."
            )
        }
    }

    /**
     * modules.temperature1.temperature sensor from pxt-jacdac/temperature
     */
    export class JacdacTemperatureSensor extends Sensor {
        constructor() {
            super(
                function () {return modules.temperature1.temperature()}, 
                "Jacdac Temp.", 
                0, 
                100,
                "microbitLogo",
                "Jacdac Temp."
            )
        }
    }

    /**
     * modules.humidity1.humidity sensor from pxt-jacdac/humidity
     */
    export class JacdacHumiditySensor extends Sensor {
        constructor() {
            super(
                function () {return modules.humidity1.humidity()}, 
                "Jacdac Temp.", 
                0, 
                100,
                "microbitLogo",
                "Jacdac Temp."
            )
        }
    }
}