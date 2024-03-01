namespace microcode {
    const HEADER_OFFSET = 17
    const MAX_ROWS = 10

    const enum DISPLAY_MODE {
        META_DATA_VIEW,
        DATA_VIEW,
        GRAPH_VIEW,
        SELECT_SCREEN,
    }
    
    export class RecordedDataViewer extends CursorSceneWithPriorPage {
        private scrollOffset: number;
        private guiState: DISPLAY_MODE;
        private saveSlot: number

        private metaDataBtn: Button
        private dataViewBtn: Button
        private graphViewBtn: Button

        constructor(app: App, saveSlot: number) {
            super(app, function () {app.popScene(); app.pushScene(new Home(this.app))})
            this.guiState = DISPLAY_MODE.SELECT_SCREEN
            this.saveSlot = saveSlot
        }

        /* override */ startup() {
            super.startup()

            this.metaDataBtn = new Button({
                parent: null,
                style: ButtonStyles.Transparent,
                icon: "linear_graph",
                ariaId: "Meta Data",
                x: -50,
                y: 30,
                onClick: () => {
                    this.guiState = DISPLAY_MODE.META_DATA_VIEW
                },
            })

            this.dataViewBtn = new Button({
                parent: null,
                style: ButtonStyles.Transparent,
                icon: "edit_program",
                ariaId: "View Data",
                x: 0,
                y: 30,
                onClick: () => {
                    this.guiState = DISPLAY_MODE.DATA_VIEW
                },
            })

            this.graphViewBtn = new Button({
                parent: null,
                style: ButtonStyles.Transparent,
                icon: "largeDisk",
                ariaId: "View Graph",
                x: 50,
                y: 30,
                onClick: () => {
                    this.guiState = DISPLAY_MODE.GRAPH_VIEW
                },
            })

            this.navigator.addButtons([this.metaDataBtn, this.dataViewBtn, this.graphViewBtn])
        }


        draw_grid() {
            const colBufferSize = Screen.WIDTH / FauxDataLogger.headers.length
            const rowBufferSize = Screen.HEIGHT /  Math.min(MAX_ROWS, FauxDataLogger.numberOfRows)

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

            if (FauxDataLogger.isEmpty) {
                screen.printCenter("No data has been recorded", Screen.HALF_HEIGHT)
                return;
            }

            let rowOffset = 0

            switch (this.guiState) {
                case DISPLAY_MODE.SELECT_SCREEN:
                    screen.printCenter("Recorded Data Options", 5)
                    this.metaDataBtn.draw()
                    this.dataViewBtn.draw()
                    this.graphViewBtn.draw()
                    break

                case DISPLAY_MODE.META_DATA_VIEW:
                    screen.printCenter("MetaData for Save " + this.saveSlot, 2)

                    control.onEvent(
                        ControllerButtonEvent.Pressed,
                        controller.A.id,
                        () => {
                            this.guiState = DISPLAY_MODE.DATA_VIEW   
                        }
                    )

                    const colSize = Screen.WIDTH / 2
                    const rowDelta = Screen.HEIGHT / 4

                    for (let colOffset = 0; colOffset <= Screen.WIDTH; colOffset+=colSize) {
                        Screen.drawLine(
                            Screen.LEFT_EDGE + colOffset,
                            Screen.TOP_EDGE + HEADER_OFFSET,
                            Screen.LEFT_EDGE + colOffset,
                            Screen.HEIGHT,
                            0x0
                        )
                    }
        
                    for (let rowOffset = HEADER_OFFSET; rowOffset <= Screen.HEIGHT; rowOffset+=rowDelta) {
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
                            {col1: "Save", col2: "1"}, 
                            {col1: "Taken", col2: FauxDataLogger.dateStamp}, 
                            {col1: "Rows", col2: FauxDataLogger.numberOfRows.toString()}, 
                            {col1: "Columns", col2: FauxDataLogger.headers.length.toString()},
                            {col1: "Col1: Time", col2: FauxDataLogger.headers[0]}, 
                            {col1: "Col2: Sensor", col2: FauxDataLogger.headers[1]}, 
                            {col1: "Period", col2: FauxDataLogger.measurementOptions.period.toString()}, 
                        ]
                    } else {
                        metadata = [
                            {col1: "Save", col2: "1"}, 
                            {col1: "Taken", col2: FauxDataLogger.dateStamp}, 
                            {col1: "Rows", col2: FauxDataLogger.numberOfRows.toString()}, 
                            {col1: "Columns", col2: FauxDataLogger.headers.length.toString()},
                            {col1: "Col1: Time", col2: FauxDataLogger.headers[0]}, 
                            {col1: "Col2: Sensor", col2: FauxDataLogger.headers[1]}, 
                            {col1: "Col3: Sensor", col2: FauxDataLogger.headers[2]}, 
                            {col1: "Period", col2: FauxDataLogger.measurementOptions.period.toString()}, 
                        ]
                    }

                    for (let i = this.scrollOffset; i < metadata.length; i++) {
                        Screen.print(
                            metadata[i].col1,
                            Screen.LEFT_EDGE + (colSize / 2) - ((font.charWidth * metadata[i].col1.length) / 2),
                            Screen.TOP_EDGE + HEADER_OFFSET + rowOffset + (rowDelta / 2) - 4,
                            0xb,
                            simage.font8
                        )
                        
                        Screen.print(
                            metadata[i].col2,
                            Screen.LEFT_EDGE + colSize + (colSize / 2) - ((font.charWidth * metadata[i].col2.length) / 2),
                            Screen.TOP_EDGE + HEADER_OFFSET + rowOffset + (rowDelta / 2) - 4,
                            0xb,
                            simage.font8
                        )
                        rowOffset += rowDelta
                    }
                    break;

                case DISPLAY_MODE.DATA_VIEW:
                    this.draw_grid()

                    // const data = [
                    //     {id: 1, col1: "1", col2: "1"}, 
                    //     {id: 2, col1: "2", col2: "2"}, 
                    //     {id: 3, col1: "3", col2: "3"}, 
                    //     {id: 4, col1: "4", col2: "4"}, 
                    // ]
                    // const colSizeBuffer = Screen.WIDTH / 2
                    // const rowDeltaBuffer = Screen.HEIGHT / 4


                    const colSizeBuffer = Screen.WIDTH / FauxDataLogger.headers.length
                    const rowDeltaBuffer = Screen.HEIGHT / FauxDataLogger.numberOfRows
                    let colOffset = 0
        
                    for (let i = this.scrollOffset; i < FauxDataLogger.numberOfRows; i++) {
                        const data = FauxDataLogger.values[i].data;

                        Screen.print(
                            data[0],
                            Screen.LEFT_EDGE + (colSizeBuffer / 2) - ((font.charWidth * data[0].length) / 2),
                            Screen.TOP_EDGE + rowOffset + (rowDeltaBuffer / 2) - 4,
                            0xb,
                            simage.font8
                        )

                        Screen.print(
                            data[1],
                            Screen.LEFT_EDGE + colSizeBuffer + (colSizeBuffer / 2) - ((font.charWidth * data[1].length) / 2),
                            Screen.TOP_EDGE + rowOffset + (rowDeltaBuffer / 2) - 4,
                            0xb,
                            simage.font8
                        )


                        if (FauxDataLogger.headers.length > 2) {
                            Screen.print(
                                data[2],
                                Screen.LEFT_EDGE + colSizeBuffer + colSizeBuffer + (colSizeBuffer / 2) - ((font.charWidth * data[2].length) / 2),
                                Screen.TOP_EDGE + rowOffset + (rowDeltaBuffer / 2) - 4,
                                0xb,
                                simage.font8
                            )
                        }
                        rowOffset += rowDeltaBuffer
                    }
                    break;

                case DISPLAY_MODE.DATA_VIEW:

                    break
            
                default:
                    break;
            }

            super.draw()
        }
    }
}