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

        private windowLeftBuffer: number
        private windowRightBuffer: number
        private windowTopBuffer: number
        private windowBotBuffer: number

        private xScrollOffset: number
        private yScrollOffset: number

        /* Coordinates that the user wants to zoom in on; adjust offsets to make this point centred, whilst zoomed */
        private selectedXCoordinate: number
        private selectedYCoordinate: number

        private currentZoomDepth: number

        /* Continue reading from the sensors? Or pause sensor reading? */
        private requestDataMode: boolean

        /* Use the Left & Right Buttons to move by 1 unit? or jump relative to the start/end? */
        private oscilloscopeMovementMode: boolean
        private selectedSensorIndex: number

        /* To plot */
        private sensors: Sensor[]

        constructor(app: App, sensors: Sensor[]) {
            super(app, "liveDataViewer")
            this.color = 0

            this.sensors = sensors

            this.windowWidth = Screen.WIDTH
            this.windowHeight = Screen.HEIGHT

            this.windowLeftBuffer = 25
            this.windowRightBuffer = 5
            this.windowTopBuffer = 5
            this.windowBotBuffer = 20

            this.xScrollOffset = 0
            this.yScrollOffset = 0

            this.selectedXCoordinate = null
            this.selectedYCoordinate = null

            this.currentZoomDepth = 0
            this.requestDataMode = true // Constant data flow
            this.oscilloscopeMovementMode = false // Move Left/Right relative to end/start position

            // Ensure selectedSensorIndex is set to the lowest current reading
            this.selectedSensorIndex = 0

            let minimumReading = this.sensors[0].getReading()
            for (let i = 1; i < this.sensors.length; i++) {
                if (this.sensors[i].getReading() < minimumReading) {
                    minimumReading = this.sensors[i].getReading()
                    this.selectedSensorIndex = i
                }
            }

            //--------------------------------
            // Oscilloscope Movement Controls:
            //--------------------------------  

            // Use Microbit A button to pause/continue reading new data:
            control.onEvent(DAL.DEVICE_BUTTON_EVT_DOWN, DAL.DEVICE_ID_BUTTON_A, () => {
                this.requestDataMode = !this.requestDataMode    
            })

            // Use Microbit B button to control the oscilloscope x-axis movement mode:
            control.onEvent(DAL.DEVICE_BUTTON_EVT_DOWN, DAL.DEVICE_ID_BUTTON_B, () => {
                this.oscilloscopeMovementMode = !this.oscilloscopeMovementMode
            })

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

                    this.windowLeftBuffer = this.windowLeftBuffer - (18 * 0.5)
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
                        this.app.popScene()
                        this.app.pushScene(new Home(this.app))
                    }
                    
                    else {
                        this.xScrollOffset = 0

                        this.windowHeight = this.windowHeight - (Screen.HEIGHT * 0.5)
                        this.windowWidth = this.windowWidth - (Screen.WIDTH * 0.5)
    
                        this.windowLeftBuffer = this.windowLeftBuffer + (18 * 0.5)
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
                        // Handling negative modulo:
                        this.selectedSensorIndex = (((this.selectedSensorIndex - 1) % this.sensors.length) + this.sensors.length) % this.sensors.length
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
                        if (!this.oscilloscopeMovementMode && this.selectedXCoordinate - (Math.abs(this.sensors[this.selectedSensorIndex].getDataBufferLength() - this.selectedXCoordinate) / 2) > 0) {
                            this.selectedXCoordinate -= Math.round(Math.abs(this.sensors[this.selectedSensorIndex].getDataBufferLength() - this.selectedXCoordinate) / 2)
                        }
                        else {
                            this.selectedXCoordinate = Math.max(0, this.selectedXCoordinate - 1)
                        }

                        this.selectedYCoordinate = this.sensors[this.selectedSensorIndex].getNthReading(this.selectedXCoordinate)
                        this.xScrollOffset = Screen.HALF_WIDTH - this.selectedXCoordinate

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
                            if (this.oscilloscopeMovementMode) {
                                this.selectedXCoordinate = Math.min(this.selectedXCoordinate + 1, this.sensors[this.selectedSensorIndex].getDataBufferLength())
                            }
                            else {
                                this.selectedXCoordinate += Math.round(Math.abs(this.sensors[this.selectedSensorIndex].getDataBufferLength() - this.selectedXCoordinate) / 2)      
                            }

                            this.selectedYCoordinate = this.sensors[this.selectedSensorIndex].getNthReading(this.selectedXCoordinate)
                            
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

            if (this.requestDataMode) {
                this.sensors.forEach(function(sensor) {
                    sensor.readIntoBufferOnce()
                })
            }

            this.plot()

            basic.pause(100);
        }

        /**
         * Display mode for plotting all incoming data on y axis
         */
        private plot() {            
            let color = 8;

            this.draw_axes();

            const yStart = this.windowHeight - this.windowBotBuffer + this.yScrollOffset  + this.yScrollOffset + 15
            let y = yStart

            // Write Sensor information, displayed below the plot:
            for (let i = 0; i < this.sensors.length; i++) {
                // Colour used to represent this sensor, same colour as plotted & ticker:
                y += (i * 12)

                // Colour block to the left of the name:
                screen.fillRect(
                    2,
                    y,
                    7,
                    7,
                    color
                )

                // Name, reading / maximum
                screen.print(
                    this.sensors[i].name + " " + this.sensors[i].getReading() + "/" + this.sensors[i].maximum,
                    14,
                    y,
                    color
                )

                // Write the peak reading just below and with a slight xOffset from the above:
                y += 12
                screen.print(
                    "Peak " + this.sensors[i].peakDataPoint[1], 
                    44,
                    y,
                    color
                )

                color = (color + 3) % 15
            }

            // The data from the sensors will shift to the left over time as the buffer is filled
            // Shift the selected coordinate appropriately; so that the Circle around the selected point is accurate
            if (this.requestDataMode && this.selectedXCoordinate != null && this.sensors[this.selectedSensorIndex].getBufferSize() == Sensor.BUFFER_LIMIT) {
                this.selectedXCoordinate -= 1

                if (this.selectedXCoordinate <= 0) {
                    this.selectedXCoordinate = null
                    this.selectedYCoordinate = null
                }
            }

            // Circle around selected data point:
            if (this.selectedXCoordinate != null && this.selectedYCoordinate != null) {
                const fromY = this.windowBotBuffer - this.yScrollOffset - this.yScrollOffset

                const sensorRange = Math.abs(this.sensors[this.selectedSensorIndex].minimum) + this.sensors[this.selectedSensorIndex].maximum
                const y = Math.round(Screen.HEIGHT - (((this.selectedYCoordinate - this.sensors[this.selectedSensorIndex].minimum) / sensorRange) * (Screen.HEIGHT - fromY))) - fromY

                screen.drawCircle(
                    this.windowLeftBuffer + this.selectedXCoordinate + this.xScrollOffset,
                    y,
                    5,
                    1
                )

                screen.print(
                    "x =" + this.selectedXCoordinate.toString(),
                    this.windowLeftBuffer + this.selectedXCoordinate + this.xScrollOffset + 10,
                    y + 5,
                    color,
                    simage.font5,
                )

                screen.print(
                    "y =" + this.sensors[this.selectedSensorIndex].getReading().toString(),
                    this.windowLeftBuffer + this.selectedXCoordinate + this.xScrollOffset + 10,
                    y + 15,
                    color,
                    simage.font5,
                )
            }

            // Draw the latest reading on the right-hand side as a Ticker if at no-zoom:
            color = 8;
            if (this.currentZoomDepth == 0) {
                const latestReadings = this.sensors.map(function(sensor) {return [sensor.getReading(), sensor.minimum, Math.abs(sensor.minimum) + sensor.maximum]})

                latestReadings.forEach(function(reading) {
                    const fromY = this.windowBotBuffer - this.yScrollOffset - this.yScrollOffset
                    const y = Math.round(Screen.HEIGHT - ((((reading[0] - reading[1]) / reading[2]) * (Screen.HEIGHT - fromY)))) - fromY

                    // Not minimum value:
                    if (y != reading[1]) {
                        screen.print(
                            reading[0].toString(),
                            Screen.WIDTH + this.xScrollOffset - 25,
                            y - 2,
                            color,
                            simage.font5,
                        )
                    }
                    color = (color + 3) % 15
                })
            }

            // Draw data lines:
            color = 8;
            this.sensors.forEach(function(sensor) {
                sensor.draw(
                    this.windowWidthBuffer + 2 + this.xScrollOffset, 
                    this.windowBotBuffer - 2 * this.yScrollOffset, 
                    color
                )
                color = (color + 3) % 15
            })
        }

        /**
         * 2 Axis of Double-thickness each, in yellow
         */
        draw_axes() {
            for (let i = 0; i < 2; i++) {
                screen.drawLine(
                    this.windowLeftBuffer + this.xScrollOffset,
                    this.windowHeight - this.windowBotBuffer + i + this.yScrollOffset + this.yScrollOffset, 
                    this.windowWidth - this.windowLeftBuffer + this.xScrollOffset, 
                    this.windowHeight - this.windowBotBuffer + i + this.yScrollOffset + this.yScrollOffset, 
                    5
                );
                screen.drawLine(
                    this.windowLeftBuffer + i + this.xScrollOffset, 
                    this.windowTopBuffer + this.yScrollOffset + this.yScrollOffset, 
                    this.windowLeftBuffer + i + this.xScrollOffset, 
                    this.windowHeight - this.windowBotBuffer + this.yScrollOffset + this.yScrollOffset, 
                    5
                );
            }
        }
    }
}