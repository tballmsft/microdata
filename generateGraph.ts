namespace microcode {
    /** Number of columns used for the datalogger */
    const NUMBER_OF_COLS = 4;

    /**
     * Takes the datalogger logs and generates a labelled graph.
     * Each sensor is a unique coloured line, sensor information is detailed below.
     */
    export class GraphGenerator extends Scene {
        private windowWidth: number
        private windowHeight: number

        private windowLeftBuffer: number
        private windowRightBuffer: number
        private windowTopBuffer: number
        private windowBotBuffer: number

        private yScrollOffset: number
        private xScrollOffset: number
        private xCoordinateScalar: number;

        private dataRows: string[][];
        private rowQty: number;
        
        private numberOfSensors: number;
        private lowestSensorMinimum: number;
        private highestSensorMaximum: number;

        constructor(app: App) {
            super(app, "graphGeneration")
            this.color = 3

            this.windowWidth = Screen.WIDTH
            this.windowHeight = Screen.HEIGHT

            this.windowLeftBuffer = 38
            this.windowRightBuffer = 10
            this.windowTopBuffer = 5
            this.windowBotBuffer = 20

            this.yScrollOffset = 0
            this.xScrollOffset = 0

            this.getNextDataChunk()
            this.rowQty = datalogger.getNumberOfRows()

            // Get the minimum and maximum sensor readings and the number of sensors:
            const firstSensor = this.dataRows[0][0]
            this.numberOfSensors = 1
            
            this.lowestSensorMinimum = SENSOR_LOOKUP_TABLE[firstSensor].getMinimum()
            this.highestSensorMaximum = SENSOR_LOOKUP_TABLE[firstSensor].getMaximum()

            // Count until sensor name is repeated:
            // Go from second sensor onward (3rd row):
            for (let rowID = 2; rowID < this.dataRows.length; rowID++) {
                // First element in row is the sensor:
                if (this.dataRows[rowID][0] != firstSensor) {
                    this.numberOfSensors += 1

                    if (SENSOR_LOOKUP_TABLE[this.dataRows[rowID][0]].getMinimum() < this.lowestSensorMinimum) {
                        this.lowestSensorMinimum = SENSOR_LOOKUP_TABLE[this.dataRows[rowID][0]].getMinimum()
                    }

                    if (SENSOR_LOOKUP_TABLE[this.dataRows[rowID][0]].getMaximum() > this.highestSensorMaximum) {
                        this.highestSensorMaximum = SENSOR_LOOKUP_TABLE[this.dataRows[rowID][0]].getMaximum()
                    }
                }

                else {
                    break
                }
            }

            this.xCoordinateScalar = 1
            if (this.dataRows.length < Screen.WIDTH) {
                this.xCoordinateScalar = Math.round(
                    (Screen.WIDTH - this.windowLeftBuffer + this.windowRightBuffer) /
                    (this.dataRows.length / this.numberOfSensors)
                ) - 1
            }

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
                    this.yScrollOffset = Math.max(this.yScrollOffset - 20, -(this.windowHeight + 40))
                    this.update() // For fast response to the above change
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.left.id,
                () => {
                    this.xScrollOffset = Math.max(0, this.xScrollOffset - 1)
                    this.getNextDataChunk()
                    this.update() // For fast response to the above changes
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.right.id,
                () => {
                    // If it is a multiple of 10 then that last row will have no data, so stop 1 row before:
                    if ((this.rowQty % 10) == 0) {
                        this.xScrollOffset = Math.min(this.xScrollOffset + 1, (this.rowQty / 10) - 1)
                    }
                    // Otherwise there will be > 0 && < 10 elements on the last row:
                    else {
                        this.xScrollOffset = Math.min(this.xScrollOffset + 1, Math.floor(this.rowQty / 10))
                    }
                    this.getNextDataChunk()
                    this.update() // For fast response to the above changes
                }
            )

            // // Zoom in:
            // control.onEvent(
            //     ControllerButtonEvent.Pressed,
            //     controller.A.id,
            //     () => {
            //         if (this.selectedXCoordinate == null || this.selectedYCoordinate == null) {
            //             this.selectedXCoordinate = Math.round(this.sensors[this.selectedSensorIndex].getDataBufferLength() / 2)
            //             this.selectedYCoordinate = this.sensors[this.selectedSensorIndex].getNthReading(this.selectedXCoordinate)
            //         }

            //         this.xScrollOffset = Math.round(Screen.HALF_WIDTH - this.selectedXCoordinate)

            //         this.windowHeight = this.windowHeight + (Screen.HEIGHT * 0.5)
            //         this.windowWidth = this.windowWidth + (Screen.WIDTH * 0.5)

            //         this.windowLeftBuffer = this.windowLeftBuffer - (18 * 0.5)
            //         this.windowTopBuffer = this.windowTopBuffer - (5 * 0.5)
            //         this.windowBotBuffer = this.windowBotBuffer - (20 * 0.5)

            //         this.currentZoomDepth += 1
            //     }
            // )

            // // Zoom out, if at default zoom (none), then go back to home
            // control.onEvent(
            //     ControllerButtonEvent.Pressed,
            //     controller.B.id,
            //     () => {
            //         if (this.windowHeight <= Screen.HEIGHT && this.windowWidth <= Screen.WIDTH) {
            //             this.app.popScene()
            //             this.app.pushScene(new Home(this.app))
            //         }
                    
            //         else {
            //             this.xScrollOffset = 0

            //             this.windowHeight = this.windowHeight - (Screen.HEIGHT * 0.5)
            //             this.windowWidth = this.windowWidth - (Screen.WIDTH * 0.5)

            //             this.windowLeftBuffer = this.windowLeftBuffer + (18 * 0.5)
            //             this.windowTopBuffer = this.windowTopBuffer + (5 * 0.5)
            //             this.windowBotBuffer = this.windowBotBuffer + (20 * 0.5)    
                        
            //             this.currentZoomDepth -= 1
            //         }
            //     }
            // )
        }

        /**
         * Used to retrieve the next chunk of data
         * Can be used to intialise this.dataRows
         * Invoked when this.xScrollOffset changes (Left or Right is pressed)
         * Mutates: this.dataRows
         */
        private getNextDataChunk() {
            this.dataRows = []
            const tokens = datalogger.getRows(this.xScrollOffset * 10, (this.xScrollOffset * 10) + 10).split("_");

            // First row returned is the header: Skip it:
            if (this.xScrollOffset == 0) {
                for (let i = NUMBER_OF_COLS; i < tokens.length - NUMBER_OF_COLS; i += NUMBER_OF_COLS) {
                    this.dataRows[(i / NUMBER_OF_COLS) - 1] = tokens.slice(i, i + NUMBER_OF_COLS);
                }
            }

            else {
                for (let i = 0; i < tokens.length - NUMBER_OF_COLS; i += NUMBER_OF_COLS) {
                    this.dataRows[i / NUMBER_OF_COLS] = tokens.slice(i, i + NUMBER_OF_COLS);
                }
            }
        }
        
        /**
         * Request each sensor updates its buffers,
         * Then draw to screen
         */
        update() {
            screen.fill(this.color);
            
            // Make graph region black:
            screen.fillRect(
                this.windowLeftBuffer,
                this.windowTopBuffer + this.yScrollOffset + this.yScrollOffset, 
                Screen.WIDTH - this.windowLeftBuffer - this.windowRightBuffer,
                this.windowHeight - this.windowBotBuffer - 4,
                0
            );

            let color = 8

            // Draw data lines:
            const fromY = this.windowBotBuffer - (2 * this.yScrollOffset)

            let priorXOffset = 0
            let xOffset = 0
            for (let row = 0; row < this.dataRows.length - this.numberOfSensors; row++) {
                const sensorName = this.dataRows[row][0];
                const sensor = SENSOR_LOOKUP_TABLE[sensorName];
                const minimum = sensor.getMinimum()
                const maximum = sensor.getMaximum()

                const norm1 = ((+this.dataRows[row][2] - minimum) / (Math.abs(minimum) + maximum)) * (screen.height - fromY)
                const norm2 = ((+this.dataRows[row + this.numberOfSensors][2] - minimum) / (Math.abs(minimum) + maximum)) * (screen.height - fromY)
            
                const y1 = Math.round(screen.height - norm1) - fromY  
                const y2 = Math.round(screen.height - norm2) - fromY

                if ((row % this.numberOfSensors) == 0) {
                    priorXOffset = xOffset
                    xOffset += this.xCoordinateScalar
                }

                screen.drawLine(
                    this.windowLeftBuffer + priorXOffset,
                    y1,
                    this.windowLeftBuffer + xOffset,
                    y2,
                    color
                );

                color = 8 + (((row - 1) % this.numberOfSensors) % 15)
            }

            // let y = this.windowHeight - this.windowBotBuffer + this.yScrollOffset  + this.yScrollOffset + 15
            // color = 8
            
            // // Write Sensor information, displayed below the plot:
            // for (let i = 0; i < this.numberOfSensors; i++) {
            //     // Colour used to represent this sensor, same colour as plotted & ticker:
            //     y += (i * 12)

            //     screen.fillRect(
            //         0,
            //         y,
            //         7,
            //         7,
            //         color
            //     )

            //     // Name, reading / maximum
            //     screen.print(
            //         this.dataRows[i + 1][0],
            //         12,
            //         y,
            //         color
            //     )

            //     color = 8 + ((i + 1 % this.numberOfSensors) % 15)
            // }

            // Markers & axes:
            this.draw_axes()
        }

        /**
         * Draw x & y axis Double-thickness each, in yellow
         * Draw abscissa and ordinate
         */
        draw_axes() {
            for (let i = 0; i < 2; i++) {
                screen.drawLine(
                    this.windowLeftBuffer,
                    this.windowHeight - this.windowBotBuffer + i + this.yScrollOffset + this.yScrollOffset, 
                    this.windowWidth - this.windowRightBuffer, 
                    this.windowHeight - this.windowBotBuffer + i + this.yScrollOffset + this.yScrollOffset, 
                    5
                );
                screen.drawLine(
                    this.windowLeftBuffer + i, 
                    this.windowTopBuffer + this.yScrollOffset + this.yScrollOffset, 
                    this.windowLeftBuffer + i, 
                    this.windowHeight - this.windowBotBuffer + this.yScrollOffset + this.yScrollOffset, 
                    5
                );
            }

            // Y axis:
            // Bot:
            screen.print(
                this.lowestSensorMinimum.toString(),
                (6 * font.charWidth) - (this.lowestSensorMinimum.toString().length * font.charWidth),
                this.windowHeight - this.windowBotBuffer + this.yScrollOffset + this.yScrollOffset - 4,
                15
            )

            // Top:
            screen.print(
                this.highestSensorMaximum.toString(),
                (6 * font.charWidth) - (this.highestSensorMaximum.toString().length * font.charWidth),
                Screen.HEIGHT - this.windowHeight + this.windowTopBuffer - (0.5 * this.yScrollOffset),
                15
            )

            // X axis:
            // Start
            screen.print(
                (this.xScrollOffset * 10).toString(),
                this.windowLeftBuffer - 2,
                this.windowHeight - this.windowBotBuffer + this.yScrollOffset + this.yScrollOffset + 4,
                15
            )

            // End:
            screen.print(
                ((this.xScrollOffset + 1) * 10).toString(),
                Screen.WIDTH - this.windowRightBuffer - 3,
                this.windowHeight - this.windowBotBuffer + this.yScrollOffset + this.yScrollOffset + 4,
                15
            )
        }
    }
}

