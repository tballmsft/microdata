// import * as fs from 'fs';
// import { readFileSync } from 'fs';


namespace microcode {
    const TOOLBAR_HEIGHT = 17
    const TOOLBAR_MARGIN = 2

    //% shim=TD_NOOP
    function connectJacdac() {
        const buf = Buffer.fromUTF8(JSON.stringify({ type: "connect" }))
        control.simmessages.send("usb", buf)
    }

    export class RecordedDataViewer extends Scene {
        private backgroundColor = 4;

        constructor(app: App) {
            super(app, "dataViewer")

            const goBack = function() {
                app.popScene()
                app.pushScene(new Home(app))
            };

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.B.id,
                () => goBack()
            )
        }

        update() {
            screen.fill(this.backgroundColor);

            // const words = readFileSync('./MY_DATA.HTM');
            screen.printCenter("RecordedDataViewer", screen.height / 2);
        }
    }
}