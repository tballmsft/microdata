namespace microcode {
    /**
     * Responsible for allowing the user to select any number of sensors.
     *      These sensors are passed to either the measurement screen or the live data view
     * 
     * More buttons may be added to support additional sensors
     */
    export class ClearDataLoggerScreen extends CursorSceneWithPriorPage {
        private btns: Button[]
        
        constructor(app: App) {
            super(app, function () {app.popScene(); app.pushScene(new Home(this.app))})
            this.btns = []
        }

        /* override */ startup() {
            super.startup()

            // Log has data in it
            // const numberOfColumns = 5
            // basic.showNumber(datalogger.getData().split("_").length - 1)
            // (datalogger.getData().split("_").length - 1) / numberOfColumns <= 1

            this.btns.push(new Button({
                parent: null,
                style: ButtonStyles.FlatWhite,
                icon: "tile_button_a",
                ariaId: "Yes",
                x: -30,
                y: 20,
                onClick: () => {
                    datalogger.deleteLog()
                    this.app.popScene()
                    this.app.pushScene(new SensorSelect(this.app, CursorSceneEnum.MeasurementConfigSelect))
                },    
            }))

            this.btns.push(new Button({
                parent: null,
                style: ButtonStyles.FlatWhite,
                icon: "tile_button_b",
                ariaId: "No",
                x: 35,
                y: 20,
                onClick: () => {
                    this.app.popScene()
                    this.app.pushScene(new SensorSelect(this.app, CursorSceneEnum.MeasurementConfigSelect))
                },    
            }))
            this.navigator.addButtons(this.btns)
        }

        //---------
        // Control:
        //---------
        
        draw() {
            Screen.fillRect(
                Screen.LEFT_EDGE,
                Screen.TOP_EDGE,
                Screen.WIDTH,
                Screen.HEIGHT,
                0xc
            )

            screen.printCenter("Sensor Selection", 4)
            const headerX = Screen.HALF_WIDTH // Log has data in it

            // Outline:
            screen.fillRect(
                Screen.HALF_WIDTH - 70,
                Screen.HALF_HEIGHT - 40,
                140,
                90,
                15 // Black
            )

            screen.fillRect(
                Screen.HALF_WIDTH - 70 + 3,
                Screen.HALF_HEIGHT - 40 + 3,
                140 - 6,
                90 - 6,
                4 // Orange
            ) 

            const tutorialTextLength = ("Clear the data log?".length * font.charWidth)
            screen.print(
                "Clear the data log?",
                headerX - (tutorialTextLength / 2),
                Screen.HALF_HEIGHT - 40 + 7,
                15 // Black
            )
            
            // Underline the title:
            screen.fillRect(
                headerX - (tutorialTextLength / 2) + 2,
                Screen.HALF_HEIGHT - 40 + 25,
                tutorialTextLength - (1 * font.charWidth),
                2,
                15 // Black
            )

            for (let i = 0; i < this.btns.length; i++) {
                this.btns[i].draw()
            }
            super.draw() 
        }
    }
}