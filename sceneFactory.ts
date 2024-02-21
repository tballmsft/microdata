namespace microcode {
    export enum CursorSceneEnum {
        LiveDataViewer,
        SensorSelect,
        MeasurementConfigSelect,
        RecordData,
    }

    export function generateScene(sceneEnum: CursorSceneEnum, app: App, opts: MeasurementOpts): any;
    export function generateScene(sceneEnum: CursorSceneEnum, app: App, opts: SensorOpts): any;
    export function generateScene(sceneEnum: CursorSceneEnum, app: App, mOpts?: MeasurementOpts, sOpts?: SensorOpts, nextScene?: CursorSceneEnum) {
        switch (sceneEnum) {
            case CursorSceneEnum.LiveDataViewer:
                return new LiveDataViewer(app, [new LightSensor, new TemperatureSensor])

            case CursorSceneEnum.SensorSelect:
                return new SensorSelect(app, nextScene)

            // case CursorSceneEnum.MeasurementConfigSelect:
            //     return new MeasurementConfigSelect(app, sOpts)

            case CursorSceneEnum.RecordData:
                return new DataRecorder(app, mOpts)
    
            default:
                return new LiveDataViewer(app, [new LightSensor, new TemperatureSensor]);
        }
    }   
}