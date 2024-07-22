namespace microcode {
    //** See .initialiseCommunication() */
    const RADIO_GROUP = 1;
    //** See .initialiseCommunication() */
    const TRANSMIT_POWER = 5;
    //** See .initialiseCommunication() */
    const FREQUENCY_BAND = 0;


    /**
     * Is this Microbit sending commands to others or is it being instructed by a Commander? 
     */
    export const enum RADIO_LOGGING_MODE {
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
        START_LOGGING,
        BECOME_TARGET,
        DATA_STREAM,
        ACK
    }

    /**
     * The exact string send over radio to convey a NETWORK_COMMAND
     */
    const NETWORK_COMMAND_STRING = [
        "J", // "JOIN_REQUEST",
        "S", // "START_LOGGING",
        "T", // "BECOME_TARGET",
        "D", // "DATA_STREAM",
        "A"
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

        //-----------------------------------
        // NETWORK_COMMAND MESSSAGE HANDLING:
        //-----------------------------------

        private ackReceived: boolean
        private numberOfMessagesExpected: number
        private numberOfMessagesReceived: number
        private sensors: Sensor[]

        //--------------------------
        // Commander only Variables:
        //--------------------------
        
        public numberOfTargetsConnected: number;
        private nextMicrobitIDToIssue: number;
        public logMessageSent: boolean;

        constructor(app: App, arcadeShieldIsConnected: boolean) {
            this.app = app

            //------------------------------------------------------
            // Variables used by both the Commander and the Targets:
            //------------------------------------------------------

            this.radioMode = RADIO_LOGGING_MODE.UNCONFIGURED
            this.id = UNINITIALISED_MICROBIT_ID
            this.arcadeShieldIsConnected = arcadeShieldIsConnected

            //-----------------------------------
            // NETWORK_COMMAND MESSSAGE HANDLING:
            //-----------------------------------

            this.ackReceived = false
            this.numberOfMessagesExpected = 0
            this.numberOfMessagesReceived = 0
            this.sensors = []

            //--------------------------
            // Commander only Variables:
            //--------------------------

            this.numberOfTargetsConnected = 0
            this.nextMicrobitIDToIssue = 0
            this.logMessageSent = false


            // Default Microbit display when unconnected (not a target):
            if (!arcadeShieldIsConnected) {
                basic.showLeds(`
                    . . . . .
                    . . . . .
                    . . . . .
                    . . . . .
                    . # # # .
                `)
            }
            this.initialiseCommunication()
        }


        //---------------------------------------------
        // Message Creation and Transmission Utilities:
        //---------------------------------------------

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

        private sendMessage(message: string): void {
            this.ackReceived = false
            radio.sendString(message)
        }

        private sendAck(): void {radio.sendString(this.id + "," + NETWORK_COMMAND_STRING[NETWORK_COMMAND.ACK])}


        //------------------------------
        // Communication Initialisation:
        //------------------------------


        /**
         * Try to contact a Commander and get an ID.
         * If there is timeout in the Commander search and an Arcade Shield is connected: become a Commander.
         * 
         * This Microbit will always become a Target if no Arcade Shield is connected.
         */
        private initialiseCommunication() {
            radio.setGroup(RADIO_GROUP)
            radio.setTransmitPower(TRANSMIT_POWER)
            radio.setFrequencyBand(FREQUENCY_BAND)

            let responseReceived = false

            // Listen from a response from a Commander:
            radio.onReceivedString(function(receivedString) {
                const message = receivedString.split(",", 3)

                // Command to become a target has been received:
                if (message[MESSAGE_COMPONENT.NETWORK_COMMAND] == NETWORK_COMMAND_STRING[NETWORK_COMMAND.BECOME_TARGET]) {
                    responseReceived = true
                    this.id = message[MESSAGE_COMPONENT.DATA_START]
                    this.sendAck()
                }
            })

            
            // The join request message, will be sent out and waited on 5 times:
            const message: string = this.createMessage(NETWORK_COMMAND.JOIN_REQUEST)

            // Timeout:
            for (let _ = 0; _ < 5; _++) {
                // Account for onReceivedString processing:
                this.sendMessage(message)
                basic.pause(MESSAGE_LATENCY_MS)

                // Means a Commander has replied:
                if (responseReceived)
                    break
                basic.pause(MESSAGE_LATENCY_MS)
            }

            //----------------------------------
            // Become the Commander or a Target:
            //----------------------------------

            if (responseReceived)
                this.becomeTarget()
            else
                this.becomeCommander()
        }


        //----------------------------------------------
        // Target and Commander functionality and setup:
        //----------------------------------------------

        /**
         * Sets an internal 'controlFlow' function outlining how the Target should respond to the radio.
         * This 'controlFlow' function will invoke an appropriate internal function to handle that request.
         * The radio will then go back to the 'controlFlow' function.
         * This simplifies the protocol for distributed features (since each require multiple messages, unique parsing and ACKS)
         */
        private becomeTarget(): void {
            this.radioMode = RADIO_LOGGING_MODE.TARGET

            // Indicate the uBit has connected:
            if (!this.arcadeShieldIsConnected) {
                basic.showLeds(`
                    . # . # .
                    . # . # .
                    . . . . .
                    # . . . #
                    . # # # .
                `)
            }
            
            // The default state; the target returns to this function after completing every call:
            radio.onReceivedString(targetControlFlowFn)


            //---------------------------------------------------------------------------------------
            // The rest of .becomeTarget() specifies the internal controlFlow and handling functions:
            //---------------------------------------------------------------------------------------

            /**
             * Internal function responsible for choosing the correct response to the incoming message.
             * Default state of radio.onReceivedString()
             * Message with 'NETWORK_COMMAND.START_LOGGING' -> 'radio.onReceivedString(getSensorConfigData)'
             * @param receivedString The first message in a command; SENDER_ID + NETWORK_COMMAND + ?ADDITIONAL_INFO (number of future messages for START_LOGGING as an example)
             */
            function targetControlFlowFn(receivedString: string): void {
                const message = receivedString.split(",")
    
                /**
                 * Command to start logging
                 */
                if (message[MESSAGE_COMPONENT.NETWORK_COMMAND] == NETWORK_COMMAND_STRING[NETWORK_COMMAND.START_LOGGING]) {
                    this.numberOfMessagesExpected = +receivedString.split(",").slice(MESSAGE_COMPONENT.DATA_START)[0]
                    this.numberOfMessagesReceived = 0

                    // this.sendAck()

                    let configuredSensors: Sensor[] = []

                    radio.onReceivedString(
                        /**
                         * The Commander will be sending this.numberOfMessagesExpected (set in above function) number of messages.
                         * Each message will be either:
                         * sensor_name_shorthand + ",P," + measurements + "," + period // PERIOD
                         * OR
                         * sensor_name_shorthand + ",E," + measurements + "," + inequality + "," + comparator // EVENT
                         * 
                         * See SensorFactory.getFromSensorName(sensorName) for sensor_name_shorthand
                         * See serializeRecordingConfig in recordingConfig.ts for "P" and "E"
                         * 
                         * The (measurements + period) or (measurements + inequality + comparator) is used to build a RecordingConfig.
                         * 
                         * this.sensors is mutated
                         * @param receivedString a single message after a NETWORK_COMMAND.START_LOGGING command.
                         */
                        function handleStartLoggingRequest(receivedString: string) {
                            if (this.numberOfMessagesReceived < this.numberOfMessagesExpected) {
                                this.numberOfMessagesReceived += 1

                                const dataStream = receivedString.split(",")
                                const sensorName = dataStream[0]
                                let sensor = SensorFactory.getFromSensorName(sensorName)

                                const configType = dataStream[1]
                                if (configType == "P") {
                                    const measurements: number = +dataStream[2]
                                    const period:       number = +dataStream[3]
                                    sensor.setConfig({measurements, period})
                                }

                                else if (configType == "E") {
                                    const measurements: number = +dataStream[2]
                                    const inequality:   string =  dataStream[3]
                                    const comparator:   number = +dataStream[4]
                                    sensor.setConfig({measurements, period: SENSOR_EVENT_POLLING_PERIOD_MS, inequality, comparator})
                                }

                                configuredSensors.push(sensor)
                                // this.sendAck()
                            
                                // Reset state after all messages for this request are handled:
                                if (this.numberOfMessagesReceived >= this.numberOfMessagesExpected) {
                                    this.numberOfMessagesReceived = 0
                                    this.numberOfMessagesExpected = 0
                                    this.ackReceived = false
                                    radio.onReceivedString(targetControlFlowFn)

                                    if (this.arcadeShieldIsConnected) {
                                        this.app.popScene()
                                        this.app.pushScene(new DataRecorder(this.app, configuredSensors))
                                    }
                                    else {
                                        const scheduler = new SensorScheduler(configuredSensors, true)
                                        scheduler.start()
                                    }
                                }
                            }
                        } // end of handleStartLoggingRequest
                    )
                }

                else if (message[MESSAGE_COMPONENT.NETWORK_COMMAND] == NETWORK_COMMAND_STRING[NETWORK_COMMAND.DATA_STREAM]) {

                }
            } // end of targetControlFlowFn
        }


        private becomeCommander(): void {
            this.radioMode = RADIO_LOGGING_MODE.COMMANDER
            this.id = 0
            this.nextMicrobitIDToIssue = 1
            this.numberOfTargetsConnected = 0

            function commanderControlFlowFn(receivedString: string): void {
                const message = receivedString.split(",", 2)
                
                /**
                 * INCOMING JOIN REQUEST
                 */
                if (message[MESSAGE_COMPONENT.NETWORK_COMMAND] == NETWORK_COMMAND_STRING[NETWORK_COMMAND.JOIN_REQUEST]) {
                    this.ackReceived = false

                    radio.onReceivedString(
                        function handleJoinRequest(receivedString: string) {
                            const ackMessage = receivedString.split(",", 2)
                            
                            if (ackMessage[MESSAGE_COMPONENT.NETWORK_COMMAND] == NETWORK_COMMAND_STRING[NETWORK_COMMAND.ACK]) {
                                this.ackReceived = true
                                this.nextMicrobitIDToIssue += 1
                                this.numberOfTargetsConnected += 1
                                radio.onReceivedString(commanderControlFlowFn) //  Return to default
                            }
                        } // end of handleJoinRequest
                    )

                    //----------------------------
                    // SEND BECOME TARGET MESSAGE:
                    //----------------------------

                    const becomeTargetMessage = this.createMessage(NETWORK_COMMAND.BECOME_TARGET, [this.nextMicrobitIDToIssue])
                    // for (let _ = 0; _ < 3; _++) {
                        if (!this.ackReceived) {
                            this.sendMessage(becomeTargetMessage)
                            basic.pause(MESSAGE_LATENCY_MS)
                        }

                        else {
                            this.nextMicrobitIDToIssue += 1
                            this.numberOfTargetsConnected += 1
                            // break
                        }
                    // }
                }

                /**
                 * INCOMING DATA STREAM REQUEST
                 */
                else if (message[MESSAGE_COMPONENT.NETWORK_COMMAND] == NETWORK_COMMAND_STRING[NETWORK_COMMAND.ACK]) {
                    this.ackReceived = true
                }

                /**
                 * INCOMING DATA STREAM REQUEST
                 */
                else if (message[MESSAGE_COMPONENT.NETWORK_COMMAND] == NETWORK_COMMAND_STRING[NETWORK_COMMAND.DATA_STREAM]) {

                }
            }

            radio.onReceivedString(commanderControlFlowFn)

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.A.id,
                () => {
                    this.logMessageSent = true
                    const numberOfSensors = 2

                    const messages: string[] = [
                        this.createMessage(NETWORK_COMMAND.START_LOGGING, ["" + numberOfSensors]),
                        "T," + serializeRecordingConfig({measurements: 12, period: 1000}),
                        "L," + serializeRecordingConfig({measurements: 10, period: SENSOR_EVENT_POLLING_PERIOD_MS, inequality: ">", comparator: 30})
                    ]

                    this.ackReceived = false
                    for (let i = 0; i < messages.length; i++) {
                        // for (let _ = 0; _ < 3; _++) {
                            // while (!this.ackReceived) {
                                // basic.showNumber(i)
                                this.sendMessage(messages[i])
                                basic.pause(MESSAGE_LATENCY_MS)
                            // }
                            // this.ackReceived = false
                        // } 
                    }

                    radio.onReceivedString(commanderControlFlowFn) //  Return to default
                }
            )
        }
    }
}