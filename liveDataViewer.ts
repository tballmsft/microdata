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

        /* Coordinates that the user wants to zoom in on; adjust offsets to make this point centred, whilst zoomed */
        private selectedXCoordinate: number
        private selectedYCoordinate: number

        private currentZoomDepth: number

        private selectedSensorIndex: number

        /* To plot */
        private sensors: Sensor[]

        constructor(app: App, sensors: Sensor[]) {
            super(app, "liveDataViewer")
            this.color = 0
            this.sensors = sensors

            this.windowWidth = Screen.WIDTH
            this.windowHeight = Screen.HEIGHT

            this.windowWidthBuffer = 18
            this.windowTopBuffer = 5
            this.windowBotBuffer = 20

            this.xScrollOffset = 0
            this.yScrollOffset = 0

            this.selectedXCoordinate = null
            this.selectedYCoordinate = null

            this.currentZoomDepth = 0

            this.selectedSensorIndex = 0

            //--------------------------------
            // Oscilloscope Movement Controls:
            //--------------------------------

            // Zoom in:
            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.A.id,
                () => {
                    if (this.selectedXCoordinate == null || this.selectedYCoordinate == null) {
                        this.selectedXCoordinate = Math.round(this.sensors[this.selectedSensorIndex].getDataBufferLength() / 2)
                        this.selectedYCoordinate = this.sensors[this.selectedSensorIndex].getNthReading(this.selectedXCoordinate)
                    }

                    this.xScrollOffset = Math.round(Screen.HALF_WIDTH - this.selectedXCoordinate)

                    this.windowHeight = this.windowHeight + (Screen.HEIGHT * 0.5)
                    this.windowWidth = this.windowWidth + (Screen.WIDTH * 0.5)

                    this.windowWidthBuffer = this.windowWidthBuffer - (18 * 0.5)
                    this.windowTopBuffer = this.windowTopBuffer - (5 * 0.5)
                    this.windowBotBuffer = this.windowBotBuffer - (20 * 0.5)

                    this.currentZoomDepth += 1
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
                        this.xScrollOffset = 0

                        this.windowHeight = this.windowHeight - (Screen.HEIGHT * 0.5)
                        this.windowWidth = this.windowWidth - (Screen.WIDTH * 0.5)
    
                        this.windowWidthBuffer = this.windowWidthBuffer + (18 * 0.5)
                        this.windowTopBuffer = this.windowTopBuffer + (5 * 0.5)
                        this.windowBotBuffer = this.windowBotBuffer + (20 * 0.5)    
                        
                        this.currentZoomDepth -= 1
                    }
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.up.id,
                () => {
                    if (this.currentZoomDepth > 0) {
                        this.selectedSensorIndex = ((this.selectedSensorIndex + 1) % this.sensors.length)
                        this.selectedYCoordinate = this.sensors[this.selectedSensorIndex].getNthReading(this.selectedXCoordinate)
                    }
                    else {
                        this.yScrollOffset = Math.min(this.yScrollOffset + 20, 0)
                    }
                    this.update() // For fast response to the above change
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.down.id,
                () => {
                    if (this.currentZoomDepth > 0) {
                        this.selectedSensorIndex = Math.max(this.selectedSensorIndex - 1, 0)
                        this.selectedYCoordinate = this.sensors[this.selectedSensorIndex].getNthReading(this.selectedXCoordinate)
                    }
                    else {
                        this.yScrollOffset = Math.max(this.yScrollOffset - 20, MAX_Y_SCOLL)
                    }
                    this.update() // For fast response to the above change
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.left.id,
                () => {
                    if (this.currentZoomDepth != 0) {
                        if (this.selectedXCoordinate - (Math.abs(this.sensors[this.selectedSensorIndex].getDataBufferLength() - this.selectedXCoordinate) / 2) > 0) {
                            this.selectedXCoordinate -= Math.round(Math.abs(this.sensors[this.selectedSensorIndex].getDataBufferLength() - this.selectedXCoordinate) / 2)
                            this.xScrollOffset = Screen.HALF_WIDTH - this.selectedXCoordinate
                        }

                        this.update() // For fast response to the above change
                    }
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.right.id,
                () => {
                    if (this.currentZoomDepth != 0) {
                        if (this.selectedXCoordinate + (Math.abs(this.sensors[this.selectedSensorIndex].getDataBufferLength() - this.selectedXCoordinate) / 2) < this.sensors[this.selectedSensorIndex].getDataBufferLength()) {
                            this.selectedXCoordinate +=  Math.round(Math.abs(this.sensors[this.selectedSensorIndex].getDataBufferLength() - this.selectedXCoordinate) / 2)
                            this.xScrollOffset = Screen.HALF_WIDTH - this.selectedXCoordinate
                        }
                        
                        this.update() // For fast response to the above change
                    }
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
                    this.windowHeight - this.windowBotBuffer + this.yScrollOffset  + this.yScrollOffset + 15 + (i * 12),
                    7,
                    7,
                    color
                )
                
                // Name, reading / maximum, peak
                screen.print(this.sensors[i].name + " " + this.sensors[i].getReading() + "/" + this.sensors[i].maxReading +
                    " Peak " + this.sensors[i].peakDataPoint[1], 
                    14,
                    this.windowHeight - this.windowBotBuffer + this.yScrollOffset  + this.yScrollOffset + 15 + (i * 12),
                    color
                )

                color = (color + 3) % 15
            }

            // Circle around selected data point:
            if (this.selectedXCoordinate != null && this.selectedYCoordinate != null) {
                const fromY = this.windowBotBuffer - this.yScrollOffset - this.yScrollOffset
                const y = Math.round(Screen.HEIGHT - ((this.selectedYCoordinate / this.sensors[this.selectedSensorIndex].maxReading) * (Screen.HEIGHT - fromY))) - fromY

                screen.drawCircle(
                    this.windowWidthBuffer + this.selectedXCoordinate + this.xScrollOffset,
                    y,
                    5,
                    1
                )
            }

            // Draw the latest reading on the right-hand side as a Ticker if at no-zoom:
            color = 8;
            if (this.currentZoomDepth == 0) {
                const latestReadings = this.sensors.map(function(sensor) {return [sensor.getReading(), sensor.maxReading]})

                latestReadings.forEach(function(reading) {
                    const fromY = this.windowBotBuffer - this.yScrollOffset - this.yScrollOffset
                    const y = Math.round(Screen.HEIGHT - ((reading[0] / reading[1]) * (Screen.HEIGHT - fromY))) - fromY

                    screen.print(
                        reading[0].toString(),
                        Screen.WIDTH + this.xScrollOffset - 18 + 1,
                        y - 2,
                        color,
                        simage.font5,
                    )
                    color = (color + 3) % 15
                })
            }

            else {
                const fromY = this.windowBotBuffer - this.yScrollOffset - this.yScrollOffset
                const y = Math.round(Screen.HEIGHT - ((this.selectedYCoordinate / this.sensors[this.selectedSensorIndex].maxReading) * (Screen.HEIGHT - fromY))) - fromY

                screen.print(
                    "x =" + this.selectedXCoordinate.toString(),
                    this.windowWidthBuffer + this.selectedXCoordinate + this.xScrollOffset + 10,
                    y - 20,
                    color,
                    simage.font5,
                )

                screen.print(
                    "y =" + this.sensors[this.selectedSensorIndex].getReading().toString(),
                    this.windowWidthBuffer + this.selectedXCoordinate + this.xScrollOffset + 10,
                    y - 10,
                    color,
                    simage.font5,
                )
            }

            // Draw data lines:
            color = 8;
            this.sensors.forEach(function(sensor) {
                sensor.draw(this.windowWidthBuffer + 2 + this.xScrollOffset, this.windowBotBuffer - this.yScrollOffset - this.yScrollOffset, color)
                color = (color + 3) % 15
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