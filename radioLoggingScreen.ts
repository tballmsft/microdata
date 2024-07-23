namespace microcode {
    /**
     * Responsible for handling the Distributed Communication and Command of multiple Microbits.
     * One Microbit is a Commander, that can manage and send instructions over radio to other Microbits (Targets).
     * The Commander MUST have an Arcade Shield, but it can manage Target Microbits regardless of whether or not they have an Arcade Shield.
     * 
     * The Commander and the Targets both have a GUI for management/information. Information for a Target without an Arcade Shield is displayed in on the 5x5 LED matrix.
     */
    export class RadioLoggingScreen extends Scene implements ITargetHasLoggedDataCallback{
        private radioLogger: RadioLoggingProtocol;
        private logMessageSent: boolean;

        constructor(app: App) {
            super(app, "distributedLogging")

            this.radioLogger = new RadioLoggingProtocol(app, true)
            this.logMessageSent = false;
        }

        /* override */ startup() { super.startup() }


        callback(rowTheTargetLogged: string): void {
            
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

            switch (this.radioLogger.radioMode) {
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

                    screen.print(
                        "This Microbit is a\ncommander.\nUse the options below to\ncontrol other Microbits.",
                        2,
                        19,
                        1
                    )

                    screen.print(
                        this.radioLogger.numberOfTargetsConnected + " Microbits connected.",
                        2,
                        70,
                        1
                    )

                    if (!this.logMessageSent) {
                        screen.printCenter(
                            "Press A to send a",
                            90
                        )

                        screen.printCenter(
                            "Temperature Log request!",
                            98
                        )
                    }
                    else
                        screen.printCenter(
                            "Log request sent!",
                            90
                        )                        

                    break;
                }

                case RADIO_LOGGING_MODE.TARGET: {
                    const connectedText = "Connected to Commander,"
                    const asMicrobit    = "as Microbit " + this.radioLogger.id + "."
                    
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

            super.draw()
        }
    }
}