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

            for (let i = 0; i < this.sensors.length - 1; i++) {
                const aSensor = this.sensors[i]
                const bSensor = this.sensors[(i + 1) % this.sensors.length]

                let aPeriod = EVENT_POLLING_PERIOD_MS
                let bPeriod = EVENT_POLLING_PERIOD_MS

                if (aSensor.loggingMode == SensorLoggingMode.RECORDING) {
                    aPeriod = (aSensor.config as RecordingConfig).period
                }

                if (bSensor.loggingMode == SensorLoggingMode.RECORDING) {
                    bPeriod = (bSensor.config as RecordingConfig).period
                }

                if (i == 0) {
                    this.sensorWaitTimes.push(aPeriod)
                }

                this.sensorWaitTimes.push(bPeriod - aPeriod)
            }

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


        log() {
            control.inBackground(() => {
                let loggingStates = this.sensors.map((_) => true)
                const loggingCompleteState = this.sensors.map((_) => false)

                // Log all sensors once:
                this.sensors.forEach((sensor) => sensor.log())
                let i = 0

                while (loggingStates[0] != loggingCompleteState[0]) {
                    const index = i % this.sensorWaitTimes.length
                    basic.pause(this.sensorWaitTimes[index]) // - this.sensors[index].lastReadingDelay)
                    loggingStates[index] = this.sensors[index].log()
                    i += 1
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