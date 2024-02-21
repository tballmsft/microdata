
namespace microcode {
    export type SensorOpts = {
        sensorFn: () => number, 
        sensorName: string,
    };  
    
    export interface Sensor {
        read(): number;
        normalise(): number;
        getName(): string;
        getFn(): () => number
    }

    export class LightSensor implements Sensor {
        sensorFn: () => number
        name: string

        constructor() {
            this.sensorFn = function () {return input.lightLevel()}
            this.name = "Light"
        }

        read(): number {
            return this.sensorFn()
        }

        normalise(): number {
            return this.sensorFn() / 255
        }

        getName() {return this.name}
        getFn() {return this.sensorFn}
    }

    export class TemperatureSensor implements Sensor {
        sensorFn: () => number
        name: string

        constructor() {
            this.sensorFn = function () {return input.temperature()}
            this.name = "Temperature"
        }

        read(): number {
            return this.sensorFn()
        }

        normalise(): number {
            return this.sensorFn() / 100
        }

        getName() {return this.name}
        getFn() {return this.sensorFn}
    }


    export class Pins implements Sensor {
        sensorFn: () => number
        name: string

        constructor(pin: TouchPin) {
            this.sensorFn = function () {
                let res: number = 0
                input.onPinPressed(pin, function () {
                    res = 1
                })
                return res
            }
            this.name = "pin"
        }

        read(): number {
            return this.sensorFn()
        }

        normalise(): number {
            return this.sensorFn()
        }

        getName() {return this.name}
        getFn() {return this.sensorFn}
    }
}