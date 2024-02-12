namespace microcode {
    export class RecordedDataViewer extends Scene {
        constructor(app: App) {
            super(app, "dataViewer")

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.B.id,
                () => {
                    app.popScene()
                    app.pushScene(new Home(app))
                }
            )
        }

        update() {
            Screen.fillRect(
                Screen.LEFT_EDGE,
                Screen.TOP_EDGE,
                Screen.WIDTH,
                Screen.HEIGHT,
                0xc
            )

            const text: string = datalogger.readRow(0)
            screen.printCenter(text, 10)
        }
    }
}
