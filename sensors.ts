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
     * Unique attributes to each sensor.
     * Concrete sensor implementations may override.
     */
    interface ISensorable {
        //---------------------------------------------------------------
        // Core sensor Information: Modified by concrete implementations:
        //---------------------------------------------------------------

        /**
         * Overriden by ALL concrete sensor implementations.
         */
        getName(): string;

        /**
         * Overriden by ALL concrete sensor implementations.
         * May be return undefined (unconnected Jacdac)
         * This is caught inside of .readIntoBufferOnce()
         */
        getReading(): number;

        /**
         * Overriden by some concrete sensor implementations.
         */
        getMinimum(): number;

        /**
         * Overriden by some concrete sensor implementations.
         */
        getMaximum(): number;
        
        /**
         * Overriden by ALL Jacdac concrete sensor implementations.
         */
        isJacdac(): boolean;


        //--------------------------
        // Simple Getters & Setters:
        //--------------------------

        /**
         * Not overriden by any concrete sensor implmentation.
         */
        getMaxBufferSize(): number;

        /**
         * Not overriden by any concrete sensor implmentation.
         */
        getNthReading(n: number): number;
        
        /**
         * Not overriden by any concrete sensor implmentation.
         */
        getNthNormalisedReading(n: number): number;
        
        /**
         * Not overriden by any concrete sensor implmentation.
         */
        getBufferLength(): number;
        
        /**
         * Not overriden by any concrete sensor implmentation.
         */
        getNormalisedBufferLength(): number;
        
        /**
         * Not overriden by any concrete sensor implmentation.
         */
        getPeriod(): number;

        /**
         * Not overriden by any concrete sensor implmentation.
         */
        getMeasurements(): number;
        
        /**
         * Not overriden by any concrete sensor implmentation.
         */
        hasMeasurements(): boolean;


        //-------------------------
        // More complex behaviours:
        //-------------------------

        /**
         * Not overriden by any concrete sensor implmentation.
         * Returns 3 strings each with a line about the sensor's recording information.
         * Used in dataRecorder
         */
        getRecordingInformation(): string[];

        /**
         * Not overriden by any concrete sensor implmentation.
         * Returns 3 strings each with a line about the sensor's event information.
         * Used in dataRecorder
         */
        getEventInformation(): string[];

        
        /**
         * Not overriden by any concrete sensor implmentation.
         */
        setBufferSize(newBufferSize: number): void;

        /**
         * Add one value to this.dataBuffer, add that value normalised into this.normalisedBuffer too.
         * No value is added if the reading is undefined (such as from a disconnected Jacdac sensor).
         * If the (this.dataBuffer.length >= this.maxBufferSize) then then the oldest values are removed.
         * @param fromY the offset by which the reading should be raised before adding to this.normalisedBuffer
         * @returns 
         */
        readIntoBufferOnce(fromY: number): void;

        /**
         * Populates this.normalisedBuffer with the Y position for each element in this.dataBuffer.
         * Uses BUFFERED_SCREEN_HEIGHT.
         * Invoked upon scrolling in the live-data-viewer
         * @param fromY The y value that each element should be offset by.
         */
        normaliseDataBuffer(fromY: number): void;

        /**
         * Invoked inside of recordingConfigSelection.
         * @param config see recordingConfigSelection
         * @param isInEventMode will this sensor be used to track events?
         */
        setConfig(config: RecordingConfig): void;

        /**
         * Records a sensor's reading to the datalogger.
         * Will set the event column in the datalogger to "N/A" if not in event mode.
         * Invoked by dataRecorder.log().
         * Writes the "Time (Ms)" column using a cumulative period.
         */
        log(time: number): void;
    }


    /**
     * Abstraction for all available sensors.
     * These are implmented by the 
     */
    export abstract class Sensor implements ISensorable {
        /** Set inside .setConfig() */
        public totalMeasurements: number

        /** Increased on the event of the graph zooming in for example. */
        private maxBufferSize: number

        /** 
         * Used by the live data viewer to write the small abscissa
         * Always increases: even when data buffer is shifted to avoid reaching the BUFFER_LIMIT
         */
        public numberOfReadings: number

        /** Used to determine sensor information to write in DataRecorder and liveDataViewer */
        public isInEventMode: boolean

        /**
         * Determines behaviour of .log()
         */
        private config: RecordingConfig
        

        /** Event statistic used by the dataRecorder. */
        public lastLoggedEventDescription: string

        /**
         * Holds the sensor's readings.
         * Filled via .readIntoBufferOnce()
         * Used by the ticker in liveDataViewer.
         * Values are shifted out from FIFO if at max capacity.
         * Needed since the entire normalisedBuffer may need to be recalculated upon scrolling or zooming.
         */
        private dataBuffer: number[]

        private lastLoggedReading: number;

        /**
         * Holds what the Y axis position should be for the corresponding read value, relative to a granted fromY value.
         * Filled alongside dataBuffer alongside .readIntoBufferOnce()
         * Entire dataBuffer may be recalculated via .normaliseDataBuffer()
         * Values are shifted out from FIFO if at max capacity.
         */
        private normalisedDataBuffer: number[]

        constructor() {
            this.maxBufferSize = 80
            this.totalMeasurements = 0
            this.numberOfReadings = 0
            this.isInEventMode = false

            this.lastLoggedEventDescription = ""
            this.dataBuffer = []
            this.lastLoggedReading = 0
            this.normalisedDataBuffer = []
        }

        //---------------------
        // Interface Functions:
        //---------------------

        getName(): string {return "abstract"}
        getReading(): number {return 0}
        getMinimum(): number {return DEFAULT_SENSOR_MINIMUM;}
        getMaximum(): number {return DEFAULT_SENSOR_MAXIMUM;}
        isJacdac(): boolean {return false;}

        getMaxBufferSize(): number {return this.maxBufferSize}
        getNthReading(n: number): number {return this.dataBuffer[n]}
        getNthNormalisedReading(n: number): number {return this.normalisedDataBuffer[n]}
        getBufferLength(): number {return this.dataBuffer.length}
        getNormalisedBufferLength(): number {return this.normalisedDataBuffer.length}
        getPeriod(): number {return this.config.period;}
        getMeasurements(): number {return this.config.measurements}
        hasMeasurements(): boolean {return this.config.measurements > 0;}

        getRecordingInformation(): string[] {
            return [
                this.getPeriod() / 1000 + " second period", 
                this.config.measurements.toString() + " measurements left",
                ((this.config.measurements * this.getPeriod()) / 1000).toString() + " seconds left",
                "Last log was " + this.lastLoggedReading,
            ]
        }

        getEventInformation(): string[] {
            return [
                this.config.measurements.toString() + " events left",
                "Logging " + this.config.inequality + " " + this.config.comparator + " events",
                "Last log was " + this.lastLoggedReading,
                this.lastLoggedEventDescription
            ]
        }

        /**
         * Change the size of the buffer used for this.dataBuffer & this.normalisedBuffer
         * Will shift out old this.dataBuffer & this.normalisedBuffer values from the front.
         * @param newBufferSize absolute new value for both this.dataBuffer & this.normalisedBuffer
         */
        setBufferSize(newBufferSize: number): void {
            // Remove additional values if neccessary:
            if (this.dataBuffer.length > newBufferSize) {
                const difference = this.dataBuffer.length - newBufferSize
                this.dataBuffer.splice(0, difference)
                this.normalisedDataBuffer.splice(0, difference)
            }
            this.maxBufferSize = newBufferSize
        }

        /**
         * Add one value to this.dataBuffer, add that value normalised into this.normalisedBuffer too.
         * No value is added if the reading is undefined (such as from a disconnected Jacdac sensor).
         * If the (this.dataBuffer.length >= this.maxBufferSize) then then the oldest values are removed.
         * @param fromY the offset by which the reading should be raised before adding to this.normalisedBuffer
         * @returns 
         */
        readIntoBufferOnce(fromY: number): void {
            const reading = this.getReading()

            if (this.dataBuffer.length >= this.maxBufferSize || reading === undefined) {
                this.dataBuffer.shift();
                this.normalisedDataBuffer.shift();
            }

            if (reading === undefined)
                return

            this.numberOfReadings += 1
            const range: number = Math.abs(this.getMinimum()) + this.getMaximum();
            this.dataBuffer.push(reading);
            this.normalisedDataBuffer.push(Math.round(Screen.HEIGHT - ((reading - this.getMinimum()) / range) * (BUFFERED_SCREEN_HEIGHT - fromY)) - fromY);
        }

        /**
         * Populates this.normalisedBuffer with the Y position for each element in this.dataBuffer.
         * Uses BUFFERED_SCREEN_HEIGHT.
         * Invoked upon scrolling in the live-data-viewer.
         * @param fromY The y value that each element should be offset by.
         */
        normaliseDataBuffer(fromY: number) {
            const min = this.getMinimum()
            const range: number = Math.abs(min) + this.getMaximum();

            this.normalisedDataBuffer = []
            for (let i = 0; i < this.dataBuffer.length; i++) {
                this.normalisedDataBuffer.push(Math.round(Screen.HEIGHT - ((this.dataBuffer[i] - min) / range) * (BUFFERED_SCREEN_HEIGHT - fromY)) - fromY);
            }
        }

        /**
         * Set inside of recordingConfigSelection.
         * @param config see recordingConfigSelection.
         * @param isInEventMode will this sensor be used to track events?
         */
        setConfig(config: RecordingConfig) {
            const isInEventMode = config.comparator != null && config.inequality != null
            this.config = config
            this.totalMeasurements = this.config.measurements
            this.isInEventMode = isInEventMode
        }

        /**
         * Records a sensor's reading to the datalogger.
         * Will set the event column in the datalogger to "N/A" if not in event mode.
         * Invoked by dataRecorder.log().
         * Writes the "Time (Ms)" column using a cumulative period.
         */
        log(time: number): void {
            this.lastLoggedReading = this.getReading()
            
            if (this.isInEventMode) {
                if (sensorEventFunctionLookup[this.config.inequality](this.lastLoggedReading, this.config.comparator)) {
                    datalogger.log(
                        datalogger.createCV("Sensor", this.getName()),
                        datalogger.createCV("Time (ms)", time),
                        datalogger.createCV("Reading", this.lastLoggedReading.toString()),
                        datalogger.createCV("Event", this.lastLoggedReading + " " + this.config.inequality + " " + this.config.comparator)
                    )
                    this.config.measurements -= 1
                }
            }

            else {
                datalogger.log(
                    datalogger.createCV("Sensor", this.getName()),
                    datalogger.createCV("Time (ms)", time.toString()),
                    datalogger.createCV("Reading", this.lastLoggedReading.toString()),
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
         * @param color
         */
        draw(fromX: number, color: number): void {
            for (let i = 0; i < this.normalisedDataBuffer.length - 1; i++) {
                for (let j = -(PLOT_SMOOTHING_CONSTANT / 2); j < PLOT_SMOOTHING_CONSTANT / 2; j++) {
                    screen.drawLine(
                        fromX + i,
                        this.normalisedDataBuffer[i] + j,
                        fromX + i + 1,
                        this.normalisedDataBuffer[i + 1] + j,
                        color
                    );
                }
            }
        }
    }

    /**
     * Concrete implementation of onboard Light Sensor.
     * Ranged between 0 and 255
     */
    export class LightSensor extends Sensor {
        constructor() {super()}

        public static getName(): string {return "Light"}
        public static getReading(): number {return input.lightLevel()}
        public static getMinimum(): number {return 0;}
        public static getMaximum(): number {return 255;}
        
    }

    /**
     * Concrete implementation of onboard Thermometer.
     * Ranged between 0 and 100
     */
    export class TemperatureSensor extends Sensor {
        constructor() {super()}

        public static getName(): string {return "Temp."}
        public static getReading(): number {return input.temperature()}
    }

    /**
     * Concrete implementation of onboard Accelerometer with Dimension X
     * Cannot be bundled with other Accelerometer's since getName() needs to be static.
     * Ranged between -1023 to 1023
     */
    export class AccelerometerXSensor extends Sensor {
        constructor() {super()}

        public static getName(): string {return "Accel. X"}
        public static getReading(): number {return input.acceleration(Dimension.X)}
        public static getMinimum(): number {return -1023;}
        public static getMaximum(): number {return 1023;}
        
    }

    /**
     * Concrete implementation of onboard Accelerometer with Dimension Y
     * Cannot be bundled with other Accelerometer's since getName() needs to be static.
     * Ranged between -1023 to 1023
     */
    export class AccelerometerYSensor extends Sensor {
        constructor() {super()}

        public static getName(): string {return "Accel. Y"}
        public static getReading(): number {return input.acceleration(Dimension.Y)}
        public static getMinimum(): number {return -1023;}
        public static getMaximum(): number {return 1023;}
        
    }

    /**
     * Concrete implementation of onboard Accelerometer with Dimension Z
     * Cannot be bundled with other Accelerometer's since getName() needs to be static.
     * Ranged between -1023 to 1023
     */
    export class AccelerometerZSensor extends Sensor {
        constructor() {super()}

        public static getName(): string {return "Accel. Z"}
        public static getReading(): number {return input.acceleration(Dimension.Z)}
        public static getMinimum(): number {return -1023;}
        public static getMaximum(): number {return 1023;}
        
    }

    /**
     * Touchpin sensor.
     * Need to hold both Ground and this Pin for an effect.
     */
    export class TouchPinP0Sensor extends Sensor {
        private static pinStatus: number
        public static isActive: boolean = false

        constructor() {
            super()

            TouchPinP0Sensor.pinStatus = 0;
            input.onPinPressed(TouchPin.P0, function () {
                TouchPinP0Sensor.pinStatus = (TouchPinP0Sensor.pinStatus == 1) ? 0 : 1
            })
        }

        public static getName(): string {return "T. Pin 0"}
        public static getReading(): number {return TouchPinP0Sensor.pinStatus}
        public static getMinimum(): number {return 0;}
        public static getMaximum(): number {return 1;}
    }

    /**
     * Touchpin sensor.
     * Need to hold both Ground and this Pin for an effect.
     */
    export class TouchPinP1Sensor extends Sensor {
        private static pinStatus: number
        public static isActive: boolean = false

        constructor() {
            super()

            TouchPinP1Sensor.pinStatus = 0;
            input.onPinReleased(TouchPin.P1, () => {
                TouchPinP1Sensor.pinStatus = (TouchPinP1Sensor.pinStatus == 0) ? 1 : 0
            })
        }

        public static getName(): string {return "T. Pin 1"}
        public static getReading(): number {return TouchPinP1Sensor.pinStatus}
        public static getMinimum(): number {return 0;}
        public static getMaximum(): number {return 1;}
    }

    /**
     * Touchpin sensor.
     * Need to hold both Ground and this Pin for an effect.
     */
    export class TouchPinP2Sensor extends Sensor {
        private static pinStatus: number
        public static isActive: boolean = false

        constructor() {
            super()
            
            TouchPinP2Sensor.pinStatus = 0;
            input.onPinPressed(TouchPin.P2, function () {
                TouchPinP2Sensor.pinStatus = (TouchPinP2Sensor.pinStatus == 1) ? 0 : 1
            })
        }

        public static getName(): string {return "T. Pin 2"}
        public static getReading(): number {return TouchPinP2Sensor.pinStatus}
        public static getMinimum(): number {return 0;}
        public static getMaximum(): number {return 1;}
    }


    /**
     * Sensing analog values on the P0 pin
     */
    export class AnalogPinP0Sensor extends Sensor {
        constructor() {super()}
        public static getName(): string {return "A. Pin 0"}
        public static getReading(): number {return pins.analogReadPin(AnalogPin.P0) / 1023}
        public static getMinimum(): number {return 0;}
        public static getMaximum(): number {return 1;}
    }


    /**
     * Sensing analog values on the P1 pin
     */
    export class AnalogPinP1Sensor extends Sensor {
        constructor() {super()}
        public static getName(): string {return "A. Pin 1"}
        public static getReading(): number {return pins.analogReadPin(AnalogPin.P1) / 1023}
        public static getMinimum(): number {return 0;}
        public static getMaximum(): number {return 1;}
    }


    /**
     * Sensing analog values on the P2 pin
     */
    export class AnalogPinP2Sensor extends Sensor {
        constructor() {super()}
        public static getName(): string {return "A. Pin 2"}
        public static getReading(): number {return pins.analogReadPin(AnalogPin.P2) / 1023}
        public static getMinimum(): number {return 0;}
        public static getMaximum(): number {return 1;}
    }


    /**
     * Micro-tesla reading of the magnet sensor
     */
    export class MagnetXSensor extends Sensor {
        constructor() {super()}

        public static getName(): string {return "Magnet X"}
        public static getReading(): number {return input.magneticForce(Dimension.X)}
    }


    /**
     * Onboard Pitch or Roll sensor
     * 
     * MIN & MAX RANGE UNVERIFIED
     */
    export class PitchSensor extends Sensor {
        constructor() {super()}

        public static getName(): string {return "Pitch"}
        public static getReading(): number {return input.rotation(Rotation.Pitch)}
        public static getMinimum(): number {return -180;}
        public static getMaximum(): number {return 180;}
    }

    /**
     * Onboard Pitch or Roll sensor
     */
    export class RollSensor extends Sensor {
        constructor() {super()}

        public static getName(): string {return "Roll"}
        public static getReading(): number {return input.rotation(Rotation.Roll)}
        public static getMinimum(): number {return -180;}
        public static getMaximum(): number {return 180;}
    }

    /**
     * Detection of whether of not the Logo has been pressed
     * 
     * sensorMinReading may change in future
     * sensorMaxReading may change in future
     */
    export class LogoPressSensor extends Sensor {
        constructor() {super()}

        public static getName(): string {return "Logo Pressed"}
        public static getReading(): number {return input.logoIsPressed() ? 1 : 0}
        public static getMinimum(): number {return 0;}
        public static getMaximum(): number {return 1;}
    }

    /**
     * Sensor for the current Compass Heading
     * Ranged between 0 and 360 degrees.
     */
    export class CompassHeadingSensor extends Sensor {
        constructor() {super()}

        public static getName(): string {return "Compass"}
        public static getReading(): number {return input.compassHeading()}
        public static getMinimum(): number {return 0;}
        public static getMaximum(): number {return 360;}
    }

    /**
     * Sensor for the Microphone
     * Ranged between 0 and 255.
     */
    export class VolumeSensor extends Sensor {
        constructor() {super()}

        public static getName(): string {return "Volume"}
        public static getReading(): number {return input.soundLevel()}
        public static getMinimum(): number {return 0;}
        public static getMaximum(): number {return 255;}
    }

    /**
     * See modules.lightLevel1.lightLevel sensor from pxt-jacdac/jacdac-light-level.
     * Overrides .isJacdac()
     */
    export class JacdacLightSensor extends Sensor {
        constructor() {super(); modules.lightLevel1.start()}

        public static getName(): string {return "Jac Light"}
        public static getReading(): number {return modules.lightLevel1.isConnected() ? modules.lightLevel1.lightLevel() : undefined}
        public static isJacdac(): boolean {return true;}
    }

    /**
     * See modules.distance1.distance sensor from pxt-jacdac/jacdac-distance.
     * Overrides .isJacdac()
     */
    export class JacdacDistanceSensor extends Sensor {
        constructor() {super(); modules.distance1.start()}

        public static getName(): string {return "Jac Dist"}
        public static getReading(): number {return modules.distance1.isConnected() ? modules.distance1.distance() : undefined}
        public static isJacdac(): boolean {return true;}
    }

    /**
     * See modules.soilMoisture1.moisture sensor from pxt-jacdac/jacdac-soil-moisture.
     * Overrides .isJacdac()
     */
    export class JacdacSoilMoistureSensor extends Sensor {
        constructor() {super(); modules.soilMoisture1.start()}

        public static getName(): string {return "Jac Moist"}
        public static getReading(): number {return modules.soilMoisture1.isConnected() ? modules.soilMoisture1.moisture() : undefined}
        public static isJacdac(): boolean {return true;}
    }

    /**
     * See modules.flex1.bending sensor from pxt-jacdac/flex.
     * Overrides .isJacdac()
     */
    export class JacdacFlexSensor extends Sensor {
        constructor() {super(); modules.flex1.start()}

        public static getName(): string {return "Jac Flex"}
        public static getReading(): number {return modules.flex1.isConnected() ? modules.flex1.bending() : undefined}
        public static isJacdac(): boolean {return true;}
    }

    /**
     * See modules.temperature1.temperature sensor from pxt-jacdac/temperature.
     * Overrides .isJacdac()
     */
    export class JacdacTemperatureSensor extends Sensor {
        constructor() {super(); modules.temperature1.start()}

        public static getName(): string {return "Jac Temp"}
        public static getReading(): number {return modules.temperature1.isConnected() ? modules.temperature1.temperature() : undefined}
        public static isJacdac(): boolean {return true;}
    }

    /**
     * See modules.humidity1.humidity sensor from pxt-jacdac/humidity.
     * Overrides .isJacdac()
     */
    export class JacdacHumiditySensor extends Sensor {
        constructor() {super(); modules.humidity1.start()}

        public static getName(): string {return "Jac Humid"}
        public static getReading(): number {return modules.humidity1.isConnected() ? modules.humidity1.humidity() : undefined}
        public static isJacdac(): boolean {return true;}
    }
}