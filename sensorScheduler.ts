namespace microcode {
    export class SensorScheduler {
        /** Ordered sensor periods */
        private schedule: {sensor: Sensor, waitTime: number}[];
        private sensors: Sensor[];
        private sensorWithMostTimeLeft: Sensor

        /** Should the information from the sensorWithMostTimeLeft be shown on the basic's 5x5 LED matrix? */
        private showOnBasicScreen: boolean = false;

        constructor(sensors: Sensor[], showOnBasicScreen?: boolean) {
            this.schedule = []
            this.sensors = sensors

            if (showOnBasicScreen != null)
                this.showOnBasicScreen = showOnBasicScreen

            // Get the sensor that will take the longest to complete:
            // The number of measurements this sensor has left is displayed on the microbit 5x5 led grid; when the Arcade Shield is not connected.
            this.sensorWithMostTimeLeft = sensors[0]
            let mostTimeLeft = this.sensorWithMostTimeLeft.totalMeasurements * this.sensorWithMostTimeLeft.getPeriod()
            this.sensors.forEach(sensor => {
                if ((sensor.totalMeasurements * sensor.getPeriod()) > mostTimeLeft) {
                    mostTimeLeft = sensor.totalMeasurements * sensor.getPeriod()
                    this.sensorWithMostTimeLeft = sensor
                }
            })

            // Setup schedule so that periods are in order ascending
            sensors.sort((a, b) => a.getPeriod() - b.getPeriod())
            this.schedule = sensors.map((sensor) => {return {sensor, waitTime: sensor.getPeriod()}})
        }


        loggingComplete(): boolean {return !(this.schedule.length > 0)}


        /**
         * Schedules the sensors and orders them to .log()
         * Runs within a separate fiber.
         * Mutates this.schedule
        */
        start(callbackObj?: ITargetDataLoggedCallback) {
            const callbackAfterLog: boolean = (callbackObj == null) ? false : true
            
            control.inBackground(() => {
                let currentTime = 0;

                // Log all sensors once:
                for (let i = 0; i < this.schedule.length; i++) {
                    if (this.showOnBasicScreen && this.schedule[i].sensor == this.sensorWithMostTimeLeft)
                        basic.showNumber(this.sensorWithMostTimeLeft.getMeasurements())

                    // Make the datalogger log the data:
                    const logAsCSV = this.schedule[i].sensor.log(0)
                    if (callbackAfterLog)
                        callbackObj.callback(logAsCSV)

                    // Clear from schedule (A sensor may only have 1 reading):
                    if (!this.schedule[i].sensor.hasMeasurements())
                        this.schedule.splice(i, 1);
                }

                let lastLogTime = input.runningTime()

                while (this.schedule.length > 0) {
                    const nextLogTime = this.schedule[0].waitTime;
                    const sleepTime = nextLogTime - currentTime;

                    basic.pause(sleepTime + lastLogTime - input.runningTime()) // Discount for operation time
                    lastLogTime = input.runningTime()
                    currentTime += sleepTime

                    for (let i = 0; i < this.schedule.length; i++) {
                        // Clear from schedule:
                        if (!this.schedule[i].sensor.hasMeasurements()) {
                            this.schedule.splice(i, 1);
                        }

                        // Log sensors:
                        else if (currentTime % this.schedule[i].waitTime == 0) {
                            if (this.showOnBasicScreen && this.schedule[i].sensor == this.sensorWithMostTimeLeft)
                                basic.showNumber(this.sensorWithMostTimeLeft.getMeasurements())

                            // Make the datalogger log the data:
                            const logAsCSV = this.schedule[i].sensor.log(currentTime)
                            if (callbackAfterLog)
                                callbackObj.callback(logAsCSV)

                            // Update schedule with when they should next be logged:
                            if (this.schedule[i].sensor.hasMeasurements()) {
                                this.schedule[i].waitTime = nextLogTime + this.schedule[i].sensor.getPeriod()
                            }
                        }
                    }

                    // Ensure the schedule remains ordely after these potential deletions & recalculations:
                    this.schedule.sort((
                        a: {sensor: Sensor; waitTime: number;}, 
                        b: {sensor: Sensor; waitTime: number;}) =>
                        a.waitTime - b.waitTime
                    )
                }

                // Done:
                if (this.showOnBasicScreen) {
                    basic.showLeds(`
                        . # . # .
                        . # . # .
                        . . . . .
                        # . . . #
                        . # # # .
                    `)
                }
            })
        }
    }
}