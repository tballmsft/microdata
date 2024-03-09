namespace microcode {
    const PLOT_SMOOTHING_CONSTANT = 8

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
            let color = 8;

            this.draw_axes();

            // // Write Sensor information, displayed below the plot:
            // for (let i = 0; i < FauxDataLogger.headers.length; i++) {
            //     // Colour used to represent this sensor, same colour as plotted & ticker:
            //     screen.fillRect(
            //         2,
            //         this.windowHeight - this.windowBotBuffer + 15 + (i * 12),
            //         7,
            //         7,
            //         color
            //     )
                
            //     // Name, reading / maximum, peak
            //     screen.print(FauxDataLogger.headers[i], 
            //         14,
            //         this.windowHeight - this.windowBotBuffer + 15 + (i * 12),
            //         color
            //     )

            //     color = (color + 1) % 15
            // }

            // Draw data lines:
            color = 8;
            let x = 0
            let xOffset = this.windowWidthBuffer / FauxDataLogger.numberOfRows

            FauxDataLogger.values.forEach(function(metadata) {
                    // const y1 = Math.round(screen.height - ((metadata.data[1] / this.maxReading) * (screen.height - this.windowBotBuffer))) - this.windowBotBuffer
                    // const y2 = Math.round(screen.height - ((Number(metadata.data[1]) / this.maxReading) * (screen.height - this.windowBotBuffer))) - this.windowBotBuffer
    
                    // if (this.dataBuffer[i] > this.peakDataPoint[1]) {
                    //     this.peakDataPoint = [i, this.dataBuffer[i]]
                    // }
    
                    // Minimal data smoothing:
                    // if (Math.abs(y1 - y2) <= PLOT_SMOOTHING_CONSTANT) {
                    // screen.drawLine(this.windowWidthBuffer + x, y1, this.windowWidthBuffer + x - 1, y1, color);
                    // }


                    x += xOffset

                    // const y1 = Math.round(screen.height - ((this.dataBuffer[i] / this.maxReading) * (screen.height - this.windowBotBuffer))) - this.windowBotBuffer
                    // const y2 = Math.round(screen.height - ((this.dataBuffer[i + 1] / this.maxReading) * (screen.height - this.windowBotBuffer))) - this.windowBotBuffer
    
                    // if (this.dataBuffer[i] > this.peakDataPoint[1]) {
                    //     this.peakDataPoint = [i, this.dataBuffer[i]]
                    // }
    
                    // // Minimal data smoothing:
                    // if (Math.abs(y1 - y2) <= PLOT_SMOOTHING_CONSTANT) {
                    //     screen.drawLine(this.windowWidthBuffer + i, y1, this.windowWidthBuffer + i - 1, y1, color);
                    // }
    
                    // screen.drawLine(this.windowWidthBuffer + i, y1, this.windowWidthBuffer + i - 1, y2, color);

                color = (color + 1) % 15
            })
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