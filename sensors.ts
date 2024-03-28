namespace microcode {
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
        public config: RecordingConfig

        // Reading Statistics:
        public minimum: number
        public maximum: number
        public peakDataPoint: number[]

        private dataBuffer: number[]
        private startTime: number

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

            this.minimum = sensorMinReading
            this.maximum = sensorMaxReading
            this.peakDataPoint = [0, this.minimum] // [x, y]

            this.dataBuffer = []
            this.startTime = 0 // This value will be set upon the first reading

            this.config = config
        }

        getBufferSize(): number {return this.dataBuffer.length}
        getReading(): number {return this.sensorFn()}
        getNthReading(n: number): number {return this.dataBuffer[n]}
        getDataBufferLength(): number {return this.dataBuffer.length}
        getNormalisedReading(): number{return this.sensorFn() / this.maximum}

        readIntoBuffer(): void {
            if (this.dataBuffer.length >= Sensor.BUFFER_LIMIT) {
                this.dataBuffer.shift();
                this.peakDataPoint[0] -= 1
            }
            this.dataBuffer.push(this.getReading());
        }

        log(dataRecorder: DataRecorder) {
            control.inBackground(() => {
                if (this.startTime == 0) {
                    this.startTime = input.runningTime()
                }

                while (this.config.measurements > 0)  {
                    FauxDataLogger.log([
                        this.name, 
                        (input.runningTime() - this.startTime).toString(),
                        this.getReading().toString(),
                        "N/A"
                    ])
                    
                    this.config.measurements -= 1
                    basic.pause(this.config.period)

                    // Update the screen
                    // dataRecorder.update()
                }
            })
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
        constructor(config: RecordingConfig) {
            super(function () {return input.lightLevel()}, "Light", 0, 255, "led_light_sensor", "led_light_sensor", config)
        }
    }

    /**
     * Onboard Thermometer; ranged between 0 and 100
     */
    export class TemperatureSensor extends Sensor {
        constructor(config: RecordingConfig) {
            super(function () {return input.temperature()}, "Temp.", 0, 100, "thermometer", "thermometer", config)
        }
    }


    /**
     * Onboard Accelerometer for X, Y, Z dimensions; ranged between -1023, 1023
     */
    export class AccelerometerSensor extends Sensor {
        constructor(dim: Dimension, config: RecordingConfig) {
            super(function () {return input.acceleration(dim)}, 
                "Accel. " + ['X', 'Y', 'Z'][dim], 
                -1023, 
                1023, 
                "accelerometer",
                "accelerometer " + + ['X', 'Y', 'Z'][dim],
                config
            )
        }
    }

    /**
     * Onboard Touch Pin Sensor for TouchPin 0, 1, 2; ranged between 0 and 1
     */
    export class PinSensor extends Sensor {
        constructor(pin: TouchPin, config: RecordingConfig) {
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
                "pin_" + pin.toString(),
                "Pin " + pin.toString(),
                config
            )
        }
    }


    /**
     * Onboard Magnometer for X, Y, Z dimensions
     * 
     * MIN & MAX RANGE UNVERIFIED
     */
    export class MagnetSensor extends Sensor {
        constructor(dim: Dimension, config: RecordingConfig) {
            super(function() {return input.magneticForce(dim)},
                "Magnet " + dim.toString(),
                0,
                1,
                "magnet",
                "S10",
                config
            )
        }
    }


    /**
     * Onboard Pitch or Roll sensor
     * 
     * MIN & MAX RANGE UNVERIFIED
     */
    export class RotationSensor extends Sensor {
        constructor(rot: Rotation, config: RecordingConfig) {
            let name: string = "Pitch"

            if (rot === Rotation.Roll) {
                name = "Roll"
            }

            super(function () {return input.rotation(rot)}, name, 0, 100, "right_turn", name, config)    
        }
    }

    /**
     * Detection of whether of not the Logo has been pressed
     * 
     * sensorMinReading may change in future
     * sensorMaxReading may change in future
     */
    export class LogoPressSensor extends Sensor {
        constructor(config: RecordingConfig) {
            super(
                function () {if(input.logoIsPressed()) {return 1} return 0}, 
                "Logo Pressed", 
                0,
                1, 
                "finger_press", 
                "Logo Press", 
                config
            )
        }
    }

    /**
     * Sensor for the current Compass Heading
     * Ranged between 0 and 360 degrees
     */
    export class CompassHeadingSensor extends Sensor {
        constructor(config: RecordingConfig) {
            super(
                function () {return input.compassHeading()}, 
                "Compass", 
                0, 
                360, 
                "compass", 
                "Compass",
                config
            )
        }
    }    

    /**
     * Sensor for the Microphone
     * Ranged between 0 and 255
     */
    export class VolumeSensor extends Sensor {
        constructor(config: RecordingConfig) {
            super(
                function () {return input.soundLevel()}, 
                "Volume", 
                0, 
                255, 
                "speaker", 
                "Volume", 
                config
            )
        }
    }

    /**
     * Sensor for Microbit A & B Buttons
     * Need to be transformed into an event based system
     */
    export class ButtonPressSensor extends Sensor {
        constructor(config: RecordingConfig) {
            super(function () {return 1}, "Button ", 0, 1, "tile_button_a", "F3", config)

            control.onEvent(DAL.DEVICE_BUTTON_EVT_UP, DAL.DEVICE_ID_BUTTON_A, () => {
                return 1
            })
        }
    }
}