namespace microcode {
    interface IDictionary {
        [index: string]: number;
    }
    export class FauxDataLogger {
        static headers: string[] = ["DEFAULT", "DEFAULT"]
        static data: IDictionary
        static numberOfRows: number

        constructor(headers: string[]) {
            FauxDataLogger.headers = headers
            FauxDataLogger.data = {}
            FauxDataLogger.numberOfRows = 0
        }

        public static log(key: string, value: number) {
            FauxDataLogger.data[key] = value
            FauxDataLogger.numberOfRows += 1
        }
    }
}
