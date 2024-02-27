namespace microcode {
    export type SensorOpts = {
        sensorFn: () => number, 
        sensorName: string,
    };
    
    export abstract class Sensor {
        private static BUFFER_LIMIT = 100;

        sensorFn: () => number
        name: string

        sensorMinReading: number
        sensorMaxReading: number

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
            this.sensorMinReading = sensorMinReading
            this.sensorMaxReading = sensorMaxReading
            this.numberOfDisplayModes = numberOfDisplayModes
            this.dataBuffer = []
        }

        cycleDisplayMode() {
            this.currentDisplayMode = (this.currentDisplayMode + 1) % this.numberOfDisplayModes
        }

        getReading(): number {
            return this.sensorFn()
        }

        getNormalisedReading(): number{
            return this.sensorFn() / this.sensorMaxReading
        }

        readIntoBuffer(): void {
            if (this.dataBuffer.length >= Sensor.BUFFER_LIMIT) {
                this.dataBuffer.shift();
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
                const y1 = Math.round(screen.height - ((this.dataBuffer[i] / this.sensorMaxReading) * (screen.height - fromY))) - fromY
                const y2 = Math.round(screen.height - ((this.dataBuffer[i + 1] / this.sensorMaxReading) * (screen.height - fromY))) - fromY

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
            super(function () {return input.temperature()}, "Temperature", 0, 100, 1)
        }
    }


    /**
     * sensorMinReading not implemented
     * sensorMaxReading not implemented
     */
    export class AccelerometerSensor extends Sensor {
        constructor(dim: Dimension) {
            super(function () {return input.acceleration(dim)}, "Accelerometer", 0, 100, 1)
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
                "pin",
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
}