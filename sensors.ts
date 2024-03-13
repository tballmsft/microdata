namespace microcode {
    /**
     * Abstraction for all available sensors,
     * Methods are seldom overidden
     */
    export abstract class Sensor {
        static BUFFER_LIMIT = 100;
        static PLOT_SMOOTHING_CONSTANT = 8

        public sensorFn: () => number
        public name: string
        public minimum: number
        public maximum: number
        public peakDataPoint: number[]

        private numberOfDisplayModes: number;
        private currentDisplayMode: number;

        private dataBuffer: number[]

        constructor(sensorFn: () => number, 
            name: string,
            sensorMinReading: number,
            sensorMaxReading: number,
            numberOfDisplayModes: number
        ) {
            this.sensorFn = sensorFn
            this.name = name
            this.minimum = sensorMinReading
            this.maximum = sensorMaxReading
            this.numberOfDisplayModes = numberOfDisplayModes
            this.dataBuffer = []
            this.peakDataPoint = [0, this.minimum]
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
            super(function () {return input.lightLevel()}, "Light", 0, 255, 1)
        }
    }

    /**
     * Onboard Thermometer; ranged between 0 and 100
     */
    export class TemperatureSensor extends Sensor {
        constructor() {
            super(function () {return input.temperature()}, "Temp.", 0, 100, 1)
        }
    }


    /**
     * Onboard Accelerometer for X, Y, Z dimensions; ranged between -1023, 1023
     */
    export class AccelerometerSensor extends Sensor {
        constructor(dim: Dimension) {
            super(function () {return input.acceleration(dim)}, "Accel.", -1023, 1023, 1)
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
                1
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
                1
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

            super(function () {return input.rotation(rot)}, name, 0, 100, 1)    
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
            super(function () {if(input.logoIsPressed()) {return 1} return 0}, "Logo Pressed", 0, 1, 1)
        }
    }

    /**
     * Sensor for the current Compass Heading
     * Ranged between 0 and 360 degrees
     */
    export class CompassHeadingSensor extends Sensor {
        constructor() {
            super(function () {return input.compassHeading()}, "Compass", 0, 360, 1)
        }
    }    

    /**
     * Sensor for the Microphone
     * Ranged between 0 and 255
     */
    export class VolumeSensor extends Sensor {
        constructor() {
            super(function () {return input.soundLevel()}, "Volume", 0, 255, 1)
        }
    }

    /**
     * Sensor for Microbit A & B Buttons
     * Need to be transformed into an event based system
     */
    export class ButtonPressSensor extends Sensor {
        constructor() {
            super(function () {return 1}, "Button Press", 0, 1, 1)

            control.onEvent(DAL.DEVICE_BUTTON_EVT_UP, DAL.DEVICE_ID_BUTTON_A, () => {
                return 1
            })
        }
    }
}