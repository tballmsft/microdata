namespace microcode {
    /**
     * Generated at recordingConfigSelection 
     * Passed to and owned by a sensor
     * The sensor uses this information to control how it logs readings
     */
    export type RecordingConfig = {
        measurements: number,
        period: number,
        delay: number
    };


    /**
     * Generated at recordingConfigSelection
     * Passed to and owned by a sensor
     * The sensor uses this information to control how it logs events from the sensor
     */
    export type EventConfig = {
        measurements: number,
        inequality: string,
        comparator: number
    };
}