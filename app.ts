namespace microcode {
    // Auto-save slot
    export const SAVESLOT_AUTO = "sa"

    export class App {
        sceneManager: SceneManager

        constructor() {
            // One interval delay to ensure all static constructors have executed.
            basic.pause(30)
            reportEvent("app.start")
            this.sceneManager = new SceneManager()
            this.pushScene(new Home(this))
            // this.pushScene(new SensorSelect(this, CursorSceneEnum.LiveDataViewer))
        }


        public pushScene(scene: Scene) {
            this.sceneManager.pushScene(scene)
        }

        public popScene() {
            this.sceneManager.popScene()
        }
    }
}
