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

        private windowWidth: number
        private windowHeight: number

        private windowWidthBuffer: number
        private windowTopBuffer: number
        private windowBotBuffer: number

        private xScrollOffset: number
        private yScrollOffset: number

        private selectedXCoordinate: number

        private sensors: Sensor[]

        constructor(app: App, sensors: Sensor[]) {
            super(app, "yo")
            this.color = 0
            this.guiState = GUI_STATE.OSCILLOSCOPE_MODE
            this.sensors = sensors

            this.windowWidth = Screen.WIDTH
            this.windowHeight = Screen.HEIGHT

            this.windowWidthBuffer = 18
            this.windowTopBuffer = 5
            this.windowBotBuffer = 20

            this.xScrollOffset = 0
            this.yScrollOffset = 0

            this.selectedXCoordinate = (Screen.WIDTH / 2)

            this.dataBuffers = []
            for (let i = 0; i < this.sensors.length; i++) {
                this.dataBuffers.push([])
            }

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.A.id,
                () => {
                    // if (this.guiState === GUI_STATE.SENSOR_INFORMATION) {
                    //     this.guiState = GUI_STATE.OSCILLOSCOPE_MODE
                    // }

                    this.windowHeight = this.windowHeight + (Screen.HEIGHT * 0.5)
                    this.windowWidth = this.windowWidth + (Screen.WIDTH * 0.5)

                    this.windowWidthBuffer = this.windowWidthBuffer - (18 * 0.5)
                    this.windowTopBuffer = this.windowTopBuffer - (5 * 0.5)
                    this.windowBotBuffer = this.windowBotBuffer - (20 * 0.5)

                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.B.id,
                () => {
                    if (this.windowHeight <= Screen.HEIGHT && this.windowWidth <= Screen.WIDTH) {
                        app.popScene()
                        app.pushScene(new Home(app))
                    }
                    
                    else {
                        this.windowHeight = this.windowHeight - (Screen.HEIGHT * 0.5)
                        this.windowWidth = this.windowWidth - (Screen.WIDTH * 0.5)
    
                        this.windowWidthBuffer = this.windowWidthBuffer + (18 * 0.5)
                        this.windowTopBuffer = this.windowTopBuffer + (5 * 0.5)
                        this.windowBotBuffer = this.windowBotBuffer + (20 * 0.5)                      
                    }
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.up.id,
                () => {
                    // if (this.guiState === GUI_STATE.PLOTTING) {
                    //     this.guiState = GUI_STATE.SENSOR_INFORMATION    
                    // }

                    this.yScrollOffset = Math.min(this.yScrollOffset + 20, 0)
                    this.update()
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.down.id,
                () => {
                    // if (this.guiState === GUI_STATE.SENSOR_INFORMATION) {
                    //     this.guiState = GUI_STATE.PLOTTING
                    // }

                    this.yScrollOffset = Math.max(this.yScrollOffset - 20, MAX_Y_SCOLL)
                    this.update()
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.left.id,
                () => {
                    // if (this.guiState === GUI_STATE.OSCILLOSCOPE_MODE) {
                    this.xScrollOffset = Math.min(this.xScrollOffset + 10, this.windowWidth)

                    this.update()
                    // }
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.right.id,
                () => {
                    // if (this.guiState === GUI_STATE.OSCILLOSCOPE_MODE) {
                    this.xScrollOffset = Math.max(this.xScrollOffset - 10, -this.windowWidth)
                    

                    this.update()
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

            this.plot()

            basic.pause(100);
        }

        /**
         * Display mode for plotting all incoming data on y axis
         * Presumes pre-processed this.dataBuffers; y values relative to screen.height
         */
        private plot() {            
            let color = 8;

            // Sensor information, displayed below the plot:
            for (let i = 0; i < this.sensors.length; i++) {
                screen.fillRect(
                    2,
                    this.windowHeight - this.windowBotBuffer + this.yScrollOffset + 15 + (i * 12),
                    7,
                    7,
                    color
                )
                
                screen.print(this.sensors[i].name + " " + this.sensors[i].getReading() + "/" + this.sensors[i].maxReading +
                    " Peak " + this.sensors[i].peakDataPoint[1], 
                    14,
                    this.windowHeight - this.windowBotBuffer + this.yScrollOffset + 15 + (i * 12),
                    color
                )

                color = (color + 1) % 15
            }

            this.draw_axes();

            // Draw data
            color = 8;
            this.sensors.forEach(function(sensor) {
                sensor.draw(this.windowWidthBuffer + 2 + this.xScrollOffset, this.windowBotBuffer - this.yScrollOffset, color)
                color = (color + 1) % 15
            })


            screen.fillCircle(
                (Screen.WIDTH / 2),// + this.windowWidth - this.windowWidth,
                (Screen.HEIGHT / 2),// + this.windowTopBuffer - this.windowBotBuffer,
                8,
                4
            )
            

            // Draw the latest reading on the right-hand side as a Ticker:

            color = 8;
            const latestReadings = this.sensors.map(function(sensor) {return [sensor.getReading(), sensor.maxReading]})

            latestReadings.forEach(function(reading) {
                const y = Math.round(Screen.HEIGHT - ((reading[0] / reading[1]) * (Screen.HEIGHT)))
                screen.print(
                    reading[0].toString(),
                    Screen.WIDTH + this.xScrollOffset - 18 + 1,
                    y + this.yScrollOffset - this.windowBotBuffer - this.windowTopBuffer,
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
                    this.windowWidthBuffer + this.xScrollOffset,
                    this.windowHeight - this.windowBotBuffer + i + this.yScrollOffset + this.yScrollOffset, 
                    this.windowWidth - this.windowWidthBuffer + this.xScrollOffset, 
                    this.windowHeight - this.windowBotBuffer + i + this.yScrollOffset + this.yScrollOffset, 
                    5
                );
                screen.drawLine(
                    this.windowWidthBuffer + i + this.xScrollOffset, 
                    this.windowTopBuffer + this.yScrollOffset + this.yScrollOffset, 
                    this.windowWidthBuffer + i + this.xScrollOffset, 
                    this.windowHeight - this.windowBotBuffer + this.yScrollOffset + this.yScrollOffset, 
                    5
                );
            }
        }
    }
}