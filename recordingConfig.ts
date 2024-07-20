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


    export function serializeRecordingConfig(config: RecordingConfig): string {
        if (config == null)
            return ""

        if (config.inequality == null || config.comparator == null)
            return "PERIOD, " + config.measurements + ", " + config.period

        return "EVENT, " + config.measurements + ", " + config.inequality + ", " + config.comparator
    }
}