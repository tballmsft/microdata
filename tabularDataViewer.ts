namespace microcode {
    /**
     * Display limits
     * Data in excess will require scrolling to view
     * Includes header row
     */
    const TABULAR_MAX_ROWS = 8

    const enum DATA_VIEW_DISPLAY_MODE {
        /** Show all data from all sensors */
        TABULAR_DATA_VIEW,
        /** Show the data from one selected sensors */
        FILTERED_DATA_VIEW,
    }

    /**
     * Used to view the information stored in the data logger
     * 
     */
    export class TabularDataViewer extends Scene {
        private dataRows: string[][];
        private numberOfCols: number;
        private numberOfSensors: number;
        private headerStringLengths: number[];

        private guiState: DATA_VIEW_DISPLAY_MODE
        private xScrollOffset: number

        private tabularYScrollOffset: number
        private filteredYScrollOffset: number

        private tabularRowIndex: number
        private filteredRowIndex: number

        constructor(app: App) {
            super(app, "recordedDataViewer")
            this.guiState = DATA_VIEW_DISPLAY_MODE.TABULAR_DATA_VIEW

            this.xScrollOffset = 0
            this.tabularYScrollOffset = 0
            this.filteredYScrollOffset = 0

            this.tabularRowIndex = 1
            this.filteredRowIndex = 1
        }
        
        /* override */ startup() {
            super.startup()

            this.dataRows = []
            this.headerStringLengths = []
            
            this.numberOfCols = 4;
            this.getNextDataChunk(this.tabularRowIndex);

            this.headerStringLengths = this.dataRows[0].map((header) => (header.length + 3) * font.charWidth)

            // Count until sensor name is repeated:
            const firstSensor = this.dataRows[1][0] // Skip first row (headers)
            this.numberOfSensors = 1

            // Go from second sensor onward (3rd row):
            for (let rowID = 2; rowID < this.dataRows.length; rowID++) {
                // First element in row is the sensor:
                if (this.dataRows[rowID][0] != firstSensor) {
                    this.numberOfSensors += 1
                }

                else {
                    break
                }
            }

            //----------
            // Controls:
            //----------

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.B.id,
                () => {
                    if(this.guiState == DATA_VIEW_DISPLAY_MODE.FILTERED_DATA_VIEW) {
                        this.filteredRowIndex = 1
                        this.filteredYScrollOffset = 0
                        this.guiState = DATA_VIEW_DISPLAY_MODE.TABULAR_DATA_VIEW
                    }
                    else {
                        this.app.popScene()
                        this.app.pushScene(new DataViewSelect(this.app))
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
                        if (this.tabularRowIndex > 1) {
                            this.tabularRowIndex = Math.max(this.tabularRowIndex - 1, 1)
                        }

                        else {
                            this.tabularYScrollOffset = Math.max(this.tabularYScrollOffset - 1, 0)
                            this.getNextDataChunk(this.tabularYScrollOffset);
                        }
                    }

                    else if (this.guiState === DATA_VIEW_DISPLAY_MODE.FILTERED_DATA_VIEW) {
                        if (this.filteredRowIndex > 1) {
                            this.filteredRowIndex = Math.max(this.filteredRowIndex - 1, 1)
                        }

                        else {
                            this.filteredYScrollOffset = Math.max(this.filteredYScrollOffset - 1, 0)
                        }
                    }
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.down.id,
                () => {
                    if (this.guiState === DATA_VIEW_DISPLAY_MODE.TABULAR_DATA_VIEW) {
                        const limit = Math.min(this.dataRows.length - 1, TABULAR_MAX_ROWS - 1)
                        if (this.tabularRowIndex < limit) {
                            this.tabularRowIndex = Math.min(this.tabularRowIndex + 1, this.dataRows.length - 1)
                            
                        }
                        else if (this.tabularRowIndex + this.tabularYScrollOffset < this.dataRows.length - 1) {
                            this.tabularYScrollOffset += 1
                            this.getNextDataChunk(this.tabularRowIndex);
                        }
                    }

                    else if (this.guiState === DATA_VIEW_DISPLAY_MODE.FILTERED_DATA_VIEW) {
                        const limit = Math.min(this.dataRows.length - 1, TABULAR_MAX_ROWS - 1)

                        if (this.filteredRowIndex < limit) {
                            this.filteredRowIndex = Math.min(this.filteredRowIndex + 1, this.dataRows.length - 1)
                        }
    
                        else if (this.filteredRowIndex + this.filteredYScrollOffset < this.dataRows.length - 1) {
                            this.filteredYScrollOffset += 1
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
                    if (this.xScrollOffset + 1 < this.numberOfCols - 1) {
                        this.xScrollOffset += 1
                    }
                }
            )
        }

        /**
         * Used to retrieve the next chunk of data
         * Invoked when this.tabularYScrollOffset reaches its screen boundaries
         */
        private getNextDataChunk(from: number) {
            const tokens = ["FOO"]; // TODO datalogger.getRows(from - 1, from + TABULAR_MAX_ROWS).split("_");
            for (let i = 0; i < tokens.length - this.numberOfCols; i += this.numberOfCols) {
                this.dataRows[i / this.numberOfCols] = tokens.slice(i, i + this.numberOfCols);
            }
        }

        /**
         * Each header and its corresopnding rows of data have variable lengths,
         *      The small screen sizes exaggerates these differences, hence variable column sizing.
         * @param colBufferSizes this.headerStringLengths spliced by this.xScrollOffset
         * @param rowBufferSize remains constant
         */
        drawGridOfVariableColSize(colBufferSizes: number[], rowBufferSize: number) {
            let cumulativeColOffset = 0

            // Skip the first column: Time (Seconds):
            for (let col = 0; col < colBufferSizes.length; col++) {
                if (cumulativeColOffset + colBufferSizes[col] > Screen.WIDTH) {
                    break
                }

                // The last column should use all remaining space, if it is lesser than that remaining space:
                if (col == colBufferSizes.length - 1 || cumulativeColOffset + colBufferSizes[col] + colBufferSizes[col + 1] > Screen.WIDTH) {
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

            let row = this.tabularRowIndex
            if (this.guiState == DATA_VIEW_DISPLAY_MODE.FILTERED_DATA_VIEW) {
                row = this.filteredRowIndex
            }
            
            // Draw selected box:
            Screen.drawRect(
                Screen.LEFT_EDGE,
                Screen.TOP_EDGE + (row * rowBufferSize),
                colBufferSizes[0],
                rowBufferSize,
                6
            )
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
                case DATA_VIEW_DISPLAY_MODE.FILTERED_DATA_VIEW: 
                    const filteredRowBufferSize = Screen.HEIGHT / Math.min((this.dataRows.length / this.numberOfSensors) - 1, TABULAR_MAX_ROWS)
                    this.drawGridOfVariableColSize(this.headerStringLengths.slice(this.xScrollOffset), filteredRowBufferSize)

                    const filteredSensor: string = this.dataRows[this.tabularRowIndex + this.tabularYScrollOffset][0]
                    let filteredData: string[][] = [this.dataRows[0]]

                    this.dataRows.forEach((row) => {
                        if (row[0] == filteredSensor) {
                            filteredData.push(row)
                        }
                    })

                    // Values:
                    for (let row = 0; row < Math.min(filteredData.length - this.filteredYScrollOffset, TABULAR_MAX_ROWS); row++) {
                        let cumulativeColOffset = 0;

                        // Skip the first column: Time (Seconds)
                        for (let col = 0; col < this.numberOfCols - this.xScrollOffset; col++) {
                            const colID = col + this.xScrollOffset
                            let value = filteredData[row + this.filteredYScrollOffset][colID]

                            if (cumulativeColOffset + this.headerStringLengths[colID] > Screen.WIDTH) {
                                break
                            }

                            // In this.drawGridOfVariableSize: If the column after this one would not fit grant this one the remanining space
                            // This will align the text to the center of this column space
                            if (colID == this.numberOfCols - 1 || cumulativeColOffset + this.headerStringLengths[colID] + this.headerStringLengths[colID + 1] > Screen.WIDTH) {
                                cumulativeColOffset += ((Screen.WIDTH - cumulativeColOffset) / 2) - (this.headerStringLengths[colID] / 2)
                            }

                            Screen.print(
                                value,
                                Screen.LEFT_EDGE + cumulativeColOffset + (this.headerStringLengths[colID] / 2) - ((font.charWidth * value.length) / 2),
                                Screen.TOP_EDGE + (row * filteredRowBufferSize) + (filteredRowBufferSize / 2) - 4,
                                0xb,
                                simage.font8
                            )

                            cumulativeColOffset += this.headerStringLengths[colID]
                        }
                    }
                    break;

                case DATA_VIEW_DISPLAY_MODE.TABULAR_DATA_VIEW:
                    const tabularRowBufferSize = Screen.HEIGHT / Math.min(this.dataRows.length, TABULAR_MAX_ROWS)
                    this.drawGridOfVariableColSize(this.headerStringLengths.slice(this.xScrollOffset), tabularRowBufferSize)

                    // Values:
                    for (let row = 0; row < Math.min(this.dataRows.length - this.tabularYScrollOffset, TABULAR_MAX_ROWS); row++) {
                        let cumulativeColOffset = 0;

                        // Skip the first column: Time (Seconds)
                        for (let col = 0; col < this.numberOfCols - this.xScrollOffset; col++) {
                            const colID = col + this.xScrollOffset
                            let value = this.dataRows[row + this.tabularYScrollOffset][colID]

                            if (cumulativeColOffset + this.headerStringLengths[colID] > Screen.WIDTH) {
                                break
                            }

                            // In this.drawGridOfVariableSize: If the column after this one would not fit grant this one the remanining space
                            // This will align the text to the center of this column space
                            if (colID == this.numberOfCols - 1 || cumulativeColOffset + this.headerStringLengths[colID] + this.headerStringLengths[colID + 1] > Screen.WIDTH) {
                                cumulativeColOffset += ((Screen.WIDTH - cumulativeColOffset) / 2) - (this.headerStringLengths[colID] / 2)
                            }

                            Screen.print(
                                value,
                                Screen.LEFT_EDGE + cumulativeColOffset + (this.headerStringLengths[colID] / 2) - ((font.charWidth * value.length) / 2),
                                Screen.TOP_EDGE + (row * tabularRowBufferSize) + (tabularRowBufferSize / 2) - 4,
                                0xb,
                                simage.font8
                            )
        
                            cumulativeColOffset += this.headerStringLengths[colID]
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