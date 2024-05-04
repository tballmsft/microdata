namespace microcode {
    export type RecordingConfig = {
        measurements: number,
        period: number,
        delay: number
    };

    export type EventConfig = {
        measurements: number,
        inequality: string,
        comparator: number
    };
}