namespace microcode {
    const WIDTH_BUFFER = 18;
    const TOP_EDGE_BUFFER = 5;
    const BOT_EDGE_BUFFER = 20;
    const MAX_ZOOM_DEPTH = 5;
    const MAX_Y_SCOLL = -75

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
        private oscXOffset: number
        private oscYOffset: number

        private yScrollOffset: number

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

            this.oscXOffset = 0
            this.oscYOffset = 0
            this.yScrollOffset = 0

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

                    this.yScrollOffset = Math.min(this.yScrollOffset + 20, 0)
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.down.id,
                () => {
                    if (this.guiState === GUI_STATE.SENSOR_INFORMATION) {
                        this.guiState = GUI_STATE.PLOTTING
                    }

                    this.yScrollOffset = Math.max(this.yScrollOffset - 20, MAX_Y_SCOLL)
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.left.id,
                () => {
                    // if (this.guiState === GUI_STATE.OSCILLOSCOPE_MODE) {
                    //     this.oscXOffset = Math.max(this.oscXOffset - 5, -WIDTH_BUFFER)
                    // }
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.right.id,
                () => {
                    // if (this.guiState === GUI_STATE.OSCILLOSCOPE_MODE) {
                    //     this.oscXOffset = Math.min(this.oscXOffset + 5, WIDTH_BUFFER)
                    // }
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
                // const oscModeBtn = new Button({
                //     parent: null,
                //     style: ButtonStyles.Transparent,
                //     icon: "green_tick",
                //     ariaId: "Oscilloscope",
                //     x: 60,
                //     y: 30,
                //     onClick: () => {
                //         this.guiState = GUI_STATE.OSCILLOSCOPE_MODE
                //     }
                // })

                // oscModeBtn.draw()
            }

            else {
                this.plot()
            }

            basic.pause(100);
        }


        draw_grid() {
            for (let x = this.xUnit; x < Screen.HEIGHT - BOT_EDGE_BUFFER - this.yUnit; x += this.xUnit) {
                screen.drawLine(
                    WIDTH_BUFFER + this.oscXOffset,
                    TOP_EDGE_BUFFER + x + this.oscYOffset,
                    Screen.WIDTH - WIDTH_BUFFER + this.oscXOffset, 
                    TOP_EDGE_BUFFER + x + this.oscYOffset,
                    0x1
                );
            }

            for (let y = this.yUnit; y < Screen.WIDTH - WIDTH_BUFFER - this.xUnit; y += this.yUnit) {
                screen.drawLine(
                    WIDTH_BUFFER + y + this.oscXOffset,
                    TOP_EDGE_BUFFER + this.xUnit + this.oscYOffset,
                    WIDTH_BUFFER + y + this.oscXOffset,
                    screen.height - TOP_EDGE_BUFFER + this.oscYOffset,
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
            let color = 8;

            // Sensor information, displayed below the plot:
            for (let i = 0; i < this.sensors.length; i++) {
                // (this.sensors[i].name.length * simage.font5.charWidth)

                screen.fillRect(
                    2,
                    screen.height - BOT_EDGE_BUFFER + this.yScrollOffset + 15 + (i * 12),
                    7,
                    7,
                    color
                )
                
                screen.print(this.sensors[i].name + " " + this.sensors[i].getReading() + "/" + this.sensors[i].maxReading
                    + " Peak " + this.sensors[i].peakDataPoint[1], 
                    14,
                    screen.height - BOT_EDGE_BUFFER + this.yScrollOffset + 15 + (i * 12),
                    color
                )

                color = (color + 1) % 15
            }

            this.draw_axes();

            // Draw data
            color = 8;
            this.sensors.forEach(function(sensor) {
                sensor.draw(WIDTH_BUFFER + 2 + this.oscXOffset, BOT_EDGE_BUFFER + this.oscYOffset - this.yScrollOffset, color)
                // sensor.draw(WIDTH_BUFFER + 2 + this.oscXOffset, BOT_EDGE_BUFFER - this.oscYOffset + 1, color)
                color = (color + 1) % 15
            })
            

            // Value of the latest readings
            const latestReadings = this.sensors.map(function(sensor) {return [sensor.getReading(), sensor.maxReading]})
            
            // Draw the latest reading on the right-hand side:
            color = 8;
            latestReadings.forEach(function(reading) {
                const y = Math.round(screen.height - ((reading[0] / reading[1]) * (screen.height))) - TOP_EDGE_BUFFER - BOT_EDGE_BUFFER
                screen.print(
                    reading[0].toString(),
                    screen.width - WIDTH_BUFFER + 1,
                    y + this.yScrollOffset,
                    color,
                    simage.font5,
                )
                color = (color + 1) % 15
            })
        }

        // Display helper:
        draw_axes() {
            for (let i = 0; i < 2; i++) {
                screen.drawLine(
                    WIDTH_BUFFER + this.oscXOffset,
                    screen.height - BOT_EDGE_BUFFER + i + this.oscYOffset + this.yScrollOffset, 
                    screen.width - WIDTH_BUFFER + this.oscXOffset, 
                    screen.height - BOT_EDGE_BUFFER + i + this.oscYOffset + this.yScrollOffset, 
                    5
                );
                screen.drawLine(
                    WIDTH_BUFFER + i + this.oscXOffset, 
                    TOP_EDGE_BUFFER + this.oscYOffset + this.yScrollOffset, 
                    WIDTH_BUFFER + i + this.oscXOffset, 
                    screen.height - BOT_EDGE_BUFFER + this.oscYOffset + this.yScrollOffset, 
                    5
                );
            }
        }
    }
}