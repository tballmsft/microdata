namespace microcode {
    /**
     * Grant the user the option to clear the contents stored on the data logger.
     * Inbetween Home and SensorSelect
     */
    export class ClearDataLoggerScreen extends CursorSceneWithPriorPage {
        private btns: Button[]
        private currentlyDeleting: boolean
        
        constructor(app: App) {
            super(app, function () {app.popScene(); app.pushScene(new Home(this.app))})
            this.btns = []
            this.currentlyDeleting = false

            // Data logger already empty:
            if (datalogger.getNumberOfRows() <= 1) {
                this.app.popScene()
                this.app.pushScene(new SensorSelect(this.app, CursorSceneEnum.MeasurementConfigSelect))
            }
        }

        /* override */ startup() {
            super.startup()

            this.btns.push(new Button({
                parent: null,
                style: ButtonStyles.FlatWhite,
                icon: "tile_button_a",
                ariaId: "Yes",
                x: -30,
                y: 20,
                onClick: () => {
                    this.currentlyDeleting = true
                    datalogger.deleteLog(datalogger.DeleteType.Fast)
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

            if (this.currentlyDeleting) {
                screen.printCenter("Deleting data...", Screen.HALF_HEIGHT - 9, 15)
            }

            for (let i = 0; i < this.btns.length; i++) {
                this.btns[i].draw()
            }
            super.draw() 
        }
    }
}