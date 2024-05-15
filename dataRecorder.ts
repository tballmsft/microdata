namespace microcode {
    const MAX_SENSORS_ON_SCREEN: number = 5
    const SENSOR_BOX_COLORS: number[] = [2,3,4,6,7,9]

    export class DataRecorder extends Scene {
        private sensors: Sensor[]
        private sensorWaitTimes: number[]

        // UI:
        private currentSensorIndex: number
        private sensorIndexOffset: number
        private sensorBoxColor: number

        constructor(app: App, sensors: Sensor[]) {
            super(app, "dataRecorder")

            datalogger.setColumns([
                "Sensor",
                "Time (ms)",
                "Reading",
                "Event"
            ])

            this.sensors = sensors
            this.sensorWaitTimes = []
            this.sensorIndexOffset = 0
            this.currentSensorIndex = 0
            this.sensorBoxColor = 16

            /**
             * There are more efficient methods of intialising this.
             * It only occurs once and typically the number of sensors is small
             *      So the cost is minimal
             * But improvements are possible
             */

            // Order the sensors by period ascending - events have period of sensors.ts/EVENT_POLLING_PERIOD_MS
            this.sensors.sort((a, b) => {
                let aPeriod = EVENT_POLLING_PERIOD_MS
                let bPeriod = EVENT_POLLING_PERIOD_MS

                if (a.loggingMode == SensorLoggingMode.RECORDING) {
                    const config: RecordingConfig = a.config as RecordingConfig;
                    aPeriod = config.period
                }

                if (b.loggingMode == SensorLoggingMode.RECORDING) {
                    const config: RecordingConfig = b.config as RecordingConfig;
                    bPeriod = config.period
                }
                return aPeriod - bPeriod;
            })

            this.sensorWaitTimes = this.sensors.map((sensor) => {
                if (sensor.loggingMode == SensorLoggingMode.RECORDING) {
                    return (sensor.config as RecordingConfig).period
                }

                else {
                    return EVENT_POLLING_PERIOD_MS
                }
            })

            //---------------
            // User Controls:
            //---------------

            // Go Back:
            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.B.id,
                () => {
                    this.app.popScene()
                    this.app.pushScene(new Home(this.app))
                }
            )

            // Scroll Up
            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.up.id,
                () => {
                    this.currentSensorIndex = Math.max(0, this.currentSensorIndex - 1)

                    if (this.sensorIndexOffset > 0) {
                        this.sensorIndexOffset = Math.max(0, this.sensorIndexOffset - 1)
                    }
                    
                    this.update()
                }
            )

            // Scroll Down
            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.down.id,
                () => {
                    this.currentSensorIndex = Math.min(this.currentSensorIndex + 1, this.sensors.length - 1)

                    if (this.currentSensorIndex > 4) {
                        this.sensorIndexOffset = Math.min(this.sensorIndexOffset + 1, this.sensors.length - 5)
                    }

                    this.update()
                }
            )

            this.log()
        }
 

        /**
         * Schedules the sensors and orders them to .log()
         */
        log() {
            // Number of times you call log given timeUntilNext
            // Upon modulus zero,
            // Pause for remainder of time in addition to timeUntilNext
            // log
            // Pause for offset to return to timeUntilNext

            control.inBackground(() => {
                let loggingStates = this.sensors.map((_) => true)
                let remainingSensorCount = this.sensors.length

                // [1000, 1100] will have a period gap of 100, so after waiting 100ms to measure, wait 900ms to account for this
                // If this happens then do not wait the normal period of 1000ms durring each round (since 100ms + 900ms = 1000ms)
                let periodAlreadyCounted = false
                let timePassed = 0
                let loops = 1

                // Log all sensors once:
                for (let i = 0; i < this.sensors.length; i++) {
                    loggingStates[i] = this.sensors[i].log()

                    // Some sensors may only have 1 measurement:
                    if (!loggingStates[i]) {
                        remainingSensorCount -= 1
                    }
                }
                // The below algorithm will wait for additional times to resolve non-modulos:
                // Waiting 3 seconds after the 11th measurement (measure once at 0) for sensors of period [100, 1003] for example
                // Is modified only if there is 1 sensor remaining
                let timeUntilNextLog = this.sensorWaitTimes[0] // Acts as the scheduling period

                // Some sensors still have more measurements:
                while (remainingSensorCount > 0) {
                    // One loop through all sensors:
                    for (let i = 0; i < this.sensors.length; i++) {
                        // Compile a list of the sensors that need to be logged next:
                        let sensorsToLog = [];
                        let indexOfLoggedSensor = [];
                        for (let j = 0; j < this.sensors.length; j++) {
                            if ((timePassed + timeUntilNextLog) % this.sensorWaitTimes[j] == 0) {
                                if (loggingStates[j]) {
                                    sensorsToLog.push(this.sensors[j]);
                                    indexOfLoggedSensor.push(j);
                                }
                            }
                        }

                        // Wait if there wasn't a period gap last time (and thus the period is already accounted for):
                        if (!periodAlreadyCounted) {
                            timePassed += timeUntilNextLog;
                            basic.pause(timeUntilNextLog)
                        }

                        // Resolve logging:
                        for (let j = 0; j < sensorsToLog.length; j++) {
                            const measurementsRemaining = sensorsToLog[j].log();
                            loggingStates[indexOfLoggedSensor[j]] = measurementsRemaining
                            if (!measurementsRemaining) {
                                remainingSensorCount -= 1

                                // Last remaining sensor: so set the scheduling period to this one:
                                if (remainingSensorCount == 1) {
                                    timeUntilNextLog = this.sensorWaitTimes[indexOfLoggedSensor[j]]
                                }
                            }
                        }

                        // The last logged sensor is neccessarily modulo with timePassed:
                        let indexOfLastLoggedSensor = indexOfLoggedSensor.pop();
                        if (indexOfLastLoggedSensor == undefined) {
                            indexOfLastLoggedSensor = i;
                        }

                        /**
                         * The difference in period between the next sensors may be lower than timeUntilNextLog
                         * This can occur for a sequence of senors, for example:
                         *      timeUntilNextLog = 100, periods = [100, 1003, 1006, 1009]: the period gap for each of [1003, 1006, 1009] < 100
                        */
                        let totalIntraTimePassed = 0
                        periodAlreadyCounted = false
                        for (let k = indexOfLastLoggedSensor + 1; k < this.sensors.length; k++) {
                            const currentSensorPeriod = loops * this.sensorWaitTimes[k]

                            // Period gap too small:
                            if (timePassed + timeUntilNextLog > currentSensorPeriod) {
                                totalIntraTimePassed += this.sensorWaitTimes[k] - timeUntilNextLog;
                                timePassed += totalIntraTimePassed;
                                    
                                // Compile a list of the sensors that need to be logged next:
                                let sensorsToLog = [];
                                let indexOfLoggedSensor = [];
                                for (let j = k; j < this.sensors.length; j++) {
                                    if (loggingStates[j] && currentSensorPeriod == (loops * this.sensorWaitTimes[j])) {
                                        sensorsToLog.push(this.sensors[j]);
                                        indexOfLoggedSensor.push(j);
                                    }
                                    else {
                                        break
                                    }
                                }

                                // Period gap between the normal logging period and this one:
                                basic.pause(this.sensorWaitTimes[k] - timeUntilNextLog);

                                // Invoke the logs:
                                for (let j = 0; j < sensorsToLog.length; j++) {
                                    const measurementsRemaining = sensorsToLog[j].log();
                                    loggingStates[indexOfLoggedSensor[j]] = measurementsRemaining
                                    if (!measurementsRemaining) {
                                        remainingSensorCount -= 1
                                        
                                        // Last remaining sensor: so set the scheduling period to this one:
                                        if (remainingSensorCount == 1) {
                                            timeUntilNextLog = this.sensorWaitTimes[k]
                                        }
                                    }
                                }
                            }

                            else {
                                break;
                            }

                            // Account for the difference between the totalIntraTimePassed and the timeUntilNextLog
                            // [1000, 1100] will have a totalIntraTimePassed of 100, so after waiting 100ms to measure, wait 900ms to account for this
                            timePassed += timeUntilNextLog - totalIntraTimePassed
                            basic.pause(timeUntilNextLog - totalIntraTimePassed)
                            periodAlreadyCounted = true // Don't basic.pause(timeUntilNextLog) next time - since its accounted for here
                            loops += 1
                        }
                    }

                    // Reset after one loop: avoids need for modulus logic
                    timePassed = timeUntilNextLog
                    loops = 1
                }
            })
        }

        update(): void {
            Screen.fillRect(
                Screen.LEFT_EDGE,
                Screen.TOP_EDGE,
                Screen.WIDTH,
                Screen.HEIGHT,
                0xc
            )


            // Check if all sensors have finished their work:
            let recordingsComplete = true
            for (let i = 0; i < this.sensors.length; i++) {
                if (this.sensors[i].config.measurements > 0) {
                    recordingsComplete = false
                    break
                }
            }

            if (recordingsComplete) {
                screen.printCenter("Data Logging Complete.", (screen.height / 2) - 10);
                screen.printCenter("Press B to back out.", screen.height / 2);
            }

            else {
                screen.printCenter("Recording data...", 4);
                let y = 16

                for (let i = this.sensorIndexOffset; i < this.sensors.length; i++) {
                    if (i - this.sensorIndexOffset > MAX_SENSORS_ON_SCREEN) {
                        break
                    }
                    
                    // Get the colour for this box
                    this.sensorBoxColor = SENSOR_BOX_COLORS[i % SENSOR_BOX_COLORS.length]

                    if (i != this.currentSensorIndex) {
                        screen.fillRect(
                            5,
                            y,
                            142,
                            16,
                            16
                        )
                        
                        screen.fillRect(
                            7,
                            y,
                            145,
                            14,
                            this.sensorBoxColor
                        )

                        screen.print(
                            this.sensors[i].name,
                            12,
                            y + 2,
                            15
                        )
                    }

                    else {
                        screen.fillRect(
                            5,
                            y,
                            142,
                            47,
                            16
                        )

                        screen.fillRect(
                            7,
                            y,
                            145,
                            45,
                            this.sensorBoxColor
                        )

                        const sensor = this.sensors[i]
                        screen.print(
                            sensor.name,
                            12,
                            y + 2,
                            15
                        )

                        let sensorInfo: string[]
                        if (sensor.loggingMode == SensorLoggingMode.RECORDING) {
                            const config = sensor.config as RecordingConfig
                            sensorInfo = [
                                config.period / 1000 + " second period", 
                                config.measurements.toString() + " measurements left",
                                ((sensor.config.measurements * config.period) / 1000).toString() + " seconds left"
                            ]
                        }

                        else {
                            const config = sensor.config as EventConfig
                            sensorInfo = [
                                config.measurements.toString() + " events left",
                                "Logging " + config.inequality + " " + config.comparator + " events",
                                sensor.lastLoggedEventDescription
                            ]
                        }

                        sensorInfo.forEach((info) => {
                            y += 12
                            screen.print(
                                info,
                                24,
                                y,
                                15
                            )
                        });
                    }

                    y += 14
                }
            }
        }
    }
}