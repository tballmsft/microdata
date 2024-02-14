namespace microcode {
    const HEADER_OFFSET = 25
    const MAX_ROWS = 10

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

        draw_grid() {
            const colBufferSize = Screen.WIDTH / FauxDataLogger.headers.length
            const rowBufferSize = Screen.HEIGHT / Math.min(MAX_ROWS, FauxDataLogger.numberOfRows)

            for (let colOffset = 0; colOffset <= Screen.WIDTH; colOffset+=colBufferSize) {
                Screen.drawLine(
                    Screen.LEFT_EDGE + colOffset,
                    Screen.TOP_EDGE + HEADER_OFFSET,
                    Screen.LEFT_EDGE + colOffset,
                    Screen.HEIGHT,
                    0x0
                )
            }

            for (let rowOffset = HEADER_OFFSET; rowOffset <= Screen.HEIGHT; rowOffset+=rowBufferSize) {
                Screen.drawLine(
                    Screen.LEFT_EDGE,
                    Screen.TOP_EDGE + rowOffset,
                    Screen.WIDTH,
                    Screen.TOP_EDGE + rowOffset,
                    0x0
                )
            }
        }

        update() {
            Screen.fillRect(
                Screen.LEFT_EDGE,
                Screen.TOP_EDGE,
                Screen.WIDTH,
                Screen.HEIGHT,
                0xC
            )
            
            FauxDataLogger.numberOfRows = 5
            this.draw_grid()

            for (let i = 0; i < FauxDataLogger.headers.length; i++) {
                const textOffset = (screen.width - (font.charWidth * FauxDataLogger.headers[i].length)) / 4
                Screen.print(
                    FauxDataLogger.headers[i],
                    Screen.LEFT_EDGE + textOffset + (i * 80) - 4,
                    Screen.TOP_EDGE + 4,
                    0xb,
                    simage.font8
                )
            }

            interface IDictionary {[index: string]: number;}
            const data: IDictionary = {"1" : 1, "2" : 2, "3": 3, "4": 4, "5": 5}

            const colBufferSize = Screen.WIDTH / FauxDataLogger.headers.length
            const rowOffsetDelta = Screen.HEIGHT / Math.min(MAX_ROWS, FauxDataLogger.numberOfRows)
            let rowOffset = 0

            Object.keys(FauxDataLogger.data).forEach(
                key => {
                    Screen.print(
                        key,
                        Screen.LEFT_EDGE + (colBufferSize / 2) - ((font.charWidth * key.length) / 2),
                        Screen.TOP_EDGE + HEADER_OFFSET + rowOffset + (rowOffsetDelta / 2) - 4,
                        0xb,
                        simage.font8
                    )

                    const sensorData = FauxDataLogger.data[key].toString().slice(0, 4)
                    Screen.print(
                        sensorData,
                        Screen.LEFT_EDGE + colBufferSize + (colBufferSize / 2) - ((font.charWidth *sensorData.length) / 2),
                        Screen.TOP_EDGE + HEADER_OFFSET + rowOffset + (rowOffsetDelta / 2) - 4,
                        0xb,
                        simage.font8
                    )
                    rowOffset += rowOffsetDelta
                }
            )
        }
    }
}
