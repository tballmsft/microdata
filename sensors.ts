
namespace microcode {
    export type SensorOpts = {
        sensorFn: () => number, 
        sensorName: string,
    };  
    

    export interface Sensor {
        read(): number;
        normalise(): number;
        getName(): string;
    }


    export class LightSensor implements Sensor {
        private sensorFn: () => number
        private name: string

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

        getName() {
            return this.name
        }
    }

    export class TemperatureSensor implements Sensor {
        private sensorFn: () => number
        private name: string

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

        getName() {
            return this.name
        }
    }
}