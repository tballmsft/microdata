namespace microcode {
    /**
     * Used to lookup the implemented events via sensorEventFunctionLookup[]
     * 
     * Currently only events that check for inequalities are implemented,
     *      The only sensors that are incompatible with this are Buttons
     * The following code may be generalised to support them though.
     */
    export const sensorEventSymbols = ["=", ">", "<", ">=", "<="]

    
    /**
     * Type for value bound to inequality key within sensorEventFunctionLookup
     * 
     * One of these is optionally held by a sensor - see by sensor.setRecordingConfig
     */
    export type SensorEventFunction = (reading: number, comparator: number) => boolean

    /** 
     * Get aa function that performs that inequality check & logs it with an event description if the event has triggered.
     */
    export const sensorEventFunctionLookup: {[inequality: string]: SensorEventFunction} = {
        "=":  function(reading: number, comparator: number) {return reading == comparator},
        ">":  function(reading: number, comparator: number) {return reading >  comparator},
        "<":  function(reading: number, comparator: number) {return reading <  comparator},
        ">=": function(reading: number, comparator: number) {return reading >= comparator},
        "<=": function(reading: number, comparator: number) {return reading <= comparator}
    }
}