namespace microcode {
    interface MetaData {
        id: number, 
        data: string[]
    }

    export class FauxDataLogger {
        static headers: string[] = ["DEFAULT", "DEFAULT", "DEFAULT"]
        static dateStamp = "21/02/2024" // Microbit does not have access to Date; new Date().toLocaleDateString()
        static values: MetaData[]
        static numberOfRows: number
        static measurementOptions: MeasurementOpts

        constructor(headers: string[], mOpts: MeasurementOpts) {
            FauxDataLogger.headers = headers
            FauxDataLogger.values = []
            FauxDataLogger.numberOfRows = 0
            FauxDataLogger.measurementOptions = mOpts
        }

        public static log(data: string[]) {
            FauxDataLogger.values.push({
                id: this.values.length, 
                data
            })
            FauxDataLogger.numberOfRows += 1
        }
    }
}
