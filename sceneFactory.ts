namespace microcode {
    export enum CursorSceneEnum {
        LiveDataViewer,
        SensorSelect,
        MeasurementConfigSelect,
        RecordData,
    }


    export function generateScene(sceneEnum: CursorSceneEnum, app: App, sensors: Sensor[], mOpts?: MeasurementOpts, nextScene?: CursorSceneEnum) {
        switch (sceneEnum) {
            case CursorSceneEnum.LiveDataViewer:
                return new LiveDataViewer(app, sensors)

            case CursorSceneEnum.SensorSelect:
                return new SensorSelect(app, nextScene)

            case CursorSceneEnum.MeasurementConfigSelect:
                return new MeasurementConfigSelect(app, sensors)

            case CursorSceneEnum.RecordData:
                return new DataRecorder(app, mOpts, sensors)
    
            default:
                return new LiveDataViewer(app, sensors);
        }
    }   
}