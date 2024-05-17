namespace microcode {
    /**
     * Choose between:
     *      Resetting Datalogger
     *      A tabular view of the recorded data
     *      A graph of the recorded data
     */
    export class DataViewSelect extends CursorSceneWithPriorPage {
        private resetDataLoggerBtn: Button
        private dataViewBtn: Button
        private graphViewBtn: Button
        private dataloggerEmpty: boolean

        constructor(app: App) {
            super(app, function () {app.popScene(); app.pushScene(new Home(this.app))})
        }

        /* override */ startup() {
            super.startup()

            // Includes the header:
            this.dataloggerEmpty = true
            if (datalogger.getNumberOfRows() > 1) {
                this.dataloggerEmpty = false
            }
            
            //---------
            // Control:
            //---------

            // No data in log (first row are headers)
            if (this.dataloggerEmpty) {
                control.onEvent(
                    ControllerButtonEvent.Pressed,
                    controller.A.id,
                    () => {
                        this.app.popScene()
                        this.app.pushScene(new SensorSelect(this.app, CursorSceneEnum.MeasurementConfigSelect))
                    }
                )
            }

            this.resetDataLoggerBtn = new Button({
                parent: null,
                style: ButtonStyles.Transparent,
                icon: "largeSettingsGear",
                ariaId: "Reset Datalogger",
                x: -50,
                y: 30,
                onClick: () => {
                    datalogger.deleteLog()
                    this.dataloggerEmpty = true
                    
                    control.onEvent(
                        ControllerButtonEvent.Pressed,
                        controller.A.id,
                        () => {
                            this.app.popScene()
                            this.app.pushScene(new SensorSelect(this.app, CursorSceneEnum.MeasurementConfigSelect))
                        }
                    )
                },
                boundaryColor: 7,
            })

            this.dataViewBtn = new Button({
                parent: null,
                style: ButtonStyles.Transparent,
                icon: "largeDisk",
                ariaId: "View Data",
                x: 0,
                y: 30,
                onClick: () => {
                    this.app.popScene()
                    this.app.pushScene(new TabularDataViewer(this.app))
                },
                boundaryColor: 7,
            })

            this.graphViewBtn = new Button({
                parent: null,
                style: ButtonStyles.Transparent,
                icon: "linear_graph_2",
                ariaId: "View Graph",
                x: 50,
                y: 30,
                onClick: () => {
                    this.app.popScene()
                    this.app.pushScene(new GraphGenerator(this.app))
                },
                boundaryColor: 7,
            })

            this.navigator.addButtons([this.resetDataLoggerBtn, this.dataViewBtn, this.graphViewBtn])
        }

        draw() {
            Screen.fillRect(
                Screen.LEFT_EDGE,
                Screen.TOP_EDGE,
                Screen.WIDTH,
                Screen.HEIGHT,
                0xC
            )

            if (this.dataloggerEmpty) {
                screen.printCenter("No data has been recorded", 5)
                screen.printCenter("Press A to Record some!", Screen.HALF_HEIGHT)
                return;
            }

            else {
                screen.printCenter("Recorded Data Options", 5)
                this.resetDataLoggerBtn.draw()
                this.dataViewBtn.draw()
                this.graphViewBtn.draw()
            }

            super.draw()
        }
    }
}