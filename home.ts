namespace microcode {
    export class Home extends CursorScene {
        private recordDataBtn: Button
        private liveDataBtn: Button
        private viewBtn: Button

        constructor(app: App) {
            super(app)
        }

        /* override */ startup() {
            super.startup()

            // datalogger.deleteLog(datalogger.DeleteType.Full)

            /**
             * MicroData uses its own data format of:
             * [
             * Sensor,
             * Time (ms),
             * Reading,
             * Event
             * ]
             * 
             * Otherwise the first column will be Time(seconds):
             *      Which begins counting at Microbit startup.
             *      The sensor's should start their logging time only when this dataRecorder specifies.
             */
            datalogger.includeTimestamp(FlashLogTimeStampFormat.None)
            datalogger.setColumns([
                "Sensor",
                "Time (ms)",
                "Reading",
                "Event"
            ])

            // for (let i = 1; i <= 11; i++) {
            //     datalogger.log(
            //         datalogger.createCV("Sensor", "Accel. X"),
            //         datalogger.createCV("Time (ms)", +(i * 1000)),
            //         datalogger.createCV("Reading", +i),
            //         datalogger.createCV("Event", "N/a")
            //     )
            // }

            this.liveDataBtn = new Button({
                parent: null,
                style: ButtonStyles.Transparent,
                icon: "linear_graph_1",
                ariaId: "linear_graph",
                x: -50,
                y: 30,
                onClick: () => {
                    this.app.popScene()
                    this.app.pushScene(new SensorSelect(this.app, CursorSceneEnum.LiveDataViewer))
                },
            })

            this.recordDataBtn = new Button({
                parent: null,
                style: ButtonStyles.Transparent,
                icon: "edit_program",
                ariaId: "Record",
                x: 0,
                y: 30,
                onClick: () => {
                    this.app.popScene()
                    this.app.pushScene(new ClearDataLoggerScreen(this.app))
                },
            })

            this.viewBtn = new Button({
                parent: null,
                style: ButtonStyles.Transparent,
                icon: "largeDisk",
                ariaId: "View",
                x: 50,
                y: 30,
                onClick: () => {
                    this.app.popScene()
                    this.app.pushScene(new DataViewSelect(this.app))
                },
            })

            const btns: Button[] = [this.liveDataBtn, this.recordDataBtn, this.viewBtn]
            this.navigator.addButtons(btns)
        }

        private drawVersion() {
            const font = simage.font5
            Screen.print(
                "v1.2",
                Screen.RIGHT_EDGE - font.charWidth * "v1.2".length,
                Screen.BOTTOM_EDGE - font.charHeight - 2,
                0xb,
                font
            )
        }

        private yOffset = -Screen.HEIGHT >> 1
        draw() {
            Screen.fillRect(
                Screen.LEFT_EDGE,
                Screen.TOP_EDGE,
                Screen.WIDTH,
                Screen.HEIGHT,
                0xc
            )

            this.yOffset = Math.min(0, this.yOffset + 2)
            const t = control.millis()
            const dy = this.yOffset == 0 ? (Math.idiv(t, 800) & 1) - 1 : 0
            const margin = 2
            const OFFSET = (Screen.HEIGHT >> 1) - wordLogo.height - margin
            const y = Screen.TOP_EDGE + OFFSET //+ dy
            Screen.drawTransparentImage(
                wordLogo,
                Screen.LEFT_EDGE + ((Screen.WIDTH - wordLogo.width) >> 1)// + dy
                ,
                y + this.yOffset
            )
            Screen.drawTransparentImage(
                microbitLogo,
                Screen.LEFT_EDGE +
                    ((Screen.WIDTH - microbitLogo.width) >> 1) + dy
                    ,
                y - wordLogo.height + this.yOffset + margin
            )
            if (!this.yOffset) {
                const tagline = resolveTooltip("tagline")
                Screen.print(
                    tagline,
                    Screen.LEFT_EDGE +
                        ((Screen.WIDTH + wordLogo.width) >> 1) 
                        + dy
                        -
                        microcode.font.charWidth * tagline.length,
                    Screen.TOP_EDGE +
                        OFFSET +
                        wordLogo.height +
                        dy +
                        this.yOffset +
                        1,
                    0xb,
                    microcode.font
                )
            }

            this.recordDataBtn.draw()
            this.liveDataBtn.draw()
            this.viewBtn.draw()

            this.drawVersion()
            super.draw()
        }
    }
}
