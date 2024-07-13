namespace microcode {
    const RADIO_GROUP = 1;
    const TRANSMIT_POWER = 7;
    const FREQUENCY_BAND = 0;

    const enum MICROBIT_MODE {
        CONTROLLER,
        TARGET
    }

    const enum NETWORK_COMMAND {
        JOIN_REQUEST,
        LOG_REQUEST,
        BECOME_TARGET,
        DATA_STREAM
    }

    const NETWORK_COMMAND_STRING = [
        "JOIN_REQUEST",
        "LOG_REQUEST",
        "BECOME_TARGET",
        "DATA_STREAM"
    ]

    const enum MESSAGE_COMPONENT {
        ID,
        NETWORK_COMMAND,
        DATA_START
    }

    const MESSAGE_LATENCY_MS = 50;

    function createMessage(microbitID: number, cmdEnum: NETWORK_COMMAND, data?: string[]): string {
        let message: string = microbitID + "," + NETWORK_COMMAND_STRING[cmdEnum] + ((data != null) ? "," : "")
        if (data != null)
            for (let i = 0; i < data.length; i++)
                message += data[i] + ((i + 1 == data.length) ? "," : "")
        return message
    }

    const UNINITIALISED_MICROBIT_ID = -1

    export class DistributedLogging extends Scene {
        private microbitMode: MICROBIT_MODE;
        private microbitID: number;
        private nextMicrobitIDToIssue: number;

        private readonly arcadeShieldIsConnected: boolean;

        constructor(app: App, arcadeShieldIsConnected: boolean) {
            super(app, "distributedLogging")

            this.microbitID = UNINITIALISED_MICROBIT_ID
            this.arcadeShieldIsConnected = arcadeShieldIsConnected
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
            //      After a time out become the controller
            //------------------------------------------------------

            let responseReceived = false

            // This radio.onReceivedString() will be rebound later in this function,
            // This is depending on whether this initialisation makes this.microbitMode CONTROLLER or TARGET
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


            //---------------------------------------
            // Setup the radio for Control or Target:
            //---------------------------------------
            
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

            // Become the Controller:
            else {
                this.microbitMode = MICROBIT_MODE.CONTROLLER
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
        }
    }
}