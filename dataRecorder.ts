namespace microcode {
    export enum RecordingMode {
        EVENT,
        TIME
    }

    export class DataRecorder extends Scene {
        /** State pattern; see the internal classes that implement these behaviours below this file */
        private recordingBehaviour: RecordingBehaviour

        constructor(app: App, measurementOpts: RecordingConfig, sensors: Sensor[], recordingMode: RecordingMode) {
            super(app, "dataRecorder")

            
            let headers: string[] = ["Milli-Sec"]
            sensors.forEach(function(sensor) {
                headers.push(sensor.name)
            })

            new FauxDataLogger(headers, measurementOpts, sensors)


            // Get the specified behaviour from the passed RecordingMode Enum:
            if (recordingMode === RecordingMode.TIME) {
                this.recordingBehaviour = new TimeBasedRecording(measurementOpts, sensors)
            }

            else {
                this.recordingBehaviour = new EventBasedRecording()
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
        }

        update() {
            Screen.fillRect(
                Screen.LEFT_EDGE,
                Screen.TOP_EDGE,
                Screen.WIDTH,
                Screen.HEIGHT,
                0xc
            )

            this.recordingBehaviour.update()
        }
    }

    
    //-------------------------------------
    // Recording behaviour implementations:
    //-------------------------------------

    interface RecordingBehaviour {
        update(): void;
    }

    /**
     * A public recording behaviour.
     *      This 
     */
    export class EventBasedRecording implements RecordingBehaviour {
        update(): void {
            
        }
    }


    /**
     * Take N recordings on each of the passed sensors with the specified period,
     *      Makes use of the static FauxDataLogger that was setup in the parent constructor DataRecorder
     * Internal Class unlike EventBasedRecording, since this class is only ever invoked via the DataRecorder
     */
    class TimeBasedRecording implements RecordingBehaviour {
        private loggingStartTime: number
        private measurementOpts: RecordingConfig
        private sensors: Sensor[]

        constructor(measurementOpts: RecordingConfig, sensors: Sensor[]) {
            let headers: string[] = ["Milli-Sec"]
            sensors.forEach(function(sensor) {
                headers.push(sensor.name)
            })

            this.loggingStartTime = input.runningTime()
            this.measurementOpts = measurementOpts
            this.sensors = sensors
        }

        update(): void {
            if (this.measurementOpts.measurements === 0) {
                screen.printCenter("Data Logging Complete.", (screen.height / 2) - 10);
                screen.printCenter("Press B to back out.", screen.height / 2);
            }

            else if (this.measurementOpts.delay > 0) {
                screen.printCenter("Data logger starting in", (screen.height / 2) - 10);
                screen.printCenter(this.measurementOpts.delay + " seconds...", screen.height / 2)
                this.measurementOpts.delay -= 1

                basic.pause(1000)
            }

            else {
                const secondsLeft: number = (this.measurementOpts.measurements * this.measurementOpts.period) / 1000
                screen.printCenter("Recording data...", 10);

                screen.printCenter(this.measurementOpts.period / 1000 + " second period", 45)   
                screen.printCenter(this.measurementOpts.measurements.toString() + " measurements left", 65);
                screen.printCenter(secondsLeft.toString() + " seconds left", 85);

                // datalogger.log(datalogger.createCV("col1", "hello"))

                let data: string[] = [(input.runningTime() - this.loggingStartTime).toString()]

                // Collect the data to log:
                for (let i = 0; i < this.sensors.length; i++) {
                    data.push(this.sensors[i].getReading().toString())
                }

                FauxDataLogger.log(data)

                this.measurementOpts.measurements -= 1
                basic.pause(this.measurementOpts.period)
            }
        }
    }
}