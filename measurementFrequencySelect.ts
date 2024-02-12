namespace microcode {
    export class FrequencySelect extends Scene {
        private selectedSensor: () => number
        private sensorName: string
        private numberOfMeasurements: number = 5
        private measurementFrequencyMs: number = 1000

        private minuteSprite: Sprite
        
        constructor(app: App, opts: {sensorFn: () => number, sensorName: string}) {
            super(app, "frequencySelect")

            this.selectedSensor = opts.sensorFn
            this.sensorName = opts.sensorName

            const goBack = function() {
                app.popScene()
                app.pushScene(new Home(app))
            };
            
            const img = microcode.icons.get("linear_graph")

            this.minuteSprite = new Sprite({
                parent: null,
                img,
            })
        }

        /* override */ startup() {
            super.startup()
        
        }

        /* override */ activate() {
            super.activate()
            this.color = 15
        }

        draw() {
            Screen.fillRect(
                Screen.LEFT_EDGE,
                Screen.TOP_EDGE,
                Screen.WIDTH,
                Screen.HEIGHT,
                0xc
            )
            
            this.minuteSprite.draw()
            super.draw()
        }
    }
}