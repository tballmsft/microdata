namespace microcode {
    interface IDictionary {
        [index: string]: number;
   }
   const MAXIMUMS = {measurements: 1000, frequency: 10000} as IDictionary;

    export class FrequencySelect extends Scene {
        // Passed to DataRecorder:
        private userOpts: {sensorFn: () => number, sensorName: string}
        private frequencySelectOptions: IDictionary
        private mode: string = "measurements"
        
        constructor(app: App, userOpts: {sensorFn: () => number, sensorName: string}) {
            super(app, "frequencySelect")

            this.userOpts = userOpts;

            // Defaults:
            this.frequencySelectOptions = {
                measurements: 20, 
                frequency: 1000
            }
        }

        /* override */ startup() {
            super.startup()
            const mode: string = this.mode

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.up.id,
                () => {
                    this.frequencySelectOptions[this.mode] = (this.frequencySelectOptions[mode] + 1) % MAXIMUMS[mode]
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.down.id,
                
                () => {
                    if (this.frequencySelectOptions[mode] == 0) {
                        this.frequencySelectOptions[mode] = 1000
                    } else {
                        this.frequencySelectOptions[mode] = (this.frequencySelectOptions[mode] - 1) % MAXIMUMS[mode]
                    }
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.right.id,
                () => {
                    this.frequencySelectOptions[mode] = (this.frequencySelectOptions[mode] + 10) % MAXIMUMS[this.mode]
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.left.id,
                () => {
                    if (this.frequencySelectOptions[mode] - 10 <= 0) {
                        this.frequencySelectOptions[mode] = 1000
                    } else {
                        this.frequencySelectOptions[mode] = (this.frequencySelectOptions[mode] - 10) % MAXIMUMS[this.mode]
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
                    if (this.mode === "frequency") {
                        const userOpts = {
                            sensorFn: this.userOpts.sensorFn, 
                            sensorName: this.userOpts.sensorName,
                            measurements: this.frequencySelectOptions.measurements,
                            frequency: this.frequencySelectOptions.frequency
                        }
                        this.app.pushScene(new DataRecorder(this.app, userOpts))
                    }

                    else {
                        this.mode = "frequency"
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

            let valueAsString = "";
            
            if (this.mode === "frequency") {
                valueAsString = "" + this.frequencySelectOptions[this.mode]
                screen.printCenter("Measurement frequency", 10)
            }

            else if (this.mode === "measurements") {
                valueAsString = "" + this.frequencySelectOptions[this.mode]
                screen.printCenter("Number of measurements", 10)
            }

            const textOffset = (screen.width - (font.charWidth * valueAsString.length)) / 2

            Screen.print(
                valueAsString,
                Screen.LEFT_EDGE + textOffset,
                Screen.TOP_EDGE + (screen.height / 2),
                0xb,
                simage.font12
            )
            
            super.draw()
        }
    }
}