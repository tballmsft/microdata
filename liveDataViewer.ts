namespace microcode {
    /** No information beyond this Y coordinate */
    const MAX_Y_SCOLL = -75

    /**
     * One of the 3 main functionalities of MicroData
     * Allows for the live feed of a sensor to be plotted,
     *      Multiple sensors may be plotted at once
     *      Display modes may be toggled per sensor
     */
    export class LiveDataViewer extends Scene {
        private windowWidth: number
        private windowHeight: number

        private windowWidthBuffer: number
        private windowTopBuffer: number
        private windowBotBuffer: number

        private xScrollOffset: number
        private yScrollOffset: number

        /* X coordinate that the user wants to zoom in on; adjust offsets to make this point centred, whilst zoomed */
        private selectedXCoordinate: number

        /* To plot */
        private sensors: Sensor[]

        constructor(app: App, sensors: Sensor[]) {
            super(app, "yo")
            this.color = 0
            this.sensors = sensors

            this.windowWidth = Screen.WIDTH
            this.windowHeight = Screen.HEIGHT

            this.windowWidthBuffer = 18
            this.windowTopBuffer = 5
            this.windowBotBuffer = 20

            this.xScrollOffset = 0
            this.yScrollOffset = 0

            this.selectedXCoordinate = (Screen.WIDTH / 2)


            //--------------------------------
            // Oscilloscope Movement Controls:
            //--------------------------------

            // Zoom in:
            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.A.id,
                () => {
                    this.windowHeight = this.windowHeight + (Screen.HEIGHT * 0.5)
                    this.windowWidth = this.windowWidth + (Screen.WIDTH * 0.5)

                    this.windowWidthBuffer = this.windowWidthBuffer - (18 * 0.5)
                    this.windowTopBuffer = this.windowTopBuffer - (5 * 0.5)
                    this.windowBotBuffer = this.windowBotBuffer - (20 * 0.5)

                }
            )

            // Zoom out, if at default zoom (none), then go back to home
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
                    this.yScrollOffset = Math.min(this.yScrollOffset + 20, 0)
                    this.update() // For fast response to the above change
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.down.id,
                () => {
                    this.yScrollOffset = Math.max(this.yScrollOffset - 20, MAX_Y_SCOLL)
                    this.update() // For fast response to the above change
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.left.id,
                () => {
                    this.xScrollOffset = Math.min(this.xScrollOffset + 10, this.windowWidth)
                    this.update() // For fast response to the above change
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.right.id,
                () => {
                    this.xScrollOffset = Math.max(this.xScrollOffset - 10, -this.windowWidth)
                    this.update() // For fast response to the above change
                }
            )
        }


        /**
         * Request each sensor updates its buffers,
         * Then draw to screen
         */
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
         */
        private plot() {            
            let color = 8;

            this.draw_axes();

            // Write Sensor information, displayed below the plot:
            for (let i = 0; i < this.sensors.length; i++) {
                // Colour used to represent this sensor, same colour as plotted & ticker:
                screen.fillRect(
                    2,
                    this.windowHeight - this.windowBotBuffer + this.yScrollOffset + 15 + (i * 12),
                    7,
                    7,
                    color
                )
                
                // Name, reading / maximum, peak
                screen.print(this.sensors[i].name + " " + this.sensors[i].getReading() + "/" + this.sensors[i].maxReading +
                    " Peak " + this.sensors[i].peakDataPoint[1], 
                    14,
                    this.windowHeight - this.windowBotBuffer + this.yScrollOffset + 15 + (i * 12),
                    color
                )

                color = (color + 1) % 15
            }


            // Draw data lines:
            color = 8;
            this.sensors.forEach(function(sensor) {
                sensor.draw(this.windowWidthBuffer + 2 + this.xScrollOffset, this.windowBotBuffer - this.yScrollOffset, color)
                color = (color + 1) % 15
            })

            // Draw circle in the screen centre for better testing:
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

        /**
         * 2 Axis of Double-thickness each, in yellow
         */
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