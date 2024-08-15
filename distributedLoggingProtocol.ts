namespace microcode {
    //** See .initialiseCommunication() */
    const RADIO_GROUP: number = 1;
    //** See .initialiseCommunication() */
    const TRANSMIT_POWER: number = 5;
    //** See .initialiseCommunication() */
    const FREQUENCY_BAND: number = 0;

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
    export const enum NETWORK_COMMAND {
        JOIN_REQUEST,
        START_LOGGING,
        BECOME_TARGET,
        GET_ID,
        DATA_STREAM,
        DATA_STREAM_FINISH
    }

    /**
     * The exact string send over radio to convey a NETWORK_COMMAND
     */
    export const NETWORK_COMMAND_STRING = [
        "J", // "JOIN_REQUEST",
        "S", // "START_LOGGING",
        "T", // "BECOME_TARGET",
        "G", // "GET_ID",
        "D", // "DATA_STREAM",
        "F"  // "DATA_STREAM_FINISH"
    ]

    /**
     * Each message (see NETWORK_COMMAND and NETWORK_COMMAND_STRING) has these components.
     */
    const enum MESSAGE_COMPONENT {
        NETWORK_COMMAND,
        /** A CSV stream of data. */
        DATA_START
    }

    /** How long to wait between messages before timeout. */
    const MESSAGE_LATENCY_MS: number = 100;

    /** Default ID that all Microbits start with, 
     *  If a Microbit becomes a Commander it will give itself the ID 0. 
     *  If the Microbit finds an existing Commander it will be told to become a Target, and be given an ID
     */
    const UNINITIALISED_MICROBIT_ID: number = -1

    export interface ITargetDataLoggedCallback {
        callback(rowTheTargetLogged: string): void;
    }


    // KNOWN ISSUES:
    // If a Microbit without an Arcade Shield joins it will always become a Target, even if it is the first to join (so there is not yet a Commander)
    // The next Microbit with an Arcade Shield that joins will successfully become a Commander,
    //      The interaction with controlling these Targets works well. 
    //      The issue is that the Target in this case will not yet have a unique ID - it will still have the UNINITIALISED_MICROBIT_ID
    // To solve: Targets should respond to JOIN_REQUESTS and send their current ID, the Commander should send them back a new one (send them a BECOME_TARGET)
    //      Issue: this requires discrimination between Targets - since their could be multiple Targets with UNINITIALISED_MICROBIT_ID
    //          How to individually send them a unique ID?
    //      To solve: All Microbits send their ids and the Target generates a unique one.

    export class DistributedLoggingProtocol implements ITargetDataLoggedCallback {
        private app: App;

        //------------------------------------------------------
        // Variables used by both the Commander and the Targets:
        //------------------------------------------------------

        public id: number;
        public radioMode: RADIO_LOGGING_MODE;
        private arcadeShieldIsConnected: boolean;

        public static finishedLogging: boolean = false;

        //-----------------------------------
        // NETWORK_COMMAND MESSSAGE HANDLING:
        //-----------------------------------

        /** There is a limit on the length of radio messages, so longer messages - such as those required for:
         *      sending logs between the Target and the Commander
         *      sending the list of sensors and their configuration information from the Commander to the Target
         *  need to be split up into multiple messages.
         * 
         * This variable is sent to and set from the content in a message starting with NETWORK_COMMAND.START_LOGGING
         * Set alongside numberOfMessagesReceived
         */
        private numberOfMessagesExpected: number;

        /**
         * This variable is sent to and set from the content in a message starting with NETWORK_COMMAND.START_LOGGING
         * Set alongside numberOfMessagesExpected
         */
        private numberOfMessagesReceived: number;

        private sensors: Sensor[]
        
        //--------------------------
        // Commander only Variables:
        //--------------------------
        
        public numberOfTargetsConnected: number;
        
        private nextMicrobitIDToIssue: number;
        private callbackObj: ITargetDataLoggedCallback;
        
        /** Should the target send each row of data it logs back to the Commander? See DistributedLoggingProtocol.log() */
        private streamDataBack: boolean;

        constructor(app: App, arcadeShieldIsConnected: boolean, callbackObj?: ITargetDataLoggedCallback) {
            this.app = app;

            //------------------------------------------------------
            // Variables used by both the Commander and the Targets:
            //------------------------------------------------------

            this.id = UNINITIALISED_MICROBIT_ID;
            this.radioMode = RADIO_LOGGING_MODE.UNCONFIGURED;
            this.arcadeShieldIsConnected = arcadeShieldIsConnected;

            //-----------------------------------
            // NETWORK_COMMAND MESSSAGE HANDLING:
            //-----------------------------------

            this.numberOfMessagesExpected = 0;
            this.numberOfMessagesReceived = 0;

            this.sensors = []
            
            //--------------------------
            // Commander only Variables:
            //--------------------------
            
            this.numberOfTargetsConnected = 0;
            this.nextMicrobitIDToIssue = 0;
            this.callbackObj = callbackObj;
            this.streamDataBack = false

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

        callback(newRowAsCSV: string): void {
            if (DistributedLoggingProtocol.finishedLogging)
                this.sendMessage(this.createMessage(NETWORK_COMMAND.DATA_STREAM_FINISH))
            else
                this.sendMessage(NETWORK_COMMAND_STRING[NETWORK_COMMAND.DATA_STREAM] + "," + this.id + "," + newRowAsCSV)
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
            let message: string = NETWORK_COMMAND_STRING[cmdEnum] + ((data != null) ? "," : "")
            if (data != null)
                for (let i = 0; i < data.length; i++) {
                    message += data[i] + ((i + 1 != data.length) ? "," : "")
                }
            return message
        }

        private sendMessage(message: string): void {radio.sendString(message)}


        private initialiseCommunication() {
            radio.setGroup(RADIO_GROUP)
            radio.setTransmitPower(TRANSMIT_POWER)
            radio.setFrequencyBand(FREQUENCY_BAND)

            // A Microbit without an Arcade Shield cannot become a Commander; so force this Microbit to become a Target:
            if (!this.arcadeShieldIsConnected)
                this.becomeTarget()

            else {
                let responseReceived = false

                // Listen from a response from a Commander:
                radio.onReceivedString(function(receivedString) {
                    const message = receivedString.split(",")

                    // Command to become a target has been received:
                    if (message[MESSAGE_COMPONENT.NETWORK_COMMAND] == NETWORK_COMMAND_STRING[NETWORK_COMMAND.BECOME_TARGET]) {
                        responseReceived = true
                        this.id = message[MESSAGE_COMPONENT.DATA_START]
                    }
                })

                // The join request message, will be sent out and waited on 5 times:
                const message: string = this.createMessage(NETWORK_COMMAND.JOIN_REQUEST)

                // Timeout:
                for (let _ = 0; _ < 3; _++) {
                    // Account for onReceivedString processing:
                    this.sendMessage(message)
                    basic.pause(MESSAGE_LATENCY_MS)

                    // Means a Commander has replied:
                    if (responseReceived)
                        break
                    basic.pause(MESSAGE_LATENCY_MS)
                }

                // ---------------------------------
                // Become the Commander or a Target:
                // ---------------------------------

                if (responseReceived)
                    this.becomeTarget()
                else
                    this.becomeCommander()
            }
        }

        private addSensor(sensor: Sensor) {this.sensors.push(sensor)}

        private becomeTarget() {
            /**
             * Internal function responsible for choosing the correct response to the incoming message.
             * Default state of radio.onReceivedString()
             * Message with 'NETWORK_COMMAND.START_LOGGING' -> 'radio.onReceivedString(getSensorConfigData)'
             * @param receivedString The first message in a command; SENDER_ID + NETWORK_COMMAND + ?ADDITIONAL_INFO (number of future messages for START_LOGGING as an example)
             */
            radio.onReceivedString(function (receivedString: string): void {
                const message = receivedString.split(",")

                if (message[MESSAGE_COMPONENT.NETWORK_COMMAND] == NETWORK_COMMAND_STRING[NETWORK_COMMAND.START_LOGGING]) {
                    this.numberOfMessagesExpected = message[MESSAGE_COMPONENT.DATA_START]
                    this.streamDataBack = message[MESSAGE_COMPONENT.DATA_START + 1] == "1"
                    this.numberOfMessagesReceived = 0
                    this.sensors = []

                    if (this.id == UNINITIALISED_MICROBIT_ID)
                        this.sendMessage(this.createMessage(NETWORK_COMMAND.JOIN_REQUEST))
                }

                else if (message[MESSAGE_COMPONENT.NETWORK_COMMAND] == NETWORK_COMMAND_STRING[NETWORK_COMMAND.BECOME_TARGET]) {
                    this.id = message[MESSAGE_COMPONENT.DATA_START]
                }

                // /**
                //  * COMMANDER REQUESTS ID
                //  */
                // else if (message[MESSAGE_COMPONENT.NETWORK_COMMAND] == NETWORK_COMMAND_STRING[NETWORK_COMMAND.DATA_STREAM]) {
                //     this.sendMessage(this.createMessage(NETWORK_COMMAND.GET_ID, [this.id]))
                // }

                else if (message[MESSAGE_COMPONENT.NETWORK_COMMAND] == NETWORK_COMMAND_STRING[NETWORK_COMMAND.DATA_STREAM]) {
                    if (this.numberOfMessagesReceived < this.numberOfMessagesExpected) {
                        this.numberOfMessagesReceived += 1

                        const dataStream = message.slice(MESSAGE_COMPONENT.DATA_START)
                        const sensorName = dataStream[0]

                        let sensor = SensorFactory.getFromRadioName(sensorName)

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

                        this.addSensor(sensor)

                        // Reset state after all messages for this request are handled:
                        if (this.numberOfMessagesReceived >= this.numberOfMessagesExpected) {
                            this.numberOfMessagesReceived = 0
                            this.numberOfMessagesExpected = 0

                            if (this.arcadeShieldIsConnected) {
                                this.app.popScene()
                                this.app.pushScene(new DataRecorder(this.app, this.sensors))
                            }
                            else {
                                const scheduler = new SensorScheduler(this.sensors, true)
                                scheduler.start(((this.streamDataBack) ? this : null))
                            }
                        }
                    }
                }
            }) // end of radio.onReceivedString

            this.radioMode = RADIO_LOGGING_MODE.TARGET

            // Indicate the uBit is now a Target:
            if (!this.arcadeShieldIsConnected) {
                basic.showLeds(`
                    . # . # .
                    . # . # .
                    . . . . .
                    # . . . #
                    . # # # .
                `)
            }
        }

        //------------------------
        // Commander-only Methods:
        //------------------------

        public addTargetID(id: number) {}
        public getTargetIDs(): number[] {return []}

        private becomeCommander() {
            this.radioMode = RADIO_LOGGING_MODE.COMMANDER
            this.id = 0
            this.nextMicrobitIDToIssue = 1
            this.numberOfTargetsConnected = 0

            radio.onReceivedString(function commanderControlFlowFn(receivedString: string): void {
                const message = receivedString.split(",")
                
                /**
                 * INCOMING JOIN REQUEST
                 */
                if (message[MESSAGE_COMPONENT.NETWORK_COMMAND] == NETWORK_COMMAND_STRING[NETWORK_COMMAND.JOIN_REQUEST]) {
                    const becomeTargetMessage = this.createMessage(NETWORK_COMMAND.BECOME_TARGET, [this.nextMicrobitIDToIssue])
                    this.sendMessage(becomeTargetMessage)

                    this.nextMicrobitIDToIssue += 1
                    this.numberOfTargetsConnected += 1
                }

                // /**
                //  * INCOMING GET ID RESPONSE
                //  */
                // else if (message[MESSAGE_COMPONENT.NETWORK_COMMAND] == NETWORK_COMMAND_STRING[NETWORK_COMMAND.GET_ID]) {
                //     this.addTargetID(+message[MESSAGE_COMPONENT.DATA_START])
                // }

                /**
                 * INCOMING FINISHED RESPONSE
                 */
                else if (message[MESSAGE_COMPONENT.NETWORK_COMMAND] == NETWORK_COMMAND_STRING[NETWORK_COMMAND.DATA_STREAM_FINISH]) {
                    this.callbackObj.callback(NETWORK_COMMAND_STRING[NETWORK_COMMAND.DATA_STREAM_FINISH])
                }

                /**
                 * INCOMING DATA STREAM
                 */
                else if (message[MESSAGE_COMPONENT.NETWORK_COMMAND] == NETWORK_COMMAND_STRING[NETWORK_COMMAND.DATA_STREAM]) {
                    const cols = message.slice(MESSAGE_COMPONENT.DATA_START)

                    DistributedLoggingScreen.showTabularData = true
                    TabularDataViewer.updateDataRowsOnNextFrame = true
                    datalogger.log(
                        datalogger.createCV("Microbit", cols[0]),
                        datalogger.createCV("Sensor", cols[1]),
                        datalogger.createCV("Time (ms)", cols[2]),
                        datalogger.createCV("Reading", cols[3]),
                        datalogger.createCV("Event", cols[4])
                    )
                }
            })
        }


        public log(sensors: Sensor[], configs: RecordingConfig[], streamItBack: boolean) {
            const numberOfSensors = sensors.length

            let messages: string[] = [
                this.createMessage(NETWORK_COMMAND.START_LOGGING, ["" + numberOfSensors, ((streamItBack) ? "1" : "0")]) // START_LOGGING + number of messages + should the data be streamed back?
            ]

            for (let i = 0; i < numberOfSensors; i++) {
                messages.push(this.createMessage(NETWORK_COMMAND.DATA_STREAM, [sensors[i].getName(), serializeRecordingConfig(configs[i])]))
            }

            for (let i = 0; i < messages.length; i++) {
                this.sendMessage(messages[i])
                basic.pause(MESSAGE_LATENCY_MS)
            }
        }

        // public requestTargetIDs() {
        //     // this.x = []
        //     this.sendMessage(this.createMessage(NETWORK_COMMAND.GET_ID))
        //     // basic.pause(MESSAGE_LATENCY_MS)
        // }
    }
}