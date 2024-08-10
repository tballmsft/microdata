namespace microcode {
    // Auto-save slot
    export const SAVESLOT_AUTO = "sa"

    export interface SavedState {
        progdef: any
        version?: string
    }

    export class App {
        sceneManager: SceneManager 

        constructor() {
            // One interval delay to ensure all static constructors have executed.
            basic.pause(10)
            reportEvent("app.start")

            this.sceneManager = new SceneManager()

            datalogger.includeTimestamp(FlashLogTimeStampFormat.None)
            
            const arcadeShieldConnected = _screen_internal.displayPresent();
            if (arcadeShieldConnected)
                this.pushScene(new Home(this))
            else
                new DistributedLoggingProtocol(this, false);
        }

        public saveBuffer(slot: string, buf: Buffer) {
            reportEvent("app.save", { slot: slot, size: buf.length })
            console.log(`save to ${slot}: ${buf.length}b`)
            profile()
            settings.writeBuffer(slot, buf)
        }
        
        public pushScene(scene: Scene) {
            this.sceneManager.pushScene(scene)
        }

        public popScene() {
            this.sceneManager.popScene()
        }
    }
}
