namespace microcode {
    const MAX_ROWS = 9
    const MAX_COLS = 3

    export const enum DATA_VIEW_DISPLAY_MODE {
        META_DATA_VIEW,
        DATA_VIEW,
        GRAPH_VIEW,
    }
    
    export class TabularDataViewer extends Scene {
        private guiState: DATA_VIEW_DISPLAY_MODE
        private xScrollOffset: number
        private yScrollOffset: number

        private numberOfMetadataRows: number

        constructor(app: App, saveSlot: number, guiState: DATA_VIEW_DISPLAY_MODE) {
            super(app, "recordedDataViewer")
            this.guiState = guiState

            this.xScrollOffset = 0
            this.yScrollOffset = 0

            this.numberOfMetadataRows = 4 + FauxDataLogger.headers.length
        }

        /* override */ startup() {
            super.startup()

            //----------
            // Controls:
            //----------

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.B.id,
                () => {
                    app.popScene()
                    app.pushScene(new DataViewSelect(this.app))
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.up.id,
                () => {
                    this.xScrollOffset = Math.max(this.xScrollOffset - 1, 0)
                }
            )


            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.down.id,
                () => {
                    if (this.xScrollOffset + 5 < this.numberOfMetadataRows) {
                        this.xScrollOffset += 1
                    }
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.left.id,
                () => {
                    this.yScrollOffset = Math.max(this.yScrollOffset - 1, 0)
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.right.id,
                () => {
                    if (this.yScrollOffset + MAX_COLS < FauxDataLogger.headers.length) {
                        this.yScrollOffset += 1
                    }
                }
            )

        }

        draw_grid() {
            const colBufferSize = Screen.WIDTH / Math.min(FauxDataLogger.headers.length, MAX_COLS) 
            const rowBufferSize = Screen.HEIGHT / Math.min(FauxDataLogger.numberOfRows, MAX_ROWS)

            for (let colOffset = 0; colOffset <= Screen.WIDTH; colOffset+=colBufferSize) {
                Screen.drawLine(
                    Screen.LEFT_EDGE + colOffset,
                    Screen.TOP_EDGE,
                    Screen.LEFT_EDGE + colOffset,
                    Screen.HEIGHT,
                    0x0
                )
            }

            for (let rowOffset = 0; rowOffset <= Screen.HEIGHT; rowOffset+=rowBufferSize) {
                Screen.drawLine(
                    Screen.LEFT_EDGE,
                    Screen.TOP_EDGE + rowOffset,
                    Screen.WIDTH,
                    Screen.TOP_EDGE + rowOffset,
                    0x0
                )
            }
        }

        draw() {
            Screen.fillRect(
                Screen.LEFT_EDGE,
                Screen.TOP_EDGE,
                Screen.WIDTH,
                Screen.HEIGHT,
                0xC
            )

            switch (this.guiState) {
                case DATA_VIEW_DISPLAY_MODE.META_DATA_VIEW:
                    const rowSize = 6
                    const colSize = Screen.WIDTH / 2
                    const rowDelta = Screen.HEIGHT / rowSize

                    for (let colOffset = 0; colOffset <= Screen.WIDTH; colOffset+=colSize) {
                        Screen.drawLine(
                            Screen.LEFT_EDGE + colOffset,
                            Screen.TOP_EDGE,
                            Screen.LEFT_EDGE + colOffset,
                            Screen.HEIGHT,
                            0x0
                        )
                    }
        
                    for (let rowOffset = 0; rowOffset <= Screen.HEIGHT; rowOffset+=rowDelta) {
                        Screen.drawLine(
                            Screen.LEFT_EDGE,
                            Screen.TOP_EDGE + rowOffset,
                            Screen.WIDTH,
                            Screen.TOP_EDGE + rowOffset,
                            0x0
                        )
                    }

                    let metadata = []

                    if (FauxDataLogger.headers.length == 2) {
                        metadata = [
                            {col1: "Taken", col2: FauxDataLogger.dateStamp}, 
                            {col1: "Rows", col2: FauxDataLogger.numberOfRows.toString()}, 
                            {col1: "Columns", col2: FauxDataLogger.headers.length.toString()},
                            {col1: "Col1: Time", col2: FauxDataLogger.headers[0]}, 
                            {col1: "Col2: Sensor", col2: FauxDataLogger.headers[1]}, 
                            {col1: "Period", col2: FauxDataLogger.measurementOptions.period.toString()}, 
                        ]
                    } else {
                        metadata = [
                            {col1: "Taken", col2: FauxDataLogger.dateStamp}, 
                            {col1: "Rows", col2: FauxDataLogger.numberOfRows.toString()}, 
                            {col1: "Columns", col2: FauxDataLogger.headers.length.toString()},
                            {col1: "Col1: Time", col2: FauxDataLogger.headers[0]}, 
                            {col1: "Col2: Sensor", col2: FauxDataLogger.headers[1]}, 
                            {col1: "Col3: Sensor", col2: FauxDataLogger.headers[2]}, 
                            {col1: "Period", col2: FauxDataLogger.measurementOptions.period.toString()}, 
                        ]
                    }

                    for (let row = 0; row < rowSize; row++) {
                        Screen.print(
                            metadata[row + this.xScrollOffset].col1,
                            Screen.LEFT_EDGE + (colSize / 2) - ((font.charWidth * metadata[row + this.xScrollOffset].col1.length) / 2),
                            Screen.TOP_EDGE + (row * rowDelta) + (rowDelta / 2) - 4,
                            0xb,
                            simage.font8
                        )
                        
                        Screen.print(
                            metadata[row + this.xScrollOffset].col2,
                            Screen.LEFT_EDGE + colSize + (colSize / 2) - ((font.charWidth * metadata[row + this.xScrollOffset].col2.length) / 2),
                            Screen.TOP_EDGE + (row * rowDelta) + (rowDelta / 2) - 4,
                            0xb,
                            simage.font8
                        )
                    }
                    break;

                case DATA_VIEW_DISPLAY_MODE.DATA_VIEW:
                    this.draw_grid()

                    const colSizeBuffer = Screen.WIDTH / Math.min(MAX_COLS, FauxDataLogger.headers.length)
                    const rowDeltaBuffer = Screen.HEIGHT / Math.min(MAX_ROWS, FauxDataLogger.numberOfRows)
                    
                    for (let row = 0; row < Math.min(FauxDataLogger.numberOfRows, MAX_ROWS); row++) {
                        const data = FauxDataLogger.values[row + this.xScrollOffset].data;

                        for (let col = 0; col < Math.min(FauxDataLogger.headers.length, MAX_COLS); col++) {
                            const colID = col + this.yScrollOffset
                            Screen.print(
                                data[colID],
                                Screen.LEFT_EDGE + (col * colSizeBuffer) + (colSizeBuffer / 2) - ((font.charWidth * data[colID].length) / 2),
                                Screen.TOP_EDGE + (row * rowDeltaBuffer) + (rowDeltaBuffer / 2) - 4,
                                0xb,
                                simage.font8
                            )
                        }
                    }
                    break;
            
                default:
                    break;
            }

            super.draw()
        }
    }
}