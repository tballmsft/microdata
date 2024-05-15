namespace microcode {
    export class Home extends CursorScene {
        private recordDataBtn: Button
        private liveDataBtn: Button
        private viewBtn: Button
        private dataRows: string[][];

        constructor(app: App) {
            super(app)
        }

        /* override */ startup() {
            super.startup()

            datalogger.includeTimestamp(FlashLogTimeStampFormat.None)
            
            // Small write is currently needed to read all the existing data if the uBit has just been powered.
            // This is a high priority issue to fix.
            // Doing this useless write resolves the read issue though:
            datalogger.setColumns([
                "Sensor",
                "Time (ms)",
                "Reading",
                "Event"
            ])

            this.dataRows = []


            // for (let i = 0; i < 10; i++) {
            //     datalogger.log(
            //         datalogger.createCV("Sensor", "test"),
            //         datalogger.createCV("Time (ms)", "1000"),
            //         datalogger.createCV("Reading", +i),
            //         datalogger.createCV("Event", "N/A")
            //     )
            // }

            
            // const tokens = datalogger.getData().split("_")
            // const tokens = datalogger.getNRows(0, 10).split("_")

            // basic.showString(tokens.length)
            // const numberOfCols = 4
            
            // Skip the first column of each row (Time (Seconds)):
            // for (let i = 0; i < tokens.length - numberOfCols; i += numberOfCols) {
            //     this.dataRows[i / numberOfCols] = tokens.slice(i, i + numberOfCols);
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
                "v1.1",
                Screen.RIGHT_EDGE - font.charWidth * "v1.1".length,
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


            // for (let i = 0; i < this.dataRows.length; i++) {
            //     Screen.fillRect(
            //         Screen.LEFT_EDGE,
            //         Screen.TOP_EDGE,
            //         Screen.WIDTH,
            //         Screen.HEIGHT,
            //         0xc
            //     )
            //     screen.printCenter(this.dataRows[i][0], 10)
            //     screen.printCenter(this.dataRows[i][1], 20)
            //     screen.printCenter(this.dataRows[i][2], 30)
            //     screen.printCenter(this.dataRows[i][3], 40)
            //     basic.pause(1000)
            // }

            this.recordDataBtn.draw()
            this.liveDataBtn.draw()
            this.viewBtn.draw()

            this.drawVersion()
            super.draw()
        }
    }
}
