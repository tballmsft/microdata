namespace microcode {
    export enum SensorID {
        Light,
        Temperature,
        Accelerometer,
        Pin,
        Magnet,
        Rotation,
        LogoPress,
        CompassHeading,
        Volume,
        ButtonPress
    }


    /**
     * Specification of the sensor and its parameters.
     * Passed into the SensorFactory along with the sensor's recording config.
     */
    export class SensorBlueprint {
        public readonly id: SensorID
        public readonly dim?: Dimension
        public readonly pin?: TouchPin
        public readonly rot?: Rotation

        constructor(settings: {id: SensorID, dim?: Dimension, pin?: TouchPin, rot?: Rotation}) {
            this.id = settings.id
            this.dim = settings.dim
            this.pin = settings.pin
            this.rot = settings.rot
        }
    }

    export class SensorFactory {
        public static new(blueprint: SensorBlueprint, config: RecordingConfig): Sensor {
            switch (blueprint.id) {
                case SensorID.Light: return new LightSensor(config)
                case SensorID.Temperature: return new TemperatureSensor(config)
                case SensorID.Accelerometer: return new AccelerometerSensor(blueprint.dim, config)
                case SensorID.Pin: return new PinSensor(blueprint.pin, config)
                case SensorID.Magnet: return new MagnetSensor(blueprint.dim, config)
                case SensorID.Rotation: return new RotationSensor(blueprint.rot, config)
                case SensorID.LogoPress: return new LogoPressSensor(config)
                case SensorID.CompassHeading: return new CompassHeadingSensor(config)
                case SensorID.Volume: return new VolumeSensor(config)
                case SensorID.ButtonPress: return new ButtonPressSensor(config)
            
                default: return new LightSensor(config);
            }
        }
    }
}