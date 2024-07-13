namespace microcode {
    //** See .initialiseCommunication() */
    const RADIO_GROUP = 1;
    //** See .initialiseCommunication() */
    const TRANSMIT_POWER = 7;
    //** See .initialiseCommunication() */
    const FREQUENCY_BAND = 0;

    /**
     * Is this Microbit sending commands to others or is it being instructed by a Commander? 
     */
    const enum MICROBIT_MODE {
        /**
         * Status when just starting prior to .initialiseCommunication() invocation.
         */
        UNCONFIGURED,
        /**
         * Must have an Arcade Shield connected and be first uBit.
         * Only 1 commander at a time.
         * User can command other uBit's to log data according to some config.
         */
        COMMANDER,
        /**
         * Default state if no Arcade Shield is connected.
         * Takes radio requests from the commander.
         */
        TARGET
    }


    /**
     * The types of requests that a uBit will send over radio.
     * See NETWORK_COMMAND_STRING for the string that is sent tot convey each Enum.
     */
    const enum NETWORK_COMMAND {
        JOIN_REQUEST,
        LOG_REQUEST,
        BECOME_TARGET,
        DATA_STREAM
    }

    /**
     * The exact string send over radio to convey a NETWORK_COMMAND
     */
    const NETWORK_COMMAND_STRING = [
        "JOIN_REQUEST",
        "LOG_REQUEST",
        "BECOME_TARGET",
        "DATA_STREAM"
    ]


    /**
     * Each message (see NETWORK_COMMAND and NETWORK_COMMAND_STRING) has these components.
     */
    const enum MESSAGE_COMPONENT {
        SENDER_ID,
        NETWORK_COMMAND,
        /** A CSV stream of data. */
        DATA_START
    }

    /** How long to wait between messages before timeout. */
    const MESSAGE_LATENCY_MS = 25;

    /** Default Microbit ID used prior to .initialiseCommunication() invocation. */
    const UNINITIALISED_MICROBIT_ID = -1



    /**
     * Standardised Message used to communicate with the other Microbits.
     * @param microbitID Sender ID
     * @param cmdEnum NETWORK_COMMAND that will become a NETWORK_COMMAND_STRING in the message
     * @param data Optional list of data.
     * @returns A formatted string that will be sent over radio via DistributedLogging.sendMessage()
     */
    function createMessage(microbitID: number, cmdEnum: NETWORK_COMMAND, data?: string[]): string {
        let message: string = microbitID + "," + NETWORK_COMMAND_STRING[cmdEnum] + ((data != null) ? "," : "")
        if (data != null)
            for (let i = 0; i < data.length; i++)
                message += data[i] + ((i + 1 == data.length) ? "," : "")
        return message
    }


    /**
     * Responsible for handling the Distributed Communication and Command of multiple Microbits.
     * One Microbit is a Commander, that can manage and send instructions over radio to other Microbits (Targets).
     * The Commander MUST have an Arcade Shield, but it can manage Target Microbits regardless of whether or not they have an Arcade Shield.
     * 
     * The Commander and the Targets both have a GUI for management/information. Information for a Target without an Arcade Shield is displayed in on the 5x5 LED matrix.
     */
    export class DistributedLogging extends Scene {
        /** 
         * If no Arcade Shield is connected this uBit will always become a Target. 
         * Behaviour does not change if the Arcade Shield is dynamically added.
         * See app.ts for more details.
         */
        private readonly arcadeShieldIsConnected: boolean;

        //------------------------------------------------------
        // Variables used by both the Commander and the Targets:
        //------------------------------------------------------

        /** This is set along with the microbitID inside .initialiseCommunication() */
        private microbitMode: MICROBIT_MODE;
        /** This is set along with the microbitMode inside .initialiseCommunication() */
        private microbitID: number;


        //--------------------------------------
        // Variables used by only the Commander:
        //--------------------------------------

        /** This value will be given to the next Target that joins the network as their unique ID. */
        private nextMicrobitIDToIssue: number;

        constructor(app: App, arcadeShieldConnected: boolean) {
            super(app, "distributedLogging")

            this.microbitMode = MICROBIT_MODE.UNCONFIGURED
            this.microbitID = UNINITIALISED_MICROBIT_ID
            this.arcadeShieldIsConnected = arcadeShieldConnected

            this.initialiseCommunication()
        }


        private sendMessage(message: string) {
            radio.sendString(message)
        }


        private initialiseCommunication() {
            radio.setGroup(RADIO_GROUP)
            radio.setTransmitPower(TRANSMIT_POWER)
            radio.setFrequencyBand(FREQUENCY_BAND)

            //------------------------------------------------------
            // Need to contact the controller & get an ID from them:
            // Send a message requesting to join the network:
            //      Wait for NETWORK_COMMAND.BECOME_TARGET
            //      After a time out become the Commander
            //------------------------------------------------------

            let responseReceived = false

            // This radio.onReceivedString() will be rebound later in this function,
            // This is depending on whether this initialisation makes this.microbitMode COMMANDER or TARGET
            radio.onReceivedString(function(receivedString) {
                const message = receivedString.split(",", 3)

                // Command to become a target has been received:
                if (message[MESSAGE_COMPONENT.NETWORK_COMMAND] == NETWORK_COMMAND_STRING[NETWORK_COMMAND.BECOME_TARGET]) {
                    responseReceived = true
                    this.microbitID = message[MESSAGE_COMPONENT.DATA_START]
                    basic.showString("T " + message[MESSAGE_COMPONENT.DATA_START])
                }
            })

            
            // Timeout:
            const joinMessage: string = createMessage(this.microbitID, NETWORK_COMMAND.JOIN_REQUEST) // microbitID == UNINITIALISED_MICROBIT_ID currently
            for (let _ = 0; _ < 3; _++) {
                this.sendMessage(joinMessage)

                // Account for onReceivedString processing:
                basic.pause(MESSAGE_LATENCY_MS)
                if (responseReceived)
                    break
                basic.pause(25)
            }


            //----------------------------------------------
            // Setup the radio to for Control or for Target:
            //----------------------------------------------
            
            // Become the Target:
            if (responseReceived || !this.arcadeShieldIsConnected) {
                this.microbitMode = MICROBIT_MODE.TARGET

                radio.onReceivedString(function(receivedString) {
                    const message = receivedString.split(",", 2)
    
                    if (message[MESSAGE_COMPONENT.NETWORK_COMMAND] == NETWORK_COMMAND_STRING[NETWORK_COMMAND.LOG_REQUEST]) {
                        this.sendMessage(createMessage(this.microbitID, NETWORK_COMMAND.BECOME_TARGET, [this.nextMicrobitIDToIssue]))
                        basic.showString("L")
                    }
                })
            }

            // Become the Commander:
            else {
                this.microbitMode = MICROBIT_MODE.COMMANDER
                this.microbitID = 0
                this.nextMicrobitIDToIssue = 1

                basic.showString("C")

                radio.onReceivedString(function(receivedString) {
                    const message = receivedString.split(",", 2)
    
                    if (message[MESSAGE_COMPONENT.NETWORK_COMMAND] == NETWORK_COMMAND_STRING[NETWORK_COMMAND.JOIN_REQUEST]) {
                        this.sendMessage(createMessage(this.microbitID, NETWORK_COMMAND.BECOME_TARGET, [this.nextMicrobitIDToIssue]))
                        this.nextMicrobitIDToIssue += 1
                        basic.showString("J")
                    }

                    else if (message[MESSAGE_COMPONENT.NETWORK_COMMAND] == NETWORK_COMMAND_STRING[NETWORK_COMMAND.DATA_STREAM]) {
                        const dataStream = receivedString.split(",").slice(MESSAGE_COMPONENT.DATA_START)
                        basic.showString("D")
                    }
                })
            }
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

            switch (this.microbitMode) {
                case MICROBIT_MODE.UNCONFIGURED: {
                    screen.printCenter(
                        "Searching for Microbits...",
                        2
                    )
                    break;
                }

                case MICROBIT_MODE.COMMANDER: {
                    screen.printCenter(
                        "Commander Mode",
                        2
                    )
                    break;
                }

                case MICROBIT_MODE.TARGET: {
                    const connectedText = "Connected to Commander,"
                    const asMicrobit = "as Microbit " + this.microbitID + "."
                    
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
        }
    }
}