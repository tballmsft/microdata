namespace microcode {
    /** No information beyond this Y coordinate */
    const MAX_Y_SCOLL = -75

    export class GraphGenerator extends Scene {
        private dataRows: string[][];
        private numberOfCols: number;
        private numberOfSensors: number;

        private windowWidth: number
        private windowHeight: number

        private windowWidthBuffer: number
        private windowTopBuffer: number
        private windowBotBuffer: number

        private yScrollOffset: number
        private xCoordinateScalar: number;

        constructor(app: App) {
            super(app, "graphGeneration")
            this.color = 0

            this.windowWidth = Screen.WIDTH
            this.windowHeight = Screen.HEIGHT

            this.windowWidthBuffer = 18 
            this.windowTopBuffer = 5
            this.windowBotBuffer = 20

            this.yScrollOffset = 0

            this.dataRows = []
            const tokens = datalogger.getData().split("_")
            this.numberOfCols = 4
            
            // Skip the first column of each row (Time (Seconds)):
            for (let i = 0; i < tokens.length - this.numberOfCols; i += this.numberOfCols) {
                this.dataRows[i / this.numberOfCols] = tokens.slice(i, i + this.numberOfCols);
            }

            // Count until sensor name is repeated:
            const firstSensor = this.dataRows[1][0] // Skip first row (headers)
            this.numberOfSensors = 1

            // Go from second sensor onward (3rd row):
            for (let rowID = 2; rowID < this.dataRows.length; rowID++) {
                // First element in row is the sensor:
                if (this.dataRows[rowID][0] != firstSensor) {
                    this.numberOfSensors += 1
                }

                else {
                    break
                }
            }

            this.xCoordinateScalar = 1
            if (this.dataRows.length < Screen.WIDTH) {
                this.xCoordinateScalar = Math.round((Screen.WIDTH - (2 * this.windowWidthBuffer)) / this.dataRows.length)
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
                    this.yScrollOffset = Math.max(this.yScrollOffset - 20, MAX_Y_SCOLL)
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
            this.draw_axes()

            let color = 8

            // Draw data lines:
            const fromY = (this.windowBotBuffer - 2) * this.yScrollOffset
            const fromX = this.windowWidthBuffer + 2

            for (let row = 1; row < this.dataRows.length - this.numberOfSensors; row++) {
                const sensorName = this.dataRows[row][0];
                const sensor = SENSOR_LOOKUP_TABLE[sensorName];
                const minimum = sensor.minimum
                const maximum = sensor.maximum

                const norm1 = ((+this.dataRows[row][2] - minimum) / (Math.abs(minimum) + maximum)) * (screen.height - fromY)
                const norm2 = ((+this.dataRows[row + this.numberOfSensors][2] - minimum) / (Math.abs(minimum) + maximum)) * (screen.height - fromY)
            
                const y1 = Math.round(screen.height - norm1) - fromY  
                const y2 = Math.round(screen.height - norm2) - fromY

                // Minimal data smoothing:
                if (Math.abs(y1 - y2) <= Sensor.PLOT_SMOOTHING_CONSTANT) {
                    screen.drawLine(fromX + (row * this.xCoordinateScalar), y1, fromX + ((row - 1) * this.xCoordinateScalar), y1, color);
                }
                screen.drawLine(fromX + (row * this.xCoordinateScalar), y1, fromX + ((row - 1) * this.xCoordinateScalar), y2, color);

                color = 8 + (((row - 1) % this.numberOfSensors) % 15)
            }

            screen.print(
                ((this.dataRows.length - 1) / this.numberOfSensors).toString(),
                fromX + this.dataRows.length + 1,
                this.windowHeight - this.windowBotBuffer + this.yScrollOffset + this.yScrollOffset + 2,
                1
            )

            const yStart = this.windowHeight - this.windowBotBuffer + this.yScrollOffset  + this.yScrollOffset + 15
            let y = yStart
            
            // Write Sensor information, displayed below the plot:
            for (let i = 0; i < this.numberOfSensors; i++) {
                // Colour used to represent this sensor, same colour as plotted & ticker:
                y += (i * 12)

                screen.fillRect(
                    2,
                    y,
                    7,
                    7,
                    color
                )

                // Name, reading / maximum
                screen.print(
                    this.dataRows[i + 1][0],
                    14,
                    y,
                    color
                )

                color = (color + 3) % 15
            }
        }

        /**
         * 2 Axis of Double-thickness each, in yellow
         */
        draw_axes() {
            for (let i = 0; i < 2; i++) {
                screen.drawLine(
                    this.windowWidthBuffer,
                    this.windowHeight - this.windowBotBuffer + i + this.yScrollOffset + this.yScrollOffset, 
                    this.windowWidth - this.windowWidthBuffer, 
                    this.windowHeight - this.windowBotBuffer + i + this.yScrollOffset + this.yScrollOffset, 
                    5
                );
                screen.drawLine(
                    this.windowWidthBuffer + i, 
                    this.windowTopBuffer + this.yScrollOffset + this.yScrollOffset, 
                    this.windowWidthBuffer + i, 
                    this.windowHeight - this.windowBotBuffer + this.yScrollOffset + this.yScrollOffset, 
                    5
                );
            }
        }
    }
}

