namespace microcode {
    interface MetaData {
        id: number, 
        col1: string, 
        col2: string
    }

    export class FauxDataLogger {
        static headers: string[] = ["DEFAULT", "DEFAULT"]
        static data: MetaData[]
        static numberOfRows: number

        constructor(headers: string[]) {
            FauxDataLogger.headers = headers
            FauxDataLogger.data = []
            FauxDataLogger.numberOfRows = 0
        }

        public static log(key: string, value: number) {
            FauxDataLogger.data.push({
                id: this.data.length, 
                col1: key, 
                col2: value.toString()
            })
            FauxDataLogger.numberOfRows += 1
        }
    }
}
