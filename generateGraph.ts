namespace microcode {
    /** No information beyond this Y coordinate */
    const MAX_Y_SCOLL = -75

    // //% promise
    // export function downloadData(url:string) {basic.showString("hi :)")}

    export class GraphGenerator extends Scene {
        private windowWidth: number
        private windowHeight: number

        private windowWidthBuffer: number
        private windowTopBuffer: number
        private windowBotBuffer: number

        private yScrollOffset: number

        constructor(app: App) {
            super(app, "graphGeneration")
            this.color = 0

            this.windowWidth = Screen.WIDTH
            this.windowHeight = Screen.HEIGHT

            this.windowWidthBuffer = 18 
            this.windowTopBuffer = 5
            this.windowBotBuffer = 20

            this.yScrollOffset = 0

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

            // microcode.downloadData("a")
        }

        /**
         * Request each sensor updates its buffers,
         * Then draw to screen
         */
        update() {
            screen.fill(this.color);

            this.plot()
            basic.pause(100);
        }

        /**
         * Display mode for plotting all incoming data on y axis
         */
        private plot() {            
            let color = 8

            this.draw_axes()

            // Draw data lines:
            const fromY = this.windowBotBuffer - 2 * this.yScrollOffset
            const fromX = this.windowWidthBuffer + 2

            for (let row = 1; row < FauxDataLogger.numberOfRows - FauxDataLogger.sensors.length; row++) {
                const minimum = FauxDataLogger.sensors[(row - 1) % FauxDataLogger.sensors.length].minimum
                const maximum = FauxDataLogger.sensors[(row - 1) % FauxDataLogger.sensors.length].maximum

                const norm1 = ((+FauxDataLogger.entries[row].data[2] - minimum) / (Math.abs(minimum) + maximum)) * (screen.height - fromY)
                const norm2 = ((+FauxDataLogger.entries[row + FauxDataLogger.sensors.length].data[2] - minimum) / (Math.abs(minimum) + maximum)) * (screen.height - fromY)
            
                const y1 = Math.round(screen.height - norm1) - fromY  
                const y2 = Math.round(screen.height - norm2) - fromY

                // Minimal data smoothing:
                if (Math.abs(y1 - y2) <= Sensor.PLOT_SMOOTHING_CONSTANT) {
                    screen.drawLine(fromX + row, y1, fromX + row - 1, y1, color);
                }

                screen.drawLine(fromX + row, y1, fromX + row - 1, y2, color);

                color = 8 + (((row - 1) % FauxDataLogger.sensors.length) % 15)
            }


            const yStart = this.windowHeight - this.windowBotBuffer + this.yScrollOffset  + this.yScrollOffset + 15
            let y = yStart
            
            // Write Sensor information, displayed below the plot:
            for (let i = 0; i < FauxDataLogger.sensors.length; i++) {
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
                    // FauxDataLogger.sensors[i].name + " " + FauxDataLogger.sensors[i].getReading() + "/" + FauxDataLogger.sensors[i].maximum,
                    FauxDataLogger.sensors[i].name,
                    14,
                    y,
                    color
                )

                // Write the peak reading just below and with a slight xOffset from the above:
                y += 12
                screen.print(
                    "Peak " + FauxDataLogger.sensors[i].peakDataPoint[1], 
                    44,
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

