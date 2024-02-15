namespace microcode {
    export enum CursorSceneEnum {
        LiveDataViewer,
        SensorSelect,
        MeasurementConfigSelect
    }

    export function generateScene(sceneEnum: CursorSceneEnum, app: App, 
        userOpts?: {sensorFn: () => number, sensorName: string}, 
        nextScene?: CursorSceneEnum
    ){
        switch (sceneEnum) {
            case CursorSceneEnum.LiveDataViewer:
                return new LiveDataViewer(app, userOpts)

            case CursorSceneEnum.SensorSelect:
                return new SensorSelect(app, nextScene)

            case CursorSceneEnum.MeasurementConfigSelect:
                return new MeasurementConfigSelect(app, userOpts)
    
            default:
                return new LiveDataViewer(app, userOpts);
        }
    }   
}