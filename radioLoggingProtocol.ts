namespace microcode {
    //** See .initialiseCommunication() */
    const RADIO_GROUP = 1;
    //** See .initialiseCommunication() */
    const TRANSMIT_POWER = 7;
    //** See .initialiseCommunication() */
    const FREQUENCY_BAND = 0;

    export const enum RADIO_LOGGING_MODE {
        UNCONFIGURED,
        COMMANDER,
        TARGET
    }

    /**
     * The types of requests that a uBit will send over radio.
     * See NETWORK_COMMAND_STRING for the string that is sent tot convey each Enum.
     */
    const enum NETWORK_COMMAND {
        JOIN_REQUEST,
        START_LOGGING,
        BECOME_TARGET,
        DATA_STREAM
    }

    /**
     * The exact string send over radio to convey a NETWORK_COMMAND
     */
    const NETWORK_COMMAND_STRING = [
        "J", // "JOIN_REQUEST",
        "S", // "START_LOGGING",
        "T", // "BECOME_TARGET",
        "D" // "DATA_STREAM"
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
    const MESSAGE_LATENCY_MS = 100;

    const UNINITIALISED_MICROBIT_ID: number = -1
    
    export class RadioLoggingProtocol {
        private app: App;

        //------------------------------------------------------
        // Variables used by both the Commander and the Targets:
        //------------------------------------------------------
        public radioMode: RADIO_LOGGING_MODE;
        public id: number;
        private arcadeShieldIsConnected: boolean;
        
        //--------------------------
        // Commander only Variables:
        //--------------------------
        
        public numberOfTargetsConnected: number;
        private nextMicrobitIDToIssue: number;
        public logMessageSent: boolean;

        constructor(app: App, arcadeShieldIsConnected: boolean) {
            this.app = app

            this.radioMode = RADIO_LOGGING_MODE.UNCONFIGURED
            this.id = UNINITIALISED_MICROBIT_ID
            this.arcadeShieldIsConnected = arcadeShieldIsConnected

            //--------------------------
            // Commander only Variables:
            //--------------------------

            this.numberOfTargetsConnected = 0
            this.nextMicrobitIDToIssue = 0
            this.logMessageSent = false

            if (!arcadeShieldIsConnected)
                basic.showLeds(`
                    . . . . .
                    . . . . .
                    . . . . .
                    . . . . .
                    . # # # .
                `)
            this.initialiseCommunication()
        }

        /**
         * Standardised Message used to communicate with the other Microbits.
         * @param cmdEnum NETWORK_COMMAND that will become a NETWORK_COMMAND_STRING in the message
         * @param data Optional list of data.
         * @returns A formatted string that will be sent over radio via DistributedLogging.sendMessage()
         */
        private createMessage(cmdEnum: NETWORK_COMMAND, data?: string[]): string {
            let message: string = this.id + "," + NETWORK_COMMAND_STRING[cmdEnum] + ((data != null) ? "," : "")
            if (data != null)
                for (let i = 0; i < data.length; i++) {
                    message += data[i] + ((i + 1 != data.length) ? "," : "")
                }
            return message
        }

        private sendMessage(message: string): void { radio.sendString(message) }

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
                    this.id = message[MESSAGE_COMPONENT.DATA_START]
                }
            })

            // Timeout:
            const message: string = this.createMessage(NETWORK_COMMAND.JOIN_REQUEST) // microbitID == UNINITIALISED_MICROBIT_ID currently
            for (let _ = 0; _ < 5; _++) {
                // Account for onReceivedString processing:
                this.sendMessage(message)
                basic.pause(MESSAGE_LATENCY_MS)
                if (responseReceived)
                    break
                basic.pause(25)
            }

            //----------------------------------
            // Become the Commander or a Target:
            //----------------------------------
            
            // Become the Target:
            if (responseReceived) {
                this.radioMode = RADIO_LOGGING_MODE.TARGET
                
                if (!this.arcadeShieldIsConnected)
                    basic.showLeds(`
                        . # . # .
                        . # . # .
                        . . . . .
                        # . . . #
                        . # # # .
                    `)


                radio.onReceivedString(function(receivedString) {
                    const message = receivedString.split(",")
    
                    if (message[MESSAGE_COMPONENT.NETWORK_COMMAND] == NETWORK_COMMAND_STRING[NETWORK_COMMAND.START_LOGGING]) {
                        const dataStream = receivedString.split(",").slice(2)
                        const sensors = this.parseStartLoggingDataStream(dataStream)

                        // basic.showString(receivedString)
                        // basic.showString(dataStream[0])
                        // basic.showString(dataStream[1])
                        // basic.showString(dataStream[2])

                        if (this.arcadeShieldIsConnected) {
                            this.app.popScene()
                            this.app.pushScene(new DataRecorder(this.app, sensors))
                        }
                        else {
                            const scheduler = new SensorScheduler(sensors, true)
                            scheduler.start()
                        }
                    }
                })
            }

            // Become the Commander:
            else {
                this.radioMode = RADIO_LOGGING_MODE.COMMANDER
                this.id = 0
                this.nextMicrobitIDToIssue = 1
                this.numberOfTargetsConnected = 0

                radio.onReceivedString(function(receivedString) {
                    const message = receivedString.split(",", 2)
                    
                    if (message[MESSAGE_COMPONENT.NETWORK_COMMAND] == NETWORK_COMMAND_STRING[NETWORK_COMMAND.JOIN_REQUEST]) {
                        this.sendMessage(this.createMessage(NETWORK_COMMAND.BECOME_TARGET, [this.nextMicrobitIDToIssue]))
                        this.nextMicrobitIDToIssue += 1
                        this.numberOfTargetsConnected += 1
                    }

                    else if (message[MESSAGE_COMPONENT.NETWORK_COMMAND] == NETWORK_COMMAND_STRING[NETWORK_COMMAND.DATA_STREAM]) {

                    }
                })

                control.onEvent(
                    ControllerButtonEvent.Pressed,
                    controller.A.id,
                    () => {
                        this.logMessageSent = true
                        this.sendMessage(this.createMessage(NETWORK_COMMAND.START_LOGGING, ["Temp.", "14", "1000"]))
                    }
                )
            }
        }
        
        private parseStartLoggingDataStream(dataStream: string[]): Sensor[] {
            let sensors = [SensorFactory.getFromSensorName(dataStream[0])]

            // basic.showString(dataStream[0])
            // basic.showNumber(+dataStream[1])
            // basic.showNumber(+dataStream[2])

            const measurements: number = +dataStream[1]
            const period: number = +dataStream[2]

            sensors[0].setConfig({measurements, period})

            return sensors;
        }
    }
}