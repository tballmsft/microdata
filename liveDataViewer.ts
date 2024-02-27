namespace microcode {
    const WIDTH_BUFFER = 16;
    const HEIGHT_BUFFER = 12;

    enum GUI_STATE {
        PLOTTING,
        SENSOR_INFORMATION
    }

    export class LiveDataViewer extends Scene {
        private dataBuffers: number[][];
        private bufferLimit = screen.width - (2 * WIDTH_BUFFER);
        private guiState: GUI_STATE

        private sensors: Sensor[]

        constructor(app: App, sensors: Sensor[]) {
            super(app, "liveDataViewer")
            this.color = 0
            this.guiState = GUI_STATE.PLOTTING

            this.sensors = sensors
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
                for (let i = 0; i < this.sensors.length; i++) {
                    let normalisedOutput = this.sensors[i].getNormalisedReading();
                    let y = Math.round(screen.height - (normalisedOutput * (screen.height - HEIGHT_BUFFER))) - HEIGHT_BUFFER

                    // Buffer management:
                    if (this.dataBuffers[i].length >= this.bufferLimit) {
                        this.dataBuffers[i].shift();
                    }
                    this.dataBuffers[i].push(y);
                }

                // Draw:
                this.plot()

                basic.pause(100);
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

            const start = WIDTH_BUFFER + 2;
            let colour = 8;

            this.dataBuffers.forEach(function(dataBuffer) {
                for (let i = 0; i < dataBuffer.length - 1; i++) {
                    screen.drawLine(start + i, dataBuffer[i], start + i - 1, dataBuffer[i + 1], colour);
                }
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