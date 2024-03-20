namespace microcode {
    /**
     * Internal representation of an logged entry
     */
    interface DataEntry {
        id: number, 
        data: string[]
    }

    abstract class Logger {
        static headers: string[]
        static headerStringLengths: number[] // Needed for column size so that values also fit; also pre-calculation since headers are fixed.
        static dateStamp = "13/03/2024" // Microbit does not have access to Date; new Date().toLocaleDateString()
        static entries: DataEntry[]
        static numberOfRows: number
        static isEmpty: boolean = true
        static measurementOptions: RecordingConfig
        static sensors: Sensor[]

        constructor(mOpts: RecordingConfig, sensors: Sensor[]) {
            Logger.headers = [
                "Sensor",
                "Milli-sec",
                "Event",
                "Reading"
            ]

            // Additional characters added for space for lines either side and for width of data below
            // For example sensor.name may be much longer than just "Sensor"
            Logger.headerStringLengths = [
                ("Sensor".length + 4) * font.charWidth,
                ("Milli-sec".length + 2) * font.charWidth,
                ("Event".length + 6) * font.charWidth,
                ("Reading".length + 2) * font.charWidth
            ]

            Logger.entries = []
            Logger.numberOfRows = 0
            Logger.measurementOptions = mOpts
            Logger.sensors = sensors
        }
    
        public static log(data: string[]) {
            Logger.isEmpty = false
            Logger.entries.push({
                id: this.entries.length, 
                data
            })
            Logger.numberOfRows += 1
        }
        
        public static getNumberOfMetadataRows(): number {
            return 5 + Logger.headers.length
        }

        public static getMetadata() {
            let metadata = [
                {col1: "Date", col2: Logger.dateStamp}, 
                {col1: "Rows", col2: Logger.numberOfRows.toString()}, 
                {col1: "Columns", col2: Logger.headers.length.toString()}, 
                {col1: "Measurements", col2: Logger.measurementOptions.measurements.toString()}, 
                {col1: "Period", col2: Logger.measurementOptions.period.toString()}
            ] 
            
            for (let i = 0; i < Logger.headers.length; i++) {
                metadata.push({col1: "Col " + (i + 1).toString(), col2: Logger.headers[i]})
            } 
         
            return metadata
        }
    }

    export class FauxDataLogger extends Logger {
        constructor(mOpts: RecordingConfig, sensors: Sensor[]) {
            super(mOpts, sensors)

            // Add initial entry for the headers, Logger.isEmpty remains false:
            Logger.entries.push({
                id: Logger.entries.length, 
                data: Logger.headers
            })
            Logger.numberOfRows += 1
        }

        public static log(data: string[]) {
            Logger.isEmpty = false
            Logger.entries.push({
                id: Logger.entries.length, 
                data
            })
            Logger.numberOfRows += 1
        }
    }

    export class FauxEventLogger extends Logger {
        constructor(mOpts: RecordingConfig, sensors: Sensor[]) {
            super(mOpts, sensors)
        }
    }
}