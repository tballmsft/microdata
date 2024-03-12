namespace microcode {
    /**
     * Display limits
     * Data in excess will require scrolling to view
     */
    const TABULAR_MAX_ROWS = 9
    const TABULAR_MAX_COLS = 3
    const METADATA_MAX_ROWS = 6

    export const enum DATA_VIEW_DISPLAY_MODE {
        METADATA_VIEW,
        TABULAR_DATA_VIEW,
    }
    

    /**
     * Used to view the recorded data & its meta data
     */
    export class TabularDataViewer extends Scene {
        private guiState: DATA_VIEW_DISPLAY_MODE
        private xScrollOffset: number
        private yScrollOffset: number

        private numberOfMetadataRows: number

        constructor(app: App, guiState: DATA_VIEW_DISPLAY_MODE) {
            super(app, "recordedDataViewer")
            this.guiState = guiState

            this.xScrollOffset = 0
            this.yScrollOffset = 0

            this.numberOfMetadataRows = FauxDataLogger.getNumberOfMetadataRows()
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
                    this.yScrollOffset = Math.max(this.xScrollOffset - 1, 0)
                }
            )


            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.down.id,
                () => {
                    if (this.guiState === DATA_VIEW_DISPLAY_MODE.METADATA_VIEW) {
                        if (this.yScrollOffset + 1 < this.numberOfMetadataRows - METADATA_MAX_ROWS) {
                            this.yScrollOffset += 1
                        }
                    }

                    else {
                        if (this.yScrollOffset + 1 < FauxDataLogger.numberOfRows - TABULAR_MAX_ROWS) {
                            this.yScrollOffset += 1
                        }
                    }
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.left.id,
                () => {
                    this.xScrollOffset = Math.max(this.xScrollOffset - 1, 0)
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.right.id,
                () => {
                    if (this.xScrollOffset + TABULAR_MAX_COLS < FauxDataLogger.headers.length) {
                        this.xScrollOffset += 1
                    }
                }
            )

        }

        draw_grid() {
            const colBufferSize = Screen.WIDTH / Math.min(FauxDataLogger.headers.length, TABULAR_MAX_COLS) 
            const rowBufferSize = Screen.HEIGHT / Math.min(FauxDataLogger.numberOfRows, TABULAR_MAX_ROWS)

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
                case DATA_VIEW_DISPLAY_MODE.METADATA_VIEW:
                    const colSize = Screen.WIDTH / 2
                    const rowDelta = Screen.HEIGHT / METADATA_MAX_ROWS

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

                    const metadata = FauxDataLogger.getMetadata()

                    for (let row = 0; row < METADATA_MAX_ROWS; row++) {
                        Screen.print(
                            metadata[row + this.yScrollOffset].col1,
                            Screen.LEFT_EDGE + (colSize / 2) - ((font.charWidth * metadata[row + this.yScrollOffset].col1.length) / 2),
                            Screen.TOP_EDGE + (row * rowDelta) + (rowDelta / 2) - 4,
                            0xb,
                            simage.font8
                        )
                        
                        Screen.print(
                            metadata[row + this.yScrollOffset].col2,
                            Screen.LEFT_EDGE + colSize + (colSize / 2) - ((font.charWidth * metadata[row + this.yScrollOffset].col2.length) / 2),
                            Screen.TOP_EDGE + (row * rowDelta) + (rowDelta / 2) - 4,
                            0xb,
                            simage.font8
                        )
                    }
                    break;

                case DATA_VIEW_DISPLAY_MODE.TABULAR_DATA_VIEW:
                    this.draw_grid()

                    const colSizeBuffer = Screen.WIDTH / Math.min(TABULAR_MAX_COLS, FauxDataLogger.headers.length)
                    const rowDeltaBuffer = Screen.HEIGHT / Math.min(TABULAR_MAX_ROWS, FauxDataLogger.numberOfRows)
                    
                    for (let row = 0; row < Math.min(FauxDataLogger.numberOfRows, TABULAR_MAX_ROWS); row++) {
                        const data = FauxDataLogger.values[row + this.yScrollOffset].data;

                        for (let col = 0; col < Math.min(FauxDataLogger.headers.length, TABULAR_MAX_COLS); col++) {
                            const colID = col + this.xScrollOffset
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