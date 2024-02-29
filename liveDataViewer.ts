namespace microcode {
    const WIDTH_BUFFER = 16;
    const HEIGHT_BUFFER = 12;

    enum GUI_STATE {
        PLOTTING,
        SENSOR_INFORMATION
    }


    /**
     * One of the 3 main functionalities of MicroData
     * Allows for the live feed of a sensor to be plotted,
     *      Multiple sensors may be plotted at once
     *      Display modes may be toggled per sensor
     */
    export class LiveDataViewer extends Scene {
        private dataBuffers: number[][];
        private guiState: GUI_STATE

        // For axis:
        private xUnit: number
        private yUnit: number

        private sensors: Sensor[]

        constructor(app: App, sensors: Sensor[]) {
            super(app, "liveDataViewer")
            this.color = 0
            this.guiState = GUI_STATE.PLOTTING
            this.sensors = sensors

            this.xUnit = 10
            this.yUnit = 10

            this.dataBuffers = []
            for (let i = 0; i < this.sensors.length; i++) {
                this.dataBuffers.push([])
            }

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
                controller.up.id,
                () => {
                    if (this.guiState === GUI_STATE.PLOTTING) {
                        this.guiState = GUI_STATE.SENSOR_INFORMATION
                    }
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.down.id,
                () => {
                    if (this.guiState === GUI_STATE.SENSOR_INFORMATION) {
                        this.guiState = GUI_STATE.PLOTTING
                    }
                }
            )
        }

        update() {
            screen.fill(this.color);

            if (this.guiState === GUI_STATE.SENSOR_INFORMATION) {
                screen.printCenter("Press DOWN for plot", 110)

                let colour = 8;

                for (let i = 0; i < this.sensors.length; i++) {
                    screen.print(this.sensors[i].name + " as", 10, 25 + (i * 20))
                    screen.fillRect(
                        130,
                        25 + (i * 20),
                        10,
                        10,
                        colour
                    )
                    colour = (colour + 1) % 15
                }
            }

            else {
                this.sensors.forEach(function(sensor) {
                    sensor.readIntoBuffer()
                })

                // Draw:
                this.plot()

                basic.pause(100);
            }
        }


        draw_grid() {
            for (let colOffset = 0; colOffset <= Screen.WIDTH; colOffset+=this.yUnit) {
                Screen.drawLine(
                    Screen.LEFT_EDGE + colOffset,
                    Screen.TOP_EDGE,
                    Screen.LEFT_EDGE + colOffset,
                    Screen.HEIGHT,
                    0x0
                )
            }

            for (let rowOffset = 0; rowOffset <= Screen.HEIGHT; rowOffset+=this.xUnit) {
                Screen.drawLine(
                    Screen.LEFT_EDGE,
                    Screen.TOP_EDGE + rowOffset,
                    Screen.WIDTH,
                    Screen.TOP_EDGE + rowOffset,
                    0x0
                )
            }
        }


        /**
         * Display mode for plotting all incoming data on y axis
         * Presumes pre-processed this.dataBuffers; y values relative to screen.height
         * Bound to Microbit button A
         */
        private plot() {
            screen.printCenter("Press UP for info", 5)
            this.draw_axes();

            let colour = 8;

            this.sensors.forEach(function(sensor) {
                sensor.draw(WIDTH_BUFFER + 2, HEIGHT_BUFFER, colour)
                colour = (colour + 1) % 15
            })
        }

        // Display helper:
        draw_axes() {
            for (let i = 0; i < 2; i++) {
                screen.drawLine(WIDTH_BUFFER, screen.height - HEIGHT_BUFFER + i, screen.width - WIDTH_BUFFER, screen.height - HEIGHT_BUFFER + i, 5);
                screen.drawLine(WIDTH_BUFFER + i, HEIGHT_BUFFER, WIDTH_BUFFER + i, screen.height - HEIGHT_BUFFER, 5);
            }
        }
    }
}