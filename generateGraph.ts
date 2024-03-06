namespace microcode {
    /** No information beyond this Y coordinate */
    const MAX_Y_SCOLL = -75

    /**
     * One of the 3 main functionalities of MicroData
     * Allows for the live feed of a sensor to be plotted,
     *      Multiple sensors may be plotted at once
     *      Display modes may be toggled per sensor
     */
    export class GraphGenerator extends Scene {
        private windowWidth: number
        private windowHeight: number

        private windowWidthBuffer: number
        private windowTopBuffer: number
        private windowBotBuffer: number

        constructor(app: App) {
            super(app, "liveDataViewer")
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

            // this.sensors.forEach(function(sensor) {
            //     sensor.readIntoBuffer()
            // })

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

                color = (color + 1) % 15
            }

            // Draw data lines:
            color = 8;
            this.sensors.forEach(function(sensor) {
                sensor.draw(this.windowWidthBuffer + 2 + this.xScrollOffset, this.windowBotBuffer - this.yScrollOffset - this.yScrollOffset, color)
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