// namespace microcode {
//     /**
//      * Responsible for handling the Distributed Communication and Command of multiple Microbits.
//      * One Microbit is a Commander, that can manage and send instructions over radio to other Microbits (Targets).
//      * The Commander MUST have an Arcade Shield, but it can manage Target Microbits regardless of whether or not they have an Arcade Shield.
//      * 
//      * The Commander and the Targets both have a GUI for management/information. Information for a Target without an Arcade Shield is displayed in on the 5x5 LED matrix.
//      */
//     export class DistributedLoggingScreen extends CursorScene implements ITargetDataLoggedCallback {
//         private distributedLogger: DistributedLoggingProtocol;

//         private startLoggingBtn: Button
//         private startLoggingAndStreamingBtn: Button
//         private distributedLoggingBtn: Button

//         constructor(app: App) {
//             super(app)
//             this.distributedLogger = new DistributedLoggingProtocol(app, true)
//         }

//         callback(newRowAsCSV: string): void {

//         }
        
//         /* override */ startup() {
//             super.startup()

//             control.onEvent(
//                 ControllerButtonEvent.Pressed,
//                 controller.B.id,
//                 () => {
//                     this.app.popScene()
//                     this.app.pushScene(new Home(this.app));
//                 }
//             )

//             this.cursor.visible = true
//             if (this.distributedLogger.radioMode != RADIO_LOGGING_MODE.COMMANDER)
//                 this.cursor.visible = false

//             this.startLoggingBtn = new Button({
//                 parent: null,
//                 style: ButtonStyles.Transparent,
//                 icon: "radio_set_group",
//                 ariaId: "Start logging",
//                 x: -50,
//                 y: 30,
//                 onClick: () => {
//                     const sensors: Sensor[] = [new LightSensor(), new TemperatureSensor()]
//                     const configs: RecordingConfig[] = [{measurements: 6, period: 10}, {measurements: 6, period: 1000}]

//                     this.distributedLogger.log(sensors, configs, false)
//                 },
//             })

//             this.startLoggingAndStreamingBtn = new Button({
//                 parent: null,
//                 style: ButtonStyles.Transparent,
//                 icon: "radio_set_group",
//                 ariaId: "Start streaming",
//                 x: 0,
//                 y: 30,
//                 onClick: () => {
//                     const sensors: Sensor[] = [new LightSensor(), new TemperatureSensor()]
//                     const configs: RecordingConfig[] = [{measurements: 6, period: 1000}, {measurements: 6, period: 1000}]

//                     this.distributedLogger.log(sensors, configs, true)
//                 },
//             })

//             this.distributedLoggingBtn = new Button({
//                 parent: null,
//                 style: ButtonStyles.Transparent,
//                 icon: "linear_graph_1",
//                 ariaId: "linear_graph",
//                 x: 50,
//                 y: 30,
//                 onClick: () => {

//                 },
//             })

//             const btns: Button[] = [this.startLoggingBtn, this.startLoggingAndStreamingBtn, this.distributedLoggingBtn]
//             this.navigator.addButtons(btns)
//         }

//         draw() {
//             Screen.fillRect(
//                 Screen.LEFT_EDGE,
//                 Screen.TOP_EDGE,
//                 Screen.WIDTH,
//                 Screen.HEIGHT,
//                 0xc
//             )

//             const headerY = 2

//             switch (this.distributedLogger.radioMode) {
//                 case RADIO_LOGGING_MODE.UNCONFIGURED: {
//                     screen.printCenter(
//                         "Searching for Microbits...",
//                         2
//                     )
//                     break;
//                 }

//                 case RADIO_LOGGING_MODE.COMMANDER: {
//                     screen.printCenter(
//                         "Commander Mode",
//                         2
//                     )

//                     this.startLoggingBtn.draw()
//                     this.startLoggingAndStreamingBtn.draw()
//                     this.distributedLoggingBtn.draw()

//                     break;
//                 }

//                 case RADIO_LOGGING_MODE.TARGET: {
//                     const connectedText = "Connected to Commander,"
//                     const asMicrobit    = "as Microbit " + this.distributedLogger.id + "."
                    
//                     screen.print(
//                         connectedText,
//                         Screen.HALF_WIDTH - ((connectedText.length * font.charWidth) / 2),
//                         2
//                     )

//                     // Left-aligned with above text
//                     screen.print(
//                         asMicrobit,
//                         Screen.HALF_WIDTH - ((connectedText.length * font.charWidth) / 2),
//                         12
//                     )
//                     break;
//                 }
            
//                 default:
//                     break;
//             }

//             super.draw()
//         }
//     }
// }



namespace microcode {
    const enum UI_STATE {
        SHOWING_OPTIONS,
        SHOWING_CONNECTED_MICROBITS
    }

