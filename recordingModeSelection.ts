namespace microcode {
    export class RecordingModeSelection extends CursorScene {
        private btns: Button[]

        constructor(app: App) {
            super(app)

            const recordTimeBtn = new Button({
                parent: null,
                style: ButtonStyles.Transparent,
                icon: "edit_program",
                ariaId: "Measurement Mode",
                x: -30,
                y: 30,
                onClick: () => {
                    this.app.popScene()
                    this.app.pushScene(new SensorSelect(this.app, CursorSceneEnum.MeasurementConfigSelect))
                },
            })

            const recordEventBtn = new Button({
                parent: null,
                style: ButtonStyles.Transparent,
                icon: "edit_program",
                ariaId: "Event Mode",
                x: 30,
                y: 30,
                onClick: () => {
                    this.app.popScene()
                    this.app.pushScene(new SensorSelect(this.app, CursorSceneEnum.EventConfigSelect))
                },
            })

            this.btns = [recordTimeBtn, recordEventBtn]
            this.navigator.addButtons(this.btns)
        }

        update() {
            Screen.fillRect(
                Screen.LEFT_EDGE,
                Screen.TOP_EDGE,
                Screen.WIDTH,
                Screen.HEIGHT,
                0xc
            )

            screen.printCenter("Select the Measurement Mode", 10)

            for (let i = 0; i < this.btns.length; ++i) {
                this.btns[i].draw()
            }
        }
    }
}