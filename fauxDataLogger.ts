namespace microcode {
    /**
     * Internal representation of an logged entry
     */
    interface DataEntry {
        id: number, 
        data: string[]
    }

    export class FauxDataLogger {
        static headers: string[]
        static headerStringLengths: number[] // Needed for column size so that values also fit; also pre-calculation since headers are fixed.
        static dateStamp = "13/03/2024" // Microbit does not have access to Date; new Date().toLocaleDateString()
        static entries: DataEntry[]
        static numberOfRows: number
        static isEmpty: boolean = true
        static sensors: Sensor[]

        constructor(sensors: Sensor[]) {
            FauxDataLogger.headers = [
                "Sensor",
                "ms",
                "Reading",
                "Event"
            ]

            // Additional characters added for space for lines either side and for width of data below
            // For example sensor.name may be much longer than just "Sensor"
            FauxDataLogger.headerStringLengths = [
                ("Sensor".length + 4) * font.charWidth,
                ("ms".length + 4) * font.charWidth,
                ("Reading".length + 2) * font.charWidth,
                ("Event".length + 6) * font.charWidth
            ]

            FauxDataLogger.entries = []
            FauxDataLogger.numberOfRows = 0
            FauxDataLogger.sensors = sensors

            FauxDataLogger.entries.push({
                id: FauxDataLogger.entries.length, 
                data: FauxDataLogger.headers
            })
            FauxDataLogger.numberOfRows += 1
        }

        public static getNumberOfMetadataRows(): number {
            return 5 + FauxDataLogger.headers.length
        } 
        
        public static getMetadata() {
            let metadata = [
                {col1: "Date", col2: FauxDataLogger.dateStamp}, 
                {col1: "Rows", col2: FauxDataLogger.numberOfRows.toString()}, 
                {col1: "Columns", col2: FauxDataLogger.headers.length.toString()}
            ] 
            
            for (let i = 0; i < FauxDataLogger.headers.length; i++) {
                metadata.push({col1: "Col " + (i + 1).toString(), col2: FauxDataLogger.headers[i]})
            }
         
            return metadata
        }
    
        public static log(data: string[]) {
            FauxDataLogger.isEmpty = false
            FauxDataLogger.entries.push({
                id: this.entries.length, 
                data
            })

            for (let i = 0; i < data.length; i++) {
                datalogger.log(datalogger.createCV(i.toString(), data[i]))
            }
            
            FauxDataLogger.numberOfRows += 1
        }
    }
}