    /**
     * Responsible for handling the Distributed Communication and Command of multiple Microbits.
     * One Microbit is a Commander, that can manage and send instructions over radio to other Microbits (Targets).
     * The Commander MUST have an Arcade Shield, but it can manage Target Microbits regardless of whether or not they have an Arcade Shield.
     * 
     * The Commander and the Targets both have a GUI for management/information. Information for a Target without an Arcade Shield is displayed in on the 5x5 LED matrix.
     */
    export class DistributedLoggingScreen extends CursorScene implements ITargetDataLoggedCallback {
        private uiState: UI_STATE
        private distributedLogger: DistributedLoggingProtocol;

        private targetMicrobitsBtn: Button
        private startLoggingBtn: Button
        private startLoggingAndStreamingBtn: Button
        private distributedLoggingBtn: Button

        constructor(app: App) {
            super(app)
            this.uiState = UI_STATE.SHOWING_OPTIONS
            this.distributedLogger = new DistributedLoggingProtocol(app, true)
        }

        callback(newRowAsCSV: string): void {

        }
        
        /* override */ startup() {
            super.startup()

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.B.id,
                () => {
                    this.app.popScene()
                    this.app.pushScene(new Home(this.app));
                }
            )

            this.cursor.visible = true
            if (this.distributedLogger.radioMode != RADIO_LOGGING_MODE.COMMANDER)
                this.cursor.visible = false

            this.targetMicrobitsBtn = new Button({
                parent: null,
                style: ButtonStyles.Transparent,
                icon: "radio_set_group",
                ariaId: "See connected Microbits",
                x: -60,
                y: 30,
                onClick: () => {
                    this.uiState = UI_STATE.SHOWING_CONNECTED_MICROBITS
                    // this.distributedLogger.requestTargetIDs()
                },
            })

            this.startLoggingBtn = new Button({
                parent: null,
                style: ButtonStyles.Transparent,
                icon: "radio_set_group",
                ariaId: "Start logging",
                x: -20,
                y: 30,
                onClick: () => {
                    const sensors: Sensor[] = [new LightSensor(), new TemperatureSensor()]
                    const configs: RecordingConfig[] = [{measurements: 6, period: 10}, {measurements: 6, period: 1000}]

                    this.distributedLogger.log(sensors, configs, false)
                },
            })

            this.startLoggingAndStreamingBtn = new Button({
                parent: null,
                style: ButtonStyles.Transparent,
                icon: "radio_set_group",
                ariaId: "Start streaming",
                x: 20,
                y: 30,
                onClick: () => {
                    const sensors: Sensor[] = [new LightSensor(), new TemperatureSensor()]
                    const configs: RecordingConfig[] = [{measurements: 6, period: 1000}, {measurements: 6, period: 1000}]

                    this.distributedLogger.log(sensors, configs, true)
                },
            })

            this.distributedLoggingBtn = new Button({
                parent: null,
                style: ButtonStyles.Transparent,
                icon: "linear_graph_1",
                ariaId: "linear_graph",
                x: 60,
                y: 30,
                onClick: () => {

                },
            })

            const btns: Button[] = [this.targetMicrobitsBtn, this.startLoggingBtn, this.startLoggingAndStreamingBtn, this.distributedLoggingBtn]
            this.navigator.addButtons(btns)
        }

        draw() {
            Screen.fillRect(
                Screen.LEFT_EDGE,
                Screen.TOP_EDGE,
                Screen.WIDTH,
                Screen.HEIGHT,
                0xc
            )

            const headerY = 2

            switch (this.uiState) {
                case UI_STATE.SHOWING_OPTIONS: {
                    switch (this.distributedLogger.radioMode) {
                        case RADIO_LOGGING_MODE.UNCONFIGURED: {
                            screen.printCenter(
                                "Searching for Microbits...",
                                2
                            )
                            break;
                        }
    
                        case RADIO_LOGGING_MODE.COMMANDER: {
                            screen.printCenter(
                                "Commander Mode",
                                2
                            )
    
                            this.targetMicrobitsBtn.draw()
                            this.startLoggingBtn.draw()
                            this.startLoggingAndStreamingBtn.draw()
                            this.distributedLoggingBtn.draw()
    
                            break;
                        }
    
                        case RADIO_LOGGING_MODE.TARGET: {
                            const connectedText = "Connected to Commander,"
                            const asMicrobit    = "as Microbit " + this.distributedLogger.id + "."
                            
                            screen.print(
                                connectedText,
                                Screen.HALF_WIDTH - ((connectedText.length * font.charWidth) / 2),
                                2
                            )
    
                            // Left-aligned with above text
                            screen.print(
                                asMicrobit,
                                Screen.HALF_WIDTH - ((connectedText.length * font.charWidth) / 2),
                                12
                            )
                            break;
                        }
                    
                        default:
                            break;
                    }
                    break;
                } // end of UI_STATE.SHOWING_OPTIONS case

                case UI_STATE.SHOWING_CONNECTED_MICROBITS: {
                    let y = 10
                    // this.distributedLogger.getTargetIDs().forEach(id => {
                    //     screen.printCenter(
                    //         "" + id,
                    //         y
                    //     )
                    //     y += 10
                    // })
                    break;
                } // end of UI_STATE.SHOWING_CONNECTED_MICROBITS case
            
                default:
                    break;
            }

            super.draw()
        }
    }
}