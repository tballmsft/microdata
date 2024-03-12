namespace microcode {
    interface MetaData {
        id: number, 
        data: string[]
    }

    export class FauxDataLogger {
        static headers: string[] = ["DEFAULT", "DEFAULT", "DEFAULT"]
        static dateStamp = "06/03/2024" // Microbit does not have access to Date; new Date().toLocaleDateString()
        static values: MetaData[]
        static numberOfRows: number
        static isEmpty: boolean = true
        static measurementOptions: MeasurementOpts

        private static sensors: Sensor[]
        
        constructor(headers: string[], mOpts: MeasurementOpts, sensors: Sensor[]) {
            FauxDataLogger.headers = headers
            FauxDataLogger.values = []
            FauxDataLogger.numberOfRows = 0

            FauxDataLogger.sensors = sensors
            FauxDataLogger.measurementOptions = mOpts
        }

        public static log(data: string[]) {
            FauxDataLogger.isEmpty = false
            FauxDataLogger.values.push({
                id: this.values.length, 
                data
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
                {col1: "Columns", col2: FauxDataLogger.headers.length.toString()}, 
                {col1: "Measurements", col2: FauxDataLogger.measurementOptions.measurements.toString()}, 
                {col1: "Period", col2: FauxDataLogger.measurementOptions.period.toString()}
            ] 
            
            for (let i = 0; i < FauxDataLogger.headers.length; i++) {
                metadata.push({col1: "Col " + (i + 1).toString(), col2: FauxDataLogger.headers[i]})
            } 
         
            return metadata
        }
    }
}
