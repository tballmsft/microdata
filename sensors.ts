namespace microcode {
    /**
     * Abstraction for all available sensors,
     * Methods are seldom overidden
     */
    export abstract class Sensor {
        static readonly BUFFER_LIMIT: number = 100;
        static readonly PLOT_SMOOTHING_CONSTANT: number = 8

        public sensorFn: () => number
        public name: string
        public iconName: string
        public ariaID: string

        // Reading Statistics:
        public minimum: number
        public maximum: number
        public peakDataPoint: number[]

        private dataBuffer: number[]
        private startTime: number

        // Details regarding how the sensor should asynchronously record measurements/report events
        private config: RecordingConfig

        // Potential to add different display options
        // For example: view a magnometer as a line-graph or directionally
        private numberOfDisplayModes: number
        private currentDisplayMode: number

        constructor(sensorFn: () => number, 
            name: string,
            sensorMinReading: number,
            sensorMaxReading: number,
            numberOfDisplayModes: number,
            iconName: string,
            ariaID: string
        ) {
            this.sensorFn = sensorFn
            this.name = name
            this.iconName = iconName
            this.ariaID = ariaID

            this.minimum = sensorMinReading
            this.maximum = sensorMaxReading
            this.peakDataPoint = [0, this.minimum] // [x, y]

            this.numberOfDisplayModes = numberOfDisplayModes
            this.numberOfDisplayModes = 1 // Default

            this.dataBuffer = []
            this.startTime = 0 // This value will be set upon the first reading
        }


        /**
         * It would be better for this config to be passed in upon sensor construction
         *      This requires a Sensor Factory
         * 
         * Invoked at the end of recordingConfigSelection
         *  
         * This method should be removed in future releases
         * 
         * @param config Period, Measurement quantity, event handling, etc
         */
        setConfig(config: RecordingConfig) {
            this.config = config
        }

        cycleDisplayMode() {
            this.currentDisplayMode = (this.currentDisplayMode + 1) % this.numberOfDisplayModes
        }

        getBufferSize(): number {
            return this.dataBuffer.length
        }

        getReading(): number {
            return this.sensorFn()
        }

        getNthReading(n: number): number {
            return this.dataBuffer[n]
        }

        getDataBufferLength(): number {
            return this.dataBuffer.length
        }

        getNormalisedReading(): number{
            return this.sensorFn() / this.maximum
        }

        readIntoBuffer(): void {
            if (this.dataBuffer.length >= Sensor.BUFFER_LIMIT) {
                this.dataBuffer.shift();
                this.peakDataPoint[0] -= 1
            }
            this.dataBuffer.push(this.getReading());
        }

        private handleEvent(): void {
            const reading = this.getReading().toString()
            const data: string[] = [
                this.name, 
                (input.runningTime() - this.startTime).toString(), 
                this.config.sensorEvent.inequality + " " + reading,
                reading
            ]
            FauxDataLogger.log(data)
        }

        startPolling() {
            this.startTime = input.runningTime()
            let currentPollID = 0

            while (currentPollID < this.config.measurements) {
                this.config.sensorEvent.handleEvent(this.getReading(), this.handleEvent)
                currentPollID += 1
                basic.pause(this.config.period)
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

                // Minimal data smoothing:
                if (Math.abs(y1 - y2) <= Sensor.PLOT_SMOOTHING_CONSTANT) {
                    screen.drawLine(fromX + i, y1, fromX + i - 1, y1, color);
                }

                screen.drawLine(fromX + i, y1, fromX + i - 1, y2, color);
            }
        }
    }

    /**
     * Onboard Light Sensor; ranged between 0 and 255
     */
    export class LightSensor extends Sensor {
        constructor() {
            super(function () {return input.lightLevel()}, "Light", 0, 255, 1, "led_light_sensor", "led_light_sensor")
        }
    }

    /**
     * Onboard Thermometer; ranged between 0 and 100
     */
    export class TemperatureSensor extends Sensor {
        constructor() {
            super(function () {return input.temperature()}, "Temp.", 0, 100, 1, "thermometer", "thermometer")
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
                1,
                "accelerometer",
                "accelerometer " + + ['X', 'Y', 'Z'][dim]
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
                "Pin " + pin.toString(),
                0,
                1,
                1,
                "pin_" + pin.toString(),
                "Pin " + pin.toString()
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
                1,
                "magnet",
                "S10"
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

            super(function () {return input.rotation(rot)}, name, 0, 100, 1, "right_turn", name)    
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
            super(function () {if(input.logoIsPressed()) {return 1} return 0}, "Logo Pressed", 0, 1, 1, "finger_press", "Logo Press")
        }
    }

    /**
     * Sensor for the current Compass Heading
     * Ranged between 0 and 360 degrees
     */
    export class CompassHeadingSensor extends Sensor {
        constructor() {
            super(function () {return input.compassHeading()}, "Compass", 0, 360, 1, "compass", "Compass")
        }
    }    

    /**
     * Sensor for the Microphone
     * Ranged between 0 and 255
     */
    export class VolumeSensor extends Sensor {
        constructor() {
            super(function () {return input.soundLevel()}, "Volume", 0, 255, 1, "speaker", "Volume")
        }
    }

    /**
     * Sensor for Microbit A & B Buttons
     * Need to be transformed into an event based system
     */
    export class ButtonPressSensor extends Sensor {
        constructor() {
            super(function () {return 1}, "Button Press", 0, 1, 1, "tile_button_a", "F3")

            control.onEvent(DAL.DEVICE_BUTTON_EVT_UP, DAL.DEVICE_ID_BUTTON_A, () => {
                return 1
            })
        }
    }
}