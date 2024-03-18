namespace microcode {
    const enum GUI_STATE {
        WRITING,
        DEFAULT
    }

    export class EventConfigSelect extends Scene {
        private guiState: GUI_STATE
        private guiRows: string[]
        private currentColumn: number
        private selectedSensors: Sensor[]

        // [Quantity, Milli-seconds, Seconds, Minutes, Hours, Days, Start Delay]:
        private userSelection: number[]

        constructor(app: App, selectedSensors: Sensor[]) {
            super(app, "dataViewer")
        }
    }
}