namespace microcode {
    /**
     * Display limits
     * Data in excess will require scrolling to view
     * Includes header row
     */
    const TABULAR_MAX_ROWS = 8

    /**
     * Used to determine limits when pressing RIGHT & in .draw()
     */
    const NUMBER_OF_COLS = 4

    /**
     * Locally used to control flow upon button presses: A, B, UP, DOWN
     */
    const enum DATA_VIEW_DISPLAY_MODE {
        /** Show all data from all sensors. DEFAULT + State transition on B Press */
        UNFILTERED_DATA_VIEW,
        /** Show the data from one selected sensors. State transition on A Press */
        FILTERED_DATA_VIEW,
    }

    /**
     * Used to view the information stored in the data logger
     * Shows up to TABULAR_MAX_ROWS rows ordered by period descending.
     * Shows the datalogger's header as the first row.
     * UP, DOWN, LEFT, RIGHT to change rows & columns.
     * Pressing shows all rows by the same sensor (filters the data)
     */
    export class TabularDataViewer extends Scene {
        /**
         * Used to store a chunk of data <= TABULAR_MAX_ROWS in length.
         * Either filtered or unfiltered data.
         * Fetched on transition between states when pressing A or B.
         * Or scrolling UP & DOWN
         * 
         * Only modified by:
         *      .nextDataChunk() &
         *      .nextFilteredDataChunk()
         */
        private dataRows: string[][];

        /**
         * Needed to centre the headers in .draw()
         * No need to calculate once per frame
         */
        private headerStringLengths: number[];

        /**
         * Unfiltered at start
         * Pressing A sets to Filtered
         * Pressing B sets to Unfiltered
         */
        private guiState: DATA_VIEW_DISPLAY_MODE


        //---------
        // FOR GUI:
        //---------

        /**
         * Will this viewer need to scroll to reveal all of the rows?
         */
        private needToScroll: boolean

        /**
         * Cursor location, when the cursor is on the first or last row 
         * and UP or DOWN is invoked this.currentRowOffset is modified once instead.
         * Modified when pressing UP or DOWN
         */
        private currentRow: number

        /**
         * Used to determine which columns to draw.
         */
        private currentCol: number

        /**
         * Used as index into .filteredReadStarts by:
         *      .nextDataChunk() &
         *      .nextFilteredDataChunk()
         * If .currentRow is on the first or last row this is modified
         * causing the next chunk of data to be offset by 1.
         * 
         * Modified when pressing UP or DOWN
         */
        private currentRowOffset: number

        /**
         * This is unique per sensor, it is calculated once upon pressing A.
         */
        private numberOfFilteredRows: number
        
        /**
         * Set when pressing A, filtered against in this.nextFilteredDataChunk()
         */
        private filteredSensorName: string
        
        /**
         * There may be any number of sensors, and each may have a unique period & number of measurements.
         * Data is retrieved in batches via datalogger.getRow():
         *      so it is neccessary to start at the index of the last filtered read.
         * This array is a lookup for where to start reading from - using this.yScrollOffset as index
         */
        private filteredReadStarts: number[]

        constructor(app: App) {
            super(app, "recordedDataViewer")

            this.guiState = DATA_VIEW_DISPLAY_MODE.UNFILTERED_DATA_VIEW
            this.needToScroll = datalogger.getNumberOfRows() > TABULAR_MAX_ROWS

            this.currentRow = 1
            this.currentCol = 0
            this.currentRowOffset = 0
            
            this.numberOfFilteredRows = 0

            this.filteredSensorName = ""
            this.filteredReadStarts = [0]
        }
        
