namespace microcode {
    const WIDTH_BUFFER = 16;
    const HEIGHT_BUFFER = 12;

    export class LiveDataViewer extends Scene {
        private dataBuffer: number[] = [];
        private bufferLimit = screen.width - (2 * WIDTH_BUFFER);
        private sensorFn: () => number
        private sensorName: string

        constructor(app: App, userOpts: {sensorFn: () => number, sensorName: string}) {
            super(app, "liveDataViewer")
            this.color = 0
            this.sensorFn = userOpts.sensorFn
            this.sensorName = userOpts.sensorName

            const goBack = function() {
                app.popScene()
                app.pushScene(new Home(app))
            };

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.B.id,
                () => goBack()
            )
        }

        update() {
            // Pre-process and convert lightlevel into a y value; relative to screen-height
            let light_level = this.sensorFn() / 255;
            let y = Math.round(screen.height - (light_level * (screen.height - HEIGHT_BUFFER))) - HEIGHT_BUFFER

            // Buffer management:
            if (this.dataBuffer.length >= this.bufferLimit) {
                this.dataBuffer.shift();
            }
            this.dataBuffer.push(y);

            // Draw:
            screen.fill(this.color);
            this.plot()

            basic.pause(100);
        }

        /**
         * Display mode for plotting all incoming data on y axis
         * Presumes pre-processed this.dataBuffer; y values relative to screen.height
         * Bound to Microbit button A
         */
        private plot() {
            screen.printCenter(this.sensorName, 10)
            this.draw_axes();

            const start = WIDTH_BUFFER + 2;
            for (let i = 0; i < this.dataBuffer.length - 1; i++) {
                screen.drawLine(start + i, this.dataBuffer[i], start + i - 1, this.dataBuffer[i + 1], 9);
            }
        }

        // Display helper:
        draw_axes() {
            for (let i = 0; i < 2; i++) {
                screen.drawLine(WIDTH_BUFFER, screen.height - HEIGHT_BUFFER + i, screen.width - WIDTH_BUFFER, screen.height - HEIGHT_BUFFER + i, 5);
                screen.drawLine(WIDTH_BUFFER + i, HEIGHT_BUFFER, WIDTH_BUFFER + i, screen.height - HEIGHT_BUFFER, 5);
            }
        }
    }
}