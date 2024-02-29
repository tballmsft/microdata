namespace microcode {
    const WIDTH_BUFFER = 20;
    const HEIGHT_BUFFER = 14;
    const MAX_ZOOM_DEPTH = 5;

    enum GUI_STATE {
        PLOTTING,
        OSCILLOSCOPE_MODE,
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


        // Oscilloscope offsets:
        private oscXOffset = 0;
        private oscYOffset = 0;

        // For axis:
        private xUnit: number
        private yUnit: number
        private zoomDepth: number

        private sensors: Sensor[]

        constructor(app: App, sensors: Sensor[]) {
            super(app, "yo")
            this.color = 0
            this.guiState = GUI_STATE.OSCILLOSCOPE_MODE
            this.sensors = sensors

            this.xUnit = 10
            this.yUnit = 10
            this.zoomDepth = 1

            this.dataBuffers = []
            for (let i = 0; i < this.sensors.length; i++) {
                this.dataBuffers.push([])
            }


            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.A.id,
                () => {
                    if (this.guiState === GUI_STATE.SENSOR_INFORMATION) {
                        this.guiState = GUI_STATE.OSCILLOSCOPE_MODE
                    }

                    if (this.guiState === GUI_STATE.OSCILLOSCOPE_MODE) {
                        if (this.zoomDepth < 5) {
                            this.zoomDepth += 1
                        }
                    }
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.B.id,
                () => {
                    if (this.guiState === GUI_STATE.OSCILLOSCOPE_MODE && this.zoomDepth === 1) {
                        this.guiState = GUI_STATE.PLOTTING
                    }

                    if (this.zoomDepth > 1) {
                        this.zoomDepth -= 1
                    }
                    
                    else {
                        app.popScene()
                        app.pushScene(new Home(app))
                    }
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.up.id,
                () => {
                    if (this.guiState === GUI_STATE.PLOTTING) {
                        this.guiState = GUI_STATE.SENSOR_INFORMATION
                    }

                    if (this.guiState === GUI_STATE.OSCILLOSCOPE_MODE) {
                        this.oscYOffset = Math.max(this.oscYOffset - 5, -HEIGHT_BUFFER)
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

                    if (this.guiState === GUI_STATE.OSCILLOSCOPE_MODE) {
                        this.oscYOffset = Math.min(this.oscYOffset + 5, HEIGHT_BUFFER)
                    }
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.left.id,
                () => {
                    if (this.guiState === GUI_STATE.OSCILLOSCOPE_MODE) {
                        this.oscXOffset = Math.max(this.oscXOffset - 5, -WIDTH_BUFFER)
                    }
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.right.id,
                () => {
                    if (this.guiState === GUI_STATE.OSCILLOSCOPE_MODE) {
                        this.oscXOffset = Math.min(this.oscXOffset + 5, WIDTH_BUFFER)
                    }
                }
            )
        }


        /* override */ startup() {
            super.startup()
        }

        update() {
            screen.fill(this.color);

            this.sensors.forEach(function(sensor) {
                sensor.readIntoBuffer()
            })

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

                const oscModeBtn = new Button({
                    parent: null,
                    style: ButtonStyles.Transparent,
                    icon: "green_tick",
                    ariaId: "Oscilloscope",
                    x: 60,
                    y: 30,
                    onClick: () => {
                        this.guiState = GUI_STATE.OSCILLOSCOPE_MODE
                    }
                })

                oscModeBtn.draw()
            }

            else {
                this.plot()
            }

            basic.pause(100);
        }


        draw_grid() {
            for (let x = this.xUnit; x < Screen.HEIGHT - HEIGHT_BUFFER - this.yUnit; x += this.xUnit) {
                screen.drawLine(
                    WIDTH_BUFFER + this.oscXOffset,
                    HEIGHT_BUFFER + x + this.oscYOffset,
                    Screen.WIDTH - WIDTH_BUFFER + this.oscXOffset, 
                    HEIGHT_BUFFER + x + this.oscYOffset,
                    0x1
                );
            }

            for (let y = this.yUnit; y < Screen.WIDTH - WIDTH_BUFFER - this.xUnit; y += this.yUnit) {
                screen.drawLine(
                    WIDTH_BUFFER + y + this.oscXOffset,
                    HEIGHT_BUFFER + this.xUnit + this.oscYOffset,
                    WIDTH_BUFFER + y + this.oscXOffset,
                    screen.height - HEIGHT_BUFFER + this.oscYOffset,
                    0x1
                );
            }
        }

        /**
         * Display mode for plotting all incoming data on y axis
         * Presumes pre-processed this.dataBuffers; y values relative to screen.height
         * Bound to Microbit button A
         */
        private plot() {
            screen.printCenter("Press UP for options", 5)

            let colour = 8;

            // Axis scale:
            // screen.fillCircle(
            //     WIDTH_BUFFER + this.oscXOffset,
            //     HEIGHT_BUFFER + 8 + this.oscYOffset,
            //     3,
            //     3
            // )

            // for (let i = 0; i < this.sensors.length; i++) {
            //     let text = this.sensors[i].sensorMaxReading.toString();

            //     if (i == this.sensors.length) {
            //         text += " &"
            //     }
            //     screen.print(
            //         text,
            //         WIDTH_BUFFER - 20 + this.oscXOffset,
            //         HEIGHT_BUFFER + 8 + (i * 8) + this.oscYOffset,
            //         colour,
            //         simage.font5,
            //     )
            //     colour = (colour + 1) % 15
            // }
            
            this.draw_grid()
            this.draw_axes();


            // Draw data
            // colour = 8;
            this.sensors.forEach(function(sensor) {
                sensor.draw(WIDTH_BUFFER + 2 + this.oscXOffset, HEIGHT_BUFFER - this.oscYOffset, colour)
                colour = (colour + 1) % 15
            })
        }

        // Display helper:
        draw_axes() {
            for (let i = 0; i < 2; i++) {
                screen.drawLine(
                    WIDTH_BUFFER + this.oscXOffset,
                    screen.height - HEIGHT_BUFFER + i + this.oscYOffset, 
                    screen.width - WIDTH_BUFFER + this.oscXOffset, 
                    screen.height - HEIGHT_BUFFER + i + this.oscYOffset, 
                    5
                );
                screen.drawLine(
                    WIDTH_BUFFER + i + this.oscXOffset, 
                    HEIGHT_BUFFER + this.oscYOffset, 
                    WIDTH_BUFFER + i + this.oscXOffset, 
                    screen.height - HEIGHT_BUFFER + this.oscYOffset, 
                    5
                );
            }
        }
    }
}