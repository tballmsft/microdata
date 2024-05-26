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
}