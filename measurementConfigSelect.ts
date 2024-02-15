namespace microcode {
    interface IDictionary {
        [index: string]: number;
    }
    const MAXIMUMS = {measurements: 1000, period: 10000} as IDictionary;

    export class MeasurementConfigSelect extends Scene {
        // Passed to DataRecorder:
        private userOpts: {sensorFn: () => number, sensorName: string}
        private measurementOpts: IDictionary
        private mode: string = "measurements"
        
        constructor(app: App, userOpts: {sensorFn: () => number, sensorName: string}) {
            super(app, "measurementConfigSelect")

            this.userOpts = userOpts;

            // Defaults:
            this.measurementOpts = {
                measurements: 20, 
                period: 1000
            }
        }

        /* override */ startup() {
            super.startup()

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.up.id,
                () => {
                    this.measurementOpts[this.mode] = (this.measurementOpts[this.mode] + 1) % MAXIMUMS[this.mode]
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.down.id,
                
                () => {
                    if (this.measurementOpts[this.mode] == 0) {
                        this.measurementOpts[this.mode] = 1000
                    } else {
                        this.measurementOpts[this.mode] = (this.measurementOpts[this.mode] - 1) % MAXIMUMS[this.mode]
                    }
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.right.id,
                () => {
                    this.measurementOpts[this.mode] = (this.measurementOpts[this.mode] + (MAXIMUMS[this.mode] / 100)) % MAXIMUMS[this.mode]
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.left.id,
                () => {
                    if (this.measurementOpts[this.mode] - 10 <= 0) {
                        this.measurementOpts[this.mode] = 1000
                    } else {
                        this.measurementOpts[this.mode] = (this.measurementOpts[this.mode] - (MAXIMUMS[this.mode] / 100)) % MAXIMUMS[this.mode]
                    }
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.B.id,
                () => {
                    app.popScene()
                    app.pushScene(new Home(app))
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.A.id,
                () => {
                    if (this.mode === "period") {
                        const userOpts = {
                            sensorFn: this.userOpts.sensorFn, 
                            sensorName: this.userOpts.sensorName,
                            measurements: this.measurementOpts.measurements,
                            period: this.measurementOpts.period
                        }

                        const dataRecorder = new DataRecorder(this.app, userOpts)
                        this.app.popScene()
                        this.app.pushScene(dataRecorder)   
                    }

                    else {
                        this.mode = "period"
                    }
                }
            )
        }

        /* override */ activate() {
            super.activate()
            this.color = 15
        }

        draw() {
            Screen.fillRect(
                Screen.LEFT_EDGE,
                Screen.TOP_EDGE,
                Screen.WIDTH,
                Screen.HEIGHT,
                0xc
            )
            
            if (this.mode === "period") {
                screen.printCenter("Measurement period", 20)
            }

            else if (this.mode === "measurements") {
                screen.printCenter("Number of measurements", 20)
            }

            let value = "" + this.measurementOpts[this.mode];
            const textOffset = (screen.width - (font.charWidth * value.length)) / 2

            Screen.print(
                value,
                Screen.LEFT_EDGE + textOffset,
                Screen.TOP_EDGE + (screen.height / 2),
                0xb,
                simage.font8
            )
            
            super.draw()
        }
    }
}