        /* override */ startup() {
            super.startup()

            this.nextDataChunk();
            this.headerStringLengths = this.dataRows[0].map((header) => (header.length + 3) * font.charWidth)

            //----------
            // Controls:
            //----------

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.B.id,
                () => {
                    if(this.guiState == DATA_VIEW_DISPLAY_MODE.FILTERED_DATA_VIEW) {
                        this.currentRowOffset = 0
                        this.currentRow = 1

                        this.nextDataChunk();
                        this.guiState = DATA_VIEW_DISPLAY_MODE.UNFILTERED_DATA_VIEW
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
                    if (this.guiState == DATA_VIEW_DISPLAY_MODE.UNFILTERED_DATA_VIEW) {
                        this.filteredSensorName = this.dataRows[this.currentRow][0]
                        this.currentRowOffset = 0
                        this.currentRow = 1

                        this.nextFilteredDataChunk();
                        this.getNumberOfFilteredRows();
                        this.guiState = DATA_VIEW_DISPLAY_MODE.FILTERED_DATA_VIEW
                    }
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.up.id,
                () => {
                    if (this.currentRow > 0) {
                        const limit = this.needToScroll? 0 : 1
                        this.currentRow = Math.max(this.currentRow - 1, limit);
                    }

                    if (this.needToScroll && this.currentRow == 0) {
                        this.currentRowOffset = Math.max(this.currentRowOffset - 1, 0);
                        
                        if (this.guiState == DATA_VIEW_DISPLAY_MODE.UNFILTERED_DATA_VIEW) {       
                            this.nextDataChunk();
                        }

                        else {
                            this.nextFilteredDataChunk()
                        }

                        if (this.currentRowOffset == 0) {
                            this.currentRow = 1
                        }
                    }
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.down.id,
                () => {
                    let rowQty = datalogger.getNumberOfRows();
                    if (this.guiState == DATA_VIEW_DISPLAY_MODE.FILTERED_DATA_VIEW) {
                        rowQty = this.numberOfFilteredRows
                    }

                    if (this.needToScroll) {
                        if (this.currentRow + 1 < TABULAR_MAX_ROWS)
                            this.currentRow += 1;

                        else if (this.currentRowOffset <= rowQty - TABULAR_MAX_ROWS - 1) {
                            this.currentRowOffset += 1;

                            if (this.guiState == DATA_VIEW_DISPLAY_MODE.UNFILTERED_DATA_VIEW)
                                this.nextDataChunk();

                            else
                                this.nextFilteredDataChunk()
                        }
                    }

                    else if (this.currentRow < rowQty) {
                        this.currentRow += 1;
                    }
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.left.id,
                () => {
                    this.currentCol = Math.max(this.currentCol - 1, 0)
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.right.id,
                () => {
                    if (this.currentCol + 1 < NUMBER_OF_COLS - 1)
                        this.currentCol += 1
                }
            )
        }

        /**
         * Used to retrieve the next chunk of data.
         * Invoked when this.tabularYScrollOffset reaches its screen boundaries.
         * Mutates: this.dataRows
         */
        private nextDataChunk() {
            const rows = datalogger.getRows(this.currentRowOffset, TABULAR_MAX_ROWS).split("\n");
            this.needToScroll = datalogger.getNumberOfRows() > TABULAR_MAX_ROWS
            
            this.dataRows = []
            for (let i = 0; i < rows.length; i++) {
                this.dataRows.push(rows[i].split(","));
            }
        }


        /**
         * Fill this.dataRows with up to TABULAR_MAX_ROWS elements of data.
         * Filter rows by this.filteredSensorName.
         * Sets the next filteredReadStart by setting this.filteredReadStarts[this.yScrollOffset + 1]
         * Mutates: this.dataRows
         * Mutates: this.filteredReadStarts[this.yScrollOffset + 1]
         */
        private nextFilteredDataChunk() {
            let start = this.filteredReadStarts[this.currentRowOffset]
            
            this.dataRows = []
            if (this.currentRowOffset == 0)
                this.dataRows.push(datalogger.getRows(0, 1).split("\n")[0].split(","))
            
            while (start < datalogger.getNumberOfRows() && this.dataRows.length < TABULAR_MAX_ROWS) {
                const rows = datalogger.getRows(start, TABULAR_MAX_ROWS).split("\n");
                for (let i = 0; i < rows.length; i++) {
                    const data = rows[i].split(",")
                    if (data[0] == this.filteredSensorName) {
                        this.dataRows.push(data);

                        if (this.dataRows.length == (this.currentRowOffset == 0 ? 3 : 2)) {
                            this.filteredReadStarts[this.currentRowOffset + 1] = start + i
                        }
                    }
                }
                start += Math.min(TABULAR_MAX_ROWS, datalogger.getNumberOfRows(start))
            }
        }


        /**
         * Set this.numberOfFilteredRows & this.needToScroll 
         * Based upon this.filteredSensorName
         */
        private getNumberOfFilteredRows() {
            this.numberOfFilteredRows = 0

            const chunkSize = Math.min(20, datalogger.getNumberOfRows())
            for (let chunk = 0; chunk < datalogger.getNumberOfRows(); chunk+=chunkSize) {
                const rows = datalogger.getRows(chunk, chunkSize).split("\n");
                for (let i = 0; i < rows.length; i++) {
                    // Name:
                    if (rows[i].split(",", 1)[0] == this.filteredSensorName) {
                        this.numberOfFilteredRows += 1
                    }
                }
            }
            this.needToScroll = this.numberOfFilteredRows > TABULAR_MAX_ROWS
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

            // Draw selected box:
            Screen.drawRect(
                Screen.LEFT_EDGE,
                Screen.TOP_EDGE + (this.currentRow * rowBufferSize),
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

            const tabularRowBufferSize = Screen.HEIGHT / Math.min(this.dataRows.length, TABULAR_MAX_ROWS);
            this.drawGridOfVariableColSize(this.headerStringLengths.slice(this.currentCol), tabularRowBufferSize)

            // Values:
            for (let row = 0; row < Math.min(this.dataRows.length, TABULAR_MAX_ROWS); row++) {
                let cumulativeColOffset = 0;

                // Skip the first column: Time (Seconds)
                for (let col = 0; col < NUMBER_OF_COLS - this.currentCol; col++) {
                    const colID = col + this.currentCol
                    let value: string = this.dataRows[row][colID]

                    // If the column of readings and not the header:
                    if (col == 2 && this.currentRowOffset != 0)
                        value = value.slice(0, 5)

                    if (cumulativeColOffset + this.headerStringLengths[colID] > Screen.WIDTH) {
                        break;
                    }

                    // In this.drawGridOfVariableSize: If the column after this one would not fit grant this one the remanining space
                    // This will align the text to the center of this column space
                    if (colID == NUMBER_OF_COLS - 1 || cumulativeColOffset + this.headerStringLengths[colID] + this.headerStringLengths[colID + 1] > Screen.WIDTH) {
                        cumulativeColOffset += ((Screen.WIDTH - cumulativeColOffset) / 2) - (this.headerStringLengths[colID] / 2)
                    }

                    Screen.print(
                        value.slice(0, 5),
                        Screen.LEFT_EDGE + cumulativeColOffset + (this.headerStringLengths[colID] / 2) - ((font.charWidth * value.length) / 2),
                        Screen.TOP_EDGE + (row * tabularRowBufferSize) + (tabularRowBufferSize / 2) - 4,
                        0xb,
                        simage.font8
                    )

                    cumulativeColOffset += this.headerStringLengths[colID]
                }
            }

            super.draw()
        }
    }
}