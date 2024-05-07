namespace microcode {
    /**
     * Display limits
     * Data in excess will require scrolling to view
     */
    const TABULAR_MAX_ROWS = 8

    export const enum DATA_VIEW_DISPLAY_MODE {
        TABULAR_DATA_VIEW,
        FILTERED_DATA_VIEW,
    }

    /**
     * Used to view the recorded data & its meta data
     */
    export class TabularDataViewer extends Scene {
        private dataRows: string[][];
        private numberOfCols: number;
        private numberOfSensors: number;
        private headerStringLengths: number[];

        private guiState: DATA_VIEW_DISPLAY_MODE
        private xScrollOffset: number
        private yScrollOffset: number

        private currentRowIndex: number

        constructor(app: App, guiState: DATA_VIEW_DISPLAY_MODE) {
            super(app, "recordedDataViewer")
            this.guiState = guiState

            this.xScrollOffset = 0
            this.yScrollOffset = 0
            this.currentRowIndex = 1
        }

        /* override */ startup() {
            super.startup()

            this.dataRows = []
            this.headerStringLengths = []
            const tokens = datalogger.getData().split("_")
            this.numberOfCols = 5

            // basic.showNumber(tokens.length - 1)
            
            // Skip the first column of each row (Time (Seconds)):
            for (let i = 0; i < tokens.length - 5; i += this.numberOfCols) {
                this.dataRows[i / this.numberOfCols] = tokens.slice(i + 1, i + 5);
            }

            this.numberOfCols = 4
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
                        this.currentRowIndex = 0
                        this.yScrollOffset = 0
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
                    if (this.guiState === DATA_VIEW_DISPLAY_MODE.TABULAR_DATA_VIEW) {
                        const limit = Math.min(this.dataRows.length - 1, TABULAR_MAX_ROWS - 1)
                        if (this.currentRowIndex < limit) {
                            this.currentRowIndex = Math.min(this.currentRowIndex + 1, this.dataRows.length - 1)
                        }

                        else if (this.currentRowIndex + this.yScrollOffset < this.dataRows.length - 1) {
                            this.yScrollOffset = Math.min(this.yScrollOffset + 1, this.dataRows.length - 1)
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
         *         
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
                case DATA_VIEW_DISPLAY_MODE.FILTERED_DATA_VIEW: 
                    const filteredRowBufferSize = Screen.HEIGHT / Math.min(((this.dataRows.length - 1) / this.numberOfSensors) + 1, TABULAR_MAX_ROWS)
                    this.drawGridOfVariableColSize(this.headerStringLengths.slice(this.xScrollOffset), filteredRowBufferSize)

                    const filteredSensor: string = this.dataRows[this.currentRowIndex + this.yScrollOffset][0]
                    let filteredData: string[][] = [this.dataRows[0]]

                    this.dataRows.forEach((row) => {
                        if (row[0] == filteredSensor) {
                            filteredData.push(row)
                        }
                    });

                    // Values:
                    for (let row = 0; row < Math.min(filteredData.length, TABULAR_MAX_ROWS); row++) {
                        let cumulativeColOffset = 0;

                        // Skip the first column: Time (Seconds)
                        for (let col = 0; col < this.numberOfCols - this.xScrollOffset; col++) {
                            const colID = col + this.xScrollOffset
                            let value = filteredData[row][colID]

                            if (cumulativeColOffset + this.headerStringLengths[colID] > Screen.WIDTH) {
                                break
                            }

                            // if (value == undefined) {
                            //     value = " "
                            // }

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
                    for (let row = 0; row < Math.min(this.dataRows.length, TABULAR_MAX_ROWS); row++) {
                        let cumulativeColOffset = 0;

                        // Skip the first column: Time (Seconds)
                        for (let col = 0; col < this.numberOfCols - this.xScrollOffset; col++) {
                            const colID = col + this.xScrollOffset
                            let value = this.dataRows[row][colID]

                            if (cumulativeColOffset + this.headerStringLengths[colID] > Screen.WIDTH) {
                                break
                            }

                            // if (value == undefined) {
                            //     value = " "
                            // }

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