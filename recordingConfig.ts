namespace microcode {
    /**
     * Generated at recordingConfigSelection 
     * Passed to and owned by a sensor
     * The sensor uses this information to control how it logs readings
     */
    export type RecordingConfig = {
        measurements: number,
        period: number
        inequality?: string,
        comparator?: number
    };

    /**
     * Turn a RecordingConfig into a string that can be prepended with the shorthand for a sensor's name (see SensorFactory.getFromRadioName()),
     * This string can then be sent over the radio (see radioLoggingProtocol) by a Commander, a Target can then turn this string back into a Sensor and configure it.
     * @param config Either Period or Event measurement
     * @returns A string that can be prepended with a sensor shorthand (e.g: L + "," + serializeRecordingConfig()): meaning a Light sensor should have this RecordingConfig
     */
    export function serializeRecordingConfig(config: RecordingConfig): string {
        if (config == null)
            return ""

        if (config.inequality == null || config.comparator == null)
            return "P," + config.measurements + "," + config.period

        return "E," + config.measurements + "," + config.inequality + "," + config.comparator
    }
}