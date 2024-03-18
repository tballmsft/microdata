namespace microcode {
    /**
     * Internal representation of an logged entry
     */
    interface DataEntry {
        id: number, 
        data: string[]
    }

    abstract class Logger {
        static headers: string[] = ["DEFAULT", "DEFAULT", "DEFAULT"]
        static dateStamp = "13/03/2024" // Microbit does not have access to Date; new Date().toLocaleDateString()
        static entries: DataEntry[]
        static numberOfRows: number
        static isEmpty: boolean = true
        static measurementOptions: RecordingConfig
        static sensors: Sensor[]

        constructor(headers: string[], mOpts: RecordingConfig, sensors: Sensor[]) {
            Logger.headers = headers
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
        constructor(headers: string[], mOpts: RecordingConfig, sensors: Sensor[]) {
            super(headers, mOpts, sensors)
        }
    }

    export class FauxEventLogger extends Logger {
        constructor(headers: string[], mOpts: RecordingConfig, sensors: Sensor[]) {
            super(headers, mOpts, sensors)
        }

        public static log(data: string[]) {
            Logger.isEmpty = false
            Logger.entries.push({
                id: this.entries.length, 
                data
            })
            Logger.numberOfRows += 1
        }
    }
}