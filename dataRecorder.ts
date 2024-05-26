namespace microcode {
    /** Number of sensor information boxes that can fit onto the screen at once*/
    const MAX_SENSORS_ON_SCREEN: number = 5
    /** The colours that will be used for the lines & sensor information boxes */
    const SENSOR_BOX_COLORS: number[] = [2,3,4,6,7,9]

    /**
     * Responsible for invoking the logging commands for each sensor,
     * Presents information about each sensor's state via colourful collapsing boxes
     * 
     * Sensors are now logged via a scheduler
     */
    export class DataRecorder extends Scene {
        /** Ordered sensor periods */
        private schedule: {sensor: Sensor, waitTime: number}[];
        private numberOfSensors: number;

        // private actions: string[]

        // UI:
        private sensors: Sensor[]
        /** Sensor to be shown */
        private currentSensorIndex: number
        /** Last sensor on the screen */
        private sensorIndexOffset: number
        /** For the currentSensorIndex */
        private sensorBoxColor: number

        constructor(app: App, sensors: Sensor[]) {
            super(app, "dataRecorder")

            this.schedule = []
            this.numberOfSensors = sensors.length
            // this.actions = []

            this.sensors = sensors
            this.sensorIndexOffset = 0
            this.currentSensorIndex = 0
            this.sensorBoxColor = 15

            /**
             * There are more efficient methods of intialising this.
             * It only occurs once and typically the number of sensors is small
             *      So the cost is minimal
             * But improvements are possible
             */

            sensors.sort((a, b) => a.getPeriod() - b.getPeriod())
            this.schedule = sensors.map((sensor) => {return {sensor, waitTime: sensor.getPeriod()}})

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

            // Clear whatever A was previously bound to
            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.A.id,
                () => {}
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
                    this.currentSensorIndex = Math.min(this.currentSensorIndex + 1, this.numberOfSensors - 1)

                    if (this.currentSensorIndex > 4) {
                        this.sensorIndexOffset = Math.min(this.sensorIndexOffset + 1, this.numberOfSensors - 5)
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
            control.inBackground(() => {
                let currentTime = 0;

                while (this.schedule.length > 0) {
                    const nextLogTime = this.schedule[0].waitTime;
                    const sleepTime = nextLogTime - currentTime;

                    basic.pause(sleepTime)
                    currentTime += sleepTime

                    for (let i = 0; i < this.schedule.length; i++) {
                        // Clear from schedule:
                        if (!this.schedule[i].sensor.hasMeasurements()) {
                            this.schedule.splice(i, 1);
                        }

                        // Log sensors:
                        else if (currentTime % this.schedule[i].waitTime == 0) {
                            this.schedule[i].sensor.log()

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
            let recordingsComplete = !(this.schedule.length > 0)

            // for (let i = 0; i < this.actions.length; i++) {
            //     screen.printCenter(this.actions[i], i * 10)
            // }

            if (recordingsComplete) {
                screen.printCenter("Data Logging Complete.", (screen.height / 2) - 10);
                screen.printCenter("Press B to back out.", screen.height / 2);
            }

            else {
                screen.printCenter("Recording data...", 4);
                let y = 16

                for (let i = this.sensorIndexOffset; i < this.numberOfSensors; i++) {
                    if (i - this.sensorIndexOffset > MAX_SENSORS_ON_SCREEN) {
                        break
                    }
                    
                    // Get the colour for this box
                    this.sensorBoxColor = SENSOR_BOX_COLORS[i % SENSOR_BOX_COLORS.length]

                    // Draw box as collapsed:
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

                    // Box is selected: Draw all information:
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

                        //-------------------------------
                        // Information inside sensor box:
                        //-------------------------------

                        const sensor = this.sensors[i]
                        screen.print(
                            sensor.name,
                            12,
                            y + 2,
                            15
                        )

                        // Sensors have different information to display depending on their mode
                        // Build up the information in an array:
                        let sensorInfo: string[]
                        if (sensor.isInEventMode) {
                            sensorInfo = [
                                sensor.config.measurements.toString() + " events left",
                                "Logging " + sensor.config.inequality + " " + sensor.config.comparator + " events",
                                sensor.lastLoggedEventDescription
                            ]
                        }

                        else {
                            sensorInfo = [
                                sensor.getPeriod() / 1000 + " second period", 
                                sensor.config.measurements.toString() + " measurements left",
                                ((sensor.config.measurements * sensor.getPeriod()) / 1000).toString() + " seconds left"
                            ]
                        }

                        
                        //------------------------------
                        // Write the sensor information:
                        //------------------------------

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