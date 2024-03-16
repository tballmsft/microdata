namespace microcode {
    export class GraphGenerator extends Scene {
        private windowWidth: number
        private windowHeight: number

        private windowWidthBuffer: number
        private windowTopBuffer: number
        private windowBotBuffer: number

        constructor(app: App) {
            super(app, "graphGeneration")
            this.color = 0

            this.windowWidth = Screen.WIDTH
            this.windowHeight = Screen.HEIGHT

            this.windowWidthBuffer = 18 
            this.windowTopBuffer = 5
            this.windowBotBuffer = 20
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
            const fromY = this.windowBotBuffer
            const fromX = this.windowWidthBuffer + 2

            for (let col = 1; col < FauxDataLogger.headers.length; col++) {
                const minimum = FauxDataLogger.sensors[col - 1].minimum
                const maximum = FauxDataLogger.sensors[col - 1].maximum

                for (let row = 0; row < FauxDataLogger.numberOfRows - 1; row++) {
                    const norm1 = ((+FauxDataLogger.entries[row].data[col] - minimum) / (Math.abs(minimum) + maximum)) * (screen.height - fromY)
                    const norm2 = ((+FauxDataLogger.entries[row + 1].data[col] - minimum) / (Math.abs(minimum) + maximum)) * (screen.height - fromY)
                
                    const y1 = Math.round(screen.height - norm1) - fromY
                    const y2 = Math.round(screen.height - norm2) - fromY

                    // Minimal data smoothing:
                    if (Math.abs(y1 - y2) <= Sensor.PLOT_SMOOTHING_CONSTANT) {
                        screen.drawLine(fromX + row, y1, fromX + row - 1, y1, color);
                    }
    
                    screen.drawLine(fromX + row, y1, fromX + row - 1, y2, color);
                }
                color = (color + 1) % 15
            }
        }

        /**
         * 2 Axis of Double-thickness each, in yellow
         */
        draw_axes() {
            for (let i = 0; i < 2; i++) {
                screen.drawLine(
                    this.windowWidthBuffer,
                    this.windowHeight - this.windowBotBuffer + i, 
                    this.windowWidth - this.windowWidthBuffer, 
                    this.windowHeight - this.windowBotBuffer + i, 
                    5
                );
                screen.drawLine(
                    this.windowWidthBuffer, 
                    this.windowTopBuffer, 
                    this.windowWidthBuffer, 
                    this.windowHeight - this.windowBotBuffer, 
                    5
                );
            }
        }
    }
}