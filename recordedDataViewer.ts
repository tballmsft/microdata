namespace microcode {
    const HEADER_OFFSET = 17
    const MAX_ROWS = 10

    const enum DISPLAY_MODE {
        DATA_VIEW,
        GRAPH_GENERATION,
        METADATA_MODE,
    }

    export class RecordedDataViewer extends Scene {
        private scrollOffset: number;
        private current_mode: DISPLAY_MODE;
        private saveSlot: number

        constructor(app: App, saveSlot: number) {
            super(app, "dataViewer")

            this.scrollOffset = 0
            this.current_mode = DISPLAY_MODE.METADATA_MODE
            this.saveSlot = saveSlot

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.B.id,
                () => {
                    switch (this.current_mode) {
                        case DISPLAY_MODE.DATA_VIEW:
                            this.current_mode = DISPLAY_MODE.METADATA_MODE
                            break;

                        case DISPLAY_MODE.GRAPH_GENERATION:
                            this.current_mode = DISPLAY_MODE.DATA_VIEW
                            break;

                        case DISPLAY_MODE.METADATA_MODE:
                            app.popScene()
                            app.pushScene(new Home(this.app))
                            break;
                    
                        default:
                            app.popScene()
                            app.pushScene(new Home(this.app))
                            break;
                    }
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.down.id,
                () => {
                    this.scrollOffset = Math.min(this.scrollOffset + 1, MAX_ROWS)
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.up.id,
                () => {
                    this.scrollOffset = Math.max(this.scrollOffset - 1, 0)
                }
            )
        }

        draw_grid() {
            const colBufferSize = Screen.WIDTH / 2 //FauxDataLogger.headers.length
            const rowBufferSize = Screen.HEIGHT / 4 // Math.min(MAX_ROWS, FauxDataLogger.numberOfRows)

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

        update() {
            Screen.fillRect(
                Screen.LEFT_EDGE,
                Screen.TOP_EDGE,
                Screen.WIDTH,
                Screen.HEIGHT,
                0xC
            )
            
            let rowOffset = 0

            switch (this.current_mode) {
                case DISPLAY_MODE.METADATA_MODE:
                    screen.printCenter("MetaData for Save " + this.saveSlot, 2)

                    control.onEvent(
                        ControllerButtonEvent.Pressed,
                        controller.A.id,
                        () => {
                            this.current_mode = DISPLAY_MODE.DATA_VIEW   
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

                    const metadata = [
                        {id: 1, col1: "Save", col2: "1"}, 
                        {id: 2, col1: "Taken", col2: "21/02/2024"}, 
                        {id: 3, col1: "Columns", col2: FauxDataLogger.headers.length.toString()}, 
                        {id: 4, col1: "Rows", col2: FauxDataLogger.numberOfRows.toString()}, 
                    ]

                    for (let i = this.scrollOffset; i < 4; i++) {
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

                case DISPLAY_MODE.GRAPH_GENERATION:

                    break;

                case DISPLAY_MODE.DATA_VIEW:
                    this.draw_grid()
    
                    const colSizeBuffer = Screen.WIDTH / 2
                    const rowDeltaBuffer = Screen.HEIGHT / 4

                    // const data = [
                    //     {id: 1, col1: "1", col2: "1"}, 
                    //     {id: 2, col1: "2", col2: "2"}, 
                    //     {id: 3, col1: "3", col2: "3"}, 
                    //     {id: 4, col1: "4", col2: "4"}, 
                    // ]


                    const data = FauxDataLogger.data
                    // FauxDataLogger.numberOfRows = 4
    
                    for (let i = this.scrollOffset; i < FauxDataLogger.numberOfRows; i++) {
                        Screen.print(
                            data[i].col1,
                            Screen.LEFT_EDGE + (colSizeBuffer / 2) - ((font.charWidth * data[i].col1.length) / 2),
                            Screen.TOP_EDGE + rowOffset + (rowDeltaBuffer / 2) - 4,
                            0xb,
                            simage.font8
                        )

                        Screen.print(
                            data[i].col2,
                            Screen.LEFT_EDGE + colSizeBuffer + (colSizeBuffer / 2) - ((font.charWidth * data[i].col2.length) / 2),
                            Screen.TOP_EDGE + rowOffset + (rowDeltaBuffer / 2) - 4,
                            0xb,
                            simage.font8
                        )
                        rowOffset += rowDeltaBuffer
                    }
                    break;
            
                default:
                    break;
            }
        }
    }
}