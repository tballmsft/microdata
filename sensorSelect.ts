namespace microcode {
    export const SENSOR_LOOKUP_TABLE: {[ariaID: string]: Sensor} = {
        "Accel. X": new AccelerometerSensor(Dimension.X),
        "Accel. Y": new AccelerometerSensor(Dimension.Y),
        "Accel. Z": new AccelerometerSensor(Dimension.Z),
        "Pitch": new RotationSensor(Rotation.Pitch),
        "Roll": new RotationSensor(Rotation.Roll),
        "Pin 0": new PinSensor(TouchPin.P0),
        "Pin 1": new PinSensor(TouchPin.P1),
        "Pin 2": new PinSensor(TouchPin.P2),
        "Light": new LightSensor(),
        "Temp.": new TemperatureSensor(),
        "Magnet X": new MagnetSensor(Dimension.X),
        "Logo Pressed": new LogoPressSensor(),
        "Volume": new VolumeSensor(),
        "Compass": new CompassHeadingSensor(),
        "Jac Light": new JacdacLightSensor(),
        "Jac Moist": new JacdacSoilMoistureSensor(),
        "Jac Dist": new JacdacDistanceSensor(),
        "Jac Flex": new JacdacFlexSensor(),
        "Jac Temp": new JacdacTemperatureSensor()
    }


    /**
     * Responsible for allowing the user to select sensors to record or view live readings from.
     *      The user may select any number of sensors to read from simultaneously.
     *      These sensors are passed to either the measurement screen or the live data view
     */
    export class SensorSelect extends CursorSceneWithPriorPage {
        private btns: Button[]
        private selectedSensorNames: string[]
        private nextSceneEnum: CursorSceneEnum
        
        constructor(app: App, nextSceneEnum: CursorSceneEnum) {
            super(app, function () {app.popScene(); app.pushScene(new Home(this.app))})
            this.btns = []
            this.selectedSensorNames = []
            this.nextSceneEnum = nextSceneEnum
        }

        /* override */ startup() {
            super.startup()

            //---------
            // Control:
            //---------

            this.btns.push(new Button({
                parent: null,
                style: ButtonStyles.Transparent,
                icon: "accelerometer",
                ariaId: "accelerometer X",
                x: -60,
                y: -40,
                onClick: () => {
                    const index = this.selectedSensorNames.indexOf("Accel. X")
                    if (index != -1) {
                        this.selectedSensorNames.splice(index, 1)
                    }
                    else {
                        this.selectedSensorNames.push("Accel. X")
                    }
                },          
                dynamicBoundaryColorsOn: true,
            }))

            this.btns.push(new Button({
                parent: null,
                style: ButtonStyles.Transparent,
                icon: "accelerometer",
                ariaId: "accelerometer Y",
                x: -30,
                y: -40,
                onClick: () => {
                    const index = this.selectedSensorNames.indexOf("Accel. Y")
                    if (index != -1) {
                        this.selectedSensorNames.splice(index, 1)
                    }
                    else {
                        this.selectedSensorNames.push("Accel. Y")
                    }
                },          
                dynamicBoundaryColorsOn: true,
            }))

            this.btns.push(new Button({
                parent: null,
                style: ButtonStyles.Transparent,
                icon: "accelerometer",
                ariaId: "accelerometer Z",
                x: 0,
                y: -40,
                onClick: () => {
                    const index = this.selectedSensorNames.indexOf("Accel. Z")
                    if (index != -1) {
                        this.selectedSensorNames.splice(index, 1)
                    }
                    else {
                        this.selectedSensorNames.push("Accel. Z")
                    }
                },          
                dynamicBoundaryColorsOn: true,
            }))

            this.btns.push(new Button({
                parent: null,
                style: ButtonStyles.Transparent,
                icon: "right_turn",
                ariaId: "Pitch",
                x: 30,
                y: -40,
                onClick: () => {
                    const index = this.selectedSensorNames.indexOf("Pitch")
                    if (index != -1) {
                        this.selectedSensorNames.splice(index, 1)
                    }
                    else {
                        this.selectedSensorNames.push("Pitch")
                    }
                }, 
                dynamicBoundaryColorsOn: true,          
            }))

            this.btns.push(new Button({
                parent: null,
                style: ButtonStyles.Transparent,
                icon: "right_spin",
                ariaId: "Roll",
                x: 60,
                y: -40,
                onClick: () => {
                    const index = this.selectedSensorNames.indexOf("Roll")
                    if (index != -1) {
                        this.selectedSensorNames.splice(index, 1)
                    }
                    else {
                        this.selectedSensorNames.push("Roll")
                    }
                },          
                dynamicBoundaryColorsOn: true, 
            }))

            // -----------

            this.btns.push(new Button({
                parent: null,
                style: ButtonStyles.Transparent,
                icon: "pin_0",
                ariaId: "Pin 0",
                x: -60,
                y: -11,
                onClick: () => {
                    const index = this.selectedSensorNames.indexOf("Pin 0")
                    if (index != -1) {
                        this.selectedSensorNames.splice(index, 1)
                    }
                    else {
                        this.selectedSensorNames.push("Pin 0")
                    }
                },          
                dynamicBoundaryColorsOn: true,
            }))

            this.btns.push(new Button({
                parent: null,
                style: ButtonStyles.Transparent,
                icon: "pin_1",
                ariaId: "Pin 1",
                x: -30,
                y: -11,
                onClick: () => {
                    const index = this.selectedSensorNames.indexOf("Pin 1")
                    if (index != -1) {
                        this.selectedSensorNames.splice(index, 1)
                    }
                    else {
                        this.selectedSensorNames.push("Pin 1")
                    }
                },          
                dynamicBoundaryColorsOn: true,
            }))


            this.btns.push(new Button({
                parent: null,
                style: ButtonStyles.Transparent,
                icon: "pin_2",
                ariaId: "Pin 2",
                x: 0,
                y: -11,
                onClick: () => {
                    const index = this.selectedSensorNames.indexOf("Pin 2")
                    if (index != -1) {
                        this.selectedSensorNames.splice(index, 1)
                    }
                    else {
                        this.selectedSensorNames.push("Pin 2")
                    }
                },          
                dynamicBoundaryColorsOn: true,
            }))


            this.btns.push(new Button({
                parent: null,
                style: ButtonStyles.Transparent,
                icon: "led_light_sensor",
                ariaId: "led_light_sensor",
                x: 30,
                y: -11,
                onClick: () => {
                    const index = this.selectedSensorNames.indexOf("Light")
                    if (index != -1) {
                        this.selectedSensorNames.splice(index, 1)
                    }
                    else {
                        this.selectedSensorNames.push("Light")
                    }
                },
                dynamicBoundaryColorsOn: true,  
            }))

            this.btns.push(new Button({
                parent: null,
                style: ButtonStyles.Transparent,
                icon: "thermometer",
                ariaId: "thermometer",
                x: 60,
                y: -11,
                onClick: () => {
                    const index = this.selectedSensorNames.indexOf("Temp.")
                    if (index != -1) {
                        this.selectedSensorNames.splice(index, 1)
                    }
                    else {
                        this.selectedSensorNames.push("Temp.")
                    }
                },
                dynamicBoundaryColorsOn: true,
            }))

            // -----------

            this.btns.push(new Button({
                parent: null,
                style: ButtonStyles.Transparent,
                icon: "magnet",
                ariaId: "S10",
                x: -60,
                y: 18,
                onClick: () => {
                    const index = this.selectedSensorNames.indexOf("Magnet X")
                    if (index != -1) {
                        this.selectedSensorNames.splice(index, 1)
                    }
                    else {
                        this.selectedSensorNames.push("Magnet X")
                    }
                },          
                dynamicBoundaryColorsOn: true,
            }))

            this.btns.push(new Button({
                parent: null,
                style: ButtonStyles.Transparent,
                icon: "finger_press",
                ariaId: "Logo Press",
                x: -30,
                y: 18,
                onClick: () => {
                    const index = this.selectedSensorNames.indexOf("Logo Pressed")
                    if (index != -1) {
                        this.selectedSensorNames.splice(index, 1)
                    }
                    else {
                        this.selectedSensorNames.push("Logo Pressed")
                    }
                },          
                dynamicBoundaryColorsOn: true, 
            }))

            this.btns.push(new Button({
                parent: null,
                style: ButtonStyles.Transparent,
                icon: "speaker",
                ariaId: "Volume",
                x: 0,
                y: 18,
                onClick: () => {
                    const index = this.selectedSensorNames.indexOf("Volume")
                    if (index != -1) {
                        this.selectedSensorNames.splice(index, 1)
                    }
                    else {
                        this.selectedSensorNames.push("Volume")
                    }
                },          
                dynamicBoundaryColorsOn: true, 
            }))

            this.btns.push(new Button({
                parent: null,
                style: ButtonStyles.Transparent,
                icon: "compass",
                ariaId: "Compass",
                x: 30,
                y: 18,
                onClick: () => {
                    const index = this.selectedSensorNames.indexOf("Compass")
                    if (index != -1) {
                        this.selectedSensorNames.splice(index, 1)
                    }
                    else {
                        this.selectedSensorNames.push("Compass")
                    }
                },          
                dynamicBoundaryColorsOn: true, 
            }))

            this.btns.push(new Button({
                parent: null,
                style: ButtonStyles.Transparent,
                icon: "microbitLogoWhiteBackground",
                ariaId: "Jacdac Flex",
                x: 60,
                y: 18,
                onClick: () => {
                    const index = this.selectedSensorNames.indexOf("Jac Flex")
                    if (index != -1) {
                        this.selectedSensorNames.splice(index, 1)
                    }
                    else {
                        this.selectedSensorNames.push("Jac Flex")
                    }
                },
                dynamicBoundaryColorsOn: true,     
            }))

            //-----------

            this.btns.push(new Button({
                parent: null,
                style: ButtonStyles.Transparent,
                icon: "microbitLogoWhiteBackground",
                ariaId: "Jacdac Temperature",
                x: -60,
                y: 44,
                onClick: () => {
                    const index = this.selectedSensorNames.indexOf("Jac Temp")
                    if (index != -1) {
                        this.selectedSensorNames.splice(index, 1)
                    }
                    else {
                        this.selectedSensorNames.push("Jac Temp")
                    }
                },
                dynamicBoundaryColorsOn: true,     
            }))

            this.btns.push(new Button({
                parent: null,
                style: ButtonStyles.Transparent,
                icon: "microbitLogoWhiteBackground",
                ariaId: "Jacdac Light",
                x: -30,
                y: 44,
                onClick: () => {
                    const index = this.selectedSensorNames.indexOf("Jac Light")
                    if (index != -1) {
                        this.selectedSensorNames.splice(index, 1)
                    }
                    else {
                        this.selectedSensorNames.push("Jac Light")
                    }
                },
                dynamicBoundaryColorsOn: true,
            }))

            this.btns.push(new Button({
                parent: null,
                style: ButtonStyles.Transparent,
                icon: "microbitLogoWhiteBackground",
                ariaId: "Jacdac Moisture",
                x: 0,
                y: 44,
                onClick: () => {
                    const index = this.selectedSensorNames.indexOf("Jac Moist")
                    if (index != -1) {
                        this.selectedSensorNames.splice(index, 1)
                    }
                    else {
                        this.selectedSensorNames.push("Jac Moist")
                    }
                },
                dynamicBoundaryColorsOn: true,
            }))

            this.btns.push(new Button({
                parent: null,
                style: ButtonStyles.Transparent,
                icon: "microbitLogoWhiteBackground",
                ariaId: "Jacdac Distance",
                x: 30,
                y: 44,
                onClick: () => {
                    const index = this.selectedSensorNames.indexOf("Jac Dist")
                    if (index != -1) {
                        this.selectedSensorNames.splice(index, 1)
                    }
                    else {
                        this.selectedSensorNames.push("Jac Dist")
                    }
                },
                dynamicBoundaryColorsOn: true,
            }))

            this.btns.push(new Button({
                parent: null,
                style: ButtonStyles.Transparent,
                icon: "green_tick",
                ariaId: "Done",
                x: 60,
                y: 44,
                onClick: () => {
                    if (this.selectedSensorNames.length === 0) {
                        return
                    }
                    const sensors = this.selectedSensorNames.map((name) => SENSOR_LOOKUP_TABLE[name])
                    this.app.popScene()
                    if (this.nextSceneEnum === CursorSceneEnum.LiveDataViewer) {
                        this.app.pushScene(new LiveDataViewer(this.app, sensors))
                    }

                    else {
                        this.app.pushScene(new RecordingConfigSelection(this.app, sensors))
                    }
                }
            }))
            this.navigator.addButtons(this.btns)
        }
        
        draw() {
            Screen.fillRect(
                Screen.LEFT_EDGE,
                Screen.TOP_EDGE,
                Screen.WIDTH,
                Screen.HEIGHT,
                0xc
            )

            screen.printCenter("Sensor Selection", 2)

            for (let i = 0; i < this.btns.length; i++) {
                this.btns[i].draw()
            }
            super.draw() 
        }
    }
}