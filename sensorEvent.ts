namespace microcode {
    /**
     * Currently only events that check for inequalities are implemented,
     *      The only sensors that are incompatible with this are Buttons
     * The following code may be generalised to support them though.
     */


    /**
     * Function invoked to check if a reading <operator> target is true
     *      Upon that the callback is invoked
     *          The callback handles the event via sensors.handleEvent()
     *              This private method will cause the event to be logged.
     */
    type SensorEventFunction = (reading: number, target: number, callback: () => void) => void

    /**
     * Inequality as string to function that performs said inequality
     *      Inequality presence => callback()
     */
    export const sensorEventFunctionLookup: {[inequality: string]: SensorEventFunction} = {
        "=": function(reading: number, target: number, callback: () => void)  {if (reading === target) {callback()}},
        ">": function(reading: number, target: number, callback: () => void)  {if (reading > target) {callback()}},
        "<": function(reading: number, target: number, callback: () => void)  {if (reading < target) {callback()}},
        ">=": function(reading: number, target: number, callback: () => void) {if (reading >= target) {callback()}},
        "<=": function(reading: number, target: number, callback: () => void) {if (reading <= target) {callback()}},
    }

    export const sensorEventSymbols = ["=", ">", "<", ">=", "<="]

    /**
     * Simple class that is optionally owned by the recordingConfig.
     *      Acts as a wrapper for the above InequalityFunctions
     */
    export class SensorEvent {
        public readonly inequality: string // Used to build Logged String
        private readonly target: number
        private readonly inequalityFunction: SensorEventFunction

        constructor(inequality: string, target: number) {
            this.inequality = inequality
            this.target = target
            this.inequalityFunction = sensorEventFunctionLookup[inequality]
        }

        public handleEvent(reading: number, callback: () => void): void {
            this.inequalityFunction(reading, this.target, callback)
        }
    }
}