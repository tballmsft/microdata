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
        FILTERED_DATA_VIEW,
    }

    /**
     * Used to view the recorded data & its meta data
     */
    export class TabularDataViewer extends Scene {
        private guiState: DATA_VIEW_DISPLAY_MODE
        private xScrollOffset: number
        private yScrollOffset: number

        private numberOfMetadataRows: number
        private currentRowIndex: number

        constructor(app: App, guiState: DATA_VIEW_DISPLAY_MODE) {
            super(app, "recordedDataViewer")
            this.guiState = guiState

            this.xScrollOffset = 0
            this.yScrollOffset = 0
            this.currentRowIndex = 1

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
                    if(this.guiState == DATA_VIEW_DISPLAY_MODE.FILTERED_DATA_VIEW) {
                        this.guiState = DATA_VIEW_DISPLAY_MODE.TABULAR_DATA_VIEW
                    }
                    else {
                        app.popScene()
                        app.pushScene(new DataViewSelect(this.app))
                    }
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.A.id,
                () => {
                    if (this.guiState == DATA_VIEW_DISPLAY_MODE.TABULAR_DATA_VIEW) {
                        this.guiState = DATA_VIEW_DISPLAY_MODE.FILTERED_DATA_VIEW
                    }
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.up.id,
                () => {
                    if (this.guiState === DATA_VIEW_DISPLAY_MODE.TABULAR_DATA_VIEW) {
                        if (this.currentRowIndex > 1) {
                            this.currentRowIndex = Math.max(this.currentRowIndex - 1, 1)
                        }

                        else {
                            this.yScrollOffset = Math.max(this.yScrollOffset - 1, 0)
                        }
                    }
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

                    else if (this.guiState === DATA_VIEW_DISPLAY_MODE.TABULAR_DATA_VIEW) {
                        const limit = Math.min(FauxDataLogger.numberOfRows - 1, TABULAR_MAX_ROWS - 1)
                        if (this.currentRowIndex < limit) {
                            this.currentRowIndex = Math.min(this.currentRowIndex + 1, FauxDataLogger.numberOfRows - 1)
                        }

                        else if (this.currentRowIndex + this.yScrollOffset < FauxDataLogger.numberOfRows - 1) {
                            this.yScrollOffset = Math.min(this.yScrollOffset + 1, FauxDataLogger.numberOfRows - 1)
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

        drawGrid(colBufferSize: number, rowBufferSize: number) {
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


        /**
         * Each header and its corresopnding rows of data have variable lengths,
         *      The small screen sizes exaggerates these differences, hence variable column sizing.
         * Uses FauxDataLogger.headerStringLengths to get these lengths
         * @param colBufferSizes FauxDataLogger.headerStringLengths spliced by this.xScrollOffset
         * @param rowBufferSize remains constant
         */
        drawGridOfVariableColSize(colBufferSizes: number[], rowBufferSize: number) {
            let cumulativeColOffset = 0
            
            // colBufferSizes.forEach(function(headerLen) {
            for (let col = 0; col < colBufferSizes.length; col++) {
                // The last column should use all remaining space, if it is lesser than that remaining space:
                if (col == colBufferSizes.length - 1 && colBufferSizes[col] < cumulativeColOffset) {
                    cumulativeColOffset += Screen.WIDTH - cumulativeColOffset
                }
                else {
                    cumulativeColOffset += colBufferSizes[col]
                }

                if (cumulativeColOffset <= Screen.WIDTH) {
                    Screen.drawLine(
                        Screen.LEFT_EDGE + cumulativeColOffset,
                        Screen.TOP_EDGE,
                        Screen.LEFT_EDGE + cumulativeColOffset,
                        Screen.HEIGHT,
                        0x0
                    )
                }
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
            
            if (this.guiState == DATA_VIEW_DISPLAY_MODE.TABULAR_DATA_VIEW) {
                // Draw selected box:
                Screen.drawRect(
                    Screen.LEFT_EDGE,
                    Screen.TOP_EDGE + (this.currentRowIndex * rowBufferSize),
                    colBufferSizes[0],
                    rowBufferSize,
                    6
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
                    const metadataColSize = Screen.WIDTH / 2
                    const metadataRowSize = Screen.HEIGHT / METADATA_MAX_ROWS

                    this.drawGrid(metadataColSize, metadataRowSize)
                    const metadata = FauxDataLogger.getMetadata()

                    for (let row = 0; row < METADATA_MAX_ROWS; row++) {
                        Screen.print(
                            metadata[row + this.yScrollOffset].col1,
                            Screen.LEFT_EDGE + (metadataColSize / 2) - ((font.charWidth * metadata[row + this.yScrollOffset].col1.length) / 2),
                            Screen.TOP_EDGE + (row * metadataRowSize) + (metadataRowSize / 2) - 4,
                            0xb,
                            simage.font8
                        )
                        
                        Screen.print(
                            metadata[row + this.yScrollOffset].col2,
                            Screen.LEFT_EDGE + metadataColSize + (metadataColSize / 2) - ((font.charWidth * metadata[row + this.yScrollOffset].col2.length) / 2),
                            Screen.TOP_EDGE + (row * metadataRowSize) + (metadataRowSize / 2) - 4,
                            0xb,
                            simage.font8
                        )
                    }
                    break;
                
                
                case DATA_VIEW_DISPLAY_MODE.FILTERED_DATA_VIEW:
                    const filteredRowBufferSize = Screen.HEIGHT / Math.min(FauxDataLogger.numberOfRows / FauxDataLogger.sensors.length, TABULAR_MAX_ROWS)
                    this.drawGridOfVariableColSize(FauxDataLogger.headerStringLengths.slice(this.xScrollOffset), filteredRowBufferSize)

                    const filteredSensor: string = FauxDataLogger.entries[this.currentRowIndex + this.yScrollOffset].data[0];
                    let filteredData: string[][] = []

                    FauxDataLogger.entries.forEach((entry) => {
                        if (entry.data[0] == filteredSensor) {
                            filteredData.push(entry.data)
                        }
                    });
                    
                    for (let row = 0; row < Math.min(filteredData.length, TABULAR_MAX_ROWS); row++) {
                        let cumulativeColOffset = 0
                        const data = filteredData[row + 1]

                        for (let col = 0; col < Math.min(FauxDataLogger.headers.length, TABULAR_MAX_COLS); col++) {
                            const colID = col + this.xScrollOffset
                            const colOffset = (font.charWidth * filteredData[colID].length) + 2
        
                            if (cumulativeColOffset + colOffset > Screen.WIDTH) {
                                break
                            }
        
                            Screen.print(
                                data[colID],
                                Screen.LEFT_EDGE + cumulativeColOffset + (FauxDataLogger.headerStringLengths[colID] / 2) - ((font.charWidth * data[colID].length) / 2),
                                Screen.TOP_EDGE + (row * filteredRowBufferSize) + (filteredRowBufferSize / 2) - 4,
                                0xb,
                                simage.font8
                            )
        
                            cumulativeColOffset += FauxDataLogger.headerStringLengths[colID]
                        }
                    }

                    break;

                case DATA_VIEW_DISPLAY_MODE.TABULAR_DATA_VIEW:
                    const tabularRowBufferSize = Screen.HEIGHT / Math.min(FauxDataLogger.numberOfRows, TABULAR_MAX_ROWS)
                    this.drawGridOfVariableColSize(FauxDataLogger.headerStringLengths.slice(this.xScrollOffset), tabularRowBufferSize)
                    
                    for (let row = 0; row < Math.min(FauxDataLogger.numberOfRows, TABULAR_MAX_ROWS); row++) {
                        const data = FauxDataLogger.entries[row + this.yScrollOffset].data;
        
                        let cumulativeColOffset = 0
                        for (let col = 0; col < Math.min(FauxDataLogger.headers.length, TABULAR_MAX_COLS); col++) {
                            const colID = col + this.xScrollOffset
                            const colOffset = (font.charWidth * data[colID].length) + 2
        
                            if (cumulativeColOffset + colOffset > Screen.WIDTH) {
                                break
                            }
        
                            Screen.print(
                                data[colID],
                                Screen.LEFT_EDGE + cumulativeColOffset + (FauxDataLogger.headerStringLengths[colID] / 2) - ((font.charWidth * data[colID].length) / 2),
                                Screen.TOP_EDGE + (row * tabularRowBufferSize) + (tabularRowBufferSize / 2) - 4,
                                0xb,
                                simage.font8
                            )
        
                            cumulativeColOffset += FauxDataLogger.headerStringLengths[colID]
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