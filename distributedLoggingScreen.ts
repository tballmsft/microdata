namespace microcode {

    /**
     * Local enum used in .draw() to control what information should be shown
     */
    const enum UI_STATE {
        SHOWING_OPTIONS,
        SHOWING_CONNECTED_MICROBITS,
        SHOWING_LOGGING,
        SHOWING_STREAMING,
        SHOWING_DATA
    }

    /**
     * Responsible for handling the Distributed Communication and Command of multiple Microbits.
     * One Microbit is a Commander, that can manage and send instructions over radio to other Microbits (Targets).
     * The Commander MUST have an Arcade Shield, but it can manage Target Microbits regardless of whether or not they have an Arcade Shield.
     * 
     * The Commander and the Targets both have a GUI for management/information. Information for a Target without an Arcade Shield is displayed in on the 5x5 LED matrix.
     */
    export class DistributedLoggingScreen extends CursorScene {
        private uiState: UI_STATE
        private distributedLogger: DistributedLoggingProtocol;

        // private targetMicrobitsBtn: Button
        private startLoggingBtn: Button
        private startStreamingBtn: Button
        private showDataBtn: Button

        /** The user needs to set the sensors and config before sending the request to other Microbits to start logging htose sensors.
         *  In order to do this the Scene needs to change to the SensorSelection and then the recordingConfigSelection.
         *  At the end of the recordingConfigSelection the scene will change back to this DistributedLoggingScreen
         *  This variable is set before swapping to that SensorSelection scene - so that the users initial choice (of streaming the data back or not) is preserved.
         */
        public static streamDataBack = true

        constructor(app: App, sensors?: Sensor[], configs?: RecordingConfig[]) {
            super(app)
            this.uiState = UI_STATE.SHOWING_OPTIONS
            this.distributedLogger = new DistributedLoggingProtocol(app, true)

            if (sensors != null && configs != null) {
                this.uiState = (DistributedLoggingScreen.streamDataBack ? UI_STATE.SHOWING_STREAMING : UI_STATE.SHOWING_LOGGING)
                
                this.distributedLogger.log(sensors, configs, DistributedLoggingScreen.streamDataBack)
            }
        }
        
        /* override */ startup() {
            super.startup()

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.B.id,
                () => {
                    if (this.uiState != UI_STATE.SHOWING_OPTIONS) {
                        this.uiState = UI_STATE.SHOWING_OPTIONS
                        this.cursor.visible = true
                    }
                    else {
                        this.app.popScene()
                        this.app.pushScene(new Home(this.app));
                    }
                }
            )

            this.cursor.visible = true
            if (this.uiState != UI_STATE.SHOWING_OPTIONS)
                this.cursor.visible = false

            // this.targetMicrobitsBtn = new Button({
            //     parent: null,
            //     style: ButtonStyles.Transparent,
            //     icon: "linear_graph_2", // radio_set_group
            //     ariaId: "See connected Microbits",
            //     x: -60,
            //     y: 30,
            //     onClick: () => {
            //         this.uiState = UI_STATE.SHOWING_CONNECTED_MICROBITS
            //         // this.distributedLogger.requestTargetIDs()
            //     },
            // })

            this.startLoggingBtn = new Button({
                parent: null,
                style: ButtonStyles.Transparent,
                icon: "linear_graph_2",
                ariaId: "Start logging",
                x: -50,
                y: 30,
                onClick: () => {
                    DistributedLoggingScreen.streamDataBack = false
                    this.app.popScene()
                    this.app.pushScene(new SensorSelect(this.app, CursorSceneEnum.DistributedLogging))
                },
            })

            this.startStreamingBtn = new Button({
                parent: null,
                style: ButtonStyles.Transparent,
                icon: "linear_graph_2",
                ariaId: "Start streaming",
                x: 0,   
                y: 30,
                onClick: () => {
                    DistributedLoggingScreen.streamDataBack = true
                    this.app.popScene()
                    this.app.pushScene(new SensorSelect(this.app, CursorSceneEnum.DistributedLogging))
                },
            })

            this.showDataBtn = new Button({
                parent: null,
                style: ButtonStyles.Transparent,
                icon: "linear_graph_2",
                ariaId: "linear_graph",
                x: 50,
                y: 30,
                onClick: () => {
                    this.app.popScene()
                    this.app.pushScene(new TabularDataViewer(this.app, function () {this.app.popScene(); this.app.pushScene(new DistributedLoggingScreen(this.app))}))
                },
            })

            const btns: Button[] = [this.startLoggingBtn, this.startStreamingBtn, this.showDataBtn]
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
    
                            // this.targetMicrobitsBtn.draw()
                            this.startLoggingBtn.draw()
                            this.startStreamingBtn.draw()
                            this.showDataBtn.draw()
    
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

                case UI_STATE.SHOWING_LOGGING: {
                    screen.printCenter(
                        "Microbits are logging!",
                        Screen.HALF_HEIGHT
                    )
                    break
                }
            
                case UI_STATE.SHOWING_STREAMING: {
                    screen.printCenter(
                        "Receiving Microbit logs!",
                        Screen.HALF_HEIGHT
                    )
                    break
                }
            
                case UI_STATE.SHOWING_DATA: {
                    screen.printCenter(
                        "DATA",
                        Screen.HALF_HEIGHT
                    )
                    break
                }
            
                default:
                    break;
            }

            super.draw()
        }
    }
}