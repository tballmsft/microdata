namespace microcode {
    export type SensorOpts = {
        sensorFn: () => number, 
        sensorName: string,
    };

    const PLOT_SMOOTHING_CONSTANT = 8
    
    export abstract class Sensor {
        static BUFFER_LIMIT = 100;

        sensorFn: () => number
        name: string

        minimum: number
        maximum: number
        peakDataPoint: number[]

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
                const norm1 = ((this.dataBuffer[i] - this.minimum) / (this.maximum + Math.abs(this.minimum))) * (screen.height - fromY)
                const norm2 = ((this.dataBuffer[i + 1] - this.minimum) / (this.maximum + Math.abs(this.minimum))) * (screen.height - fromY)
                const y1 = Math.round(screen.height - norm1) - fromY
                const y2 = Math.round(screen.height - norm2) - fromY

                if (this.dataBuffer[i] > this.peakDataPoint[1]) {
                    this.peakDataPoint = [i, this.dataBuffer[i]]
                }

                // Minimal data smoothing:
                if (Math.abs(y1 - y2) <= PLOT_SMOOTHING_CONSTANT) {
                    screen.drawLine(fromX + i, y1, fromX + i - 1, y1, color);
                }

                screen.drawLine(fromX + i, y1, fromX + i - 1, y2, color);
            }
        }
    }

    export class LightSensor extends Sensor {
        constructor() {
            super(function () {return input.lightLevel()}, "Light", 0, 255, 1)
        }
    }

    export class TemperatureSensor extends Sensor {
        constructor() {
            super(function () {return input.temperature()}, "Temp.", 0, 100, 1)
        }
    }


    /**
     * sensorMinReading not implemented
     * sensorMaxReading not implemented
     */
    export class AccelerometerSensor extends Sensor {
        constructor(dim: Dimension) {
            super(function () {return input.acceleration(dim)}, "Accel.", -1023, 1023, 1)
        }
    }

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
     * sensorMinReading not implemented
     * sensorMaxReading not implemented
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
     * sensorMinReading may change in future
     * sensorMaxReading may change in future
     */
    export class LogoPressSensor extends Sensor {
        constructor() {
            super(function () {if(input.logoIsPressed()) {return 1} return 0}, "Logo Pressed", 0, 1, 1)
        }
    }

    export class CompassHeadingSensor extends Sensor {
        constructor() {
            super(function () {return input.compassHeading()}, "Compass", 0, 360, 1)
        }
    }    

    export class VolumeSensor extends Sensor {
        constructor() {
            super(function () {return input.soundLevel()}, "Volume", 0, 255, 1)
        }
    }

    /**
     * No access to the Microbit Buttons A & B; only the controller buttons A & B; it seems
     */
    export class ButtonPressSensor extends Sensor {
        constructor() {
            super(function () {return 1}, "Button Press", 0, 1, 1)

            control.onEvent(DAL.DEVICE_BUTTON_EVT_UP, DAL.DEVICE_ID_BUTTON_A, () => {
                basic.showIcon(IconNames.No)
            
            })
        }
    }
}