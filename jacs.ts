namespace jacs {
    export let debugOut = false

    export const SRV_JACSCRIPT_CONDITION = 0x1196796d
    export const CMD_CONDITION_FIRE = 0x80 

    export const CMD_GET_REG = 0x1000
    export const CMD_SET_REG = 0x2000

    export const JD_REG_STREAMING_SAMPLES = 3
    export const JD_REG_INTENSITY = 1
    export const JD_REG_READING = 0x101

    // delay on sending stuff in pipes and changing pages
    export const ANTI_FREEZE_DELAY = 50

    export enum NumFmt {
        U8 = 0b0000,
        U16 = 0b0001,
        U32 = 0b0010,
        U64 = 0b0011,
        I8 = 0b0100,
        I16 = 0b0101,
        I32 = 0b0110,
        I64 = 0b0111,
        F8 = 0b1000, // not supported
        F16 = 0b1001, // not supported
        F32 = 0b1010,
        F64 = 0b1011,
    }

    export enum ServiceClass {
        Button = 0x1473a263,
        DotMatrix = 0x110d154b,
        SoundLevel = 0x14ad1a5d,
        Temperature = 0x1421bac7,
        SoundPlayer = 0x1403d338,
        Buzzer = 0x1b57b1d7,
        Accelerometer = 0x1f140409,
        Radio = 0x1ac986cf,
        Potentiometer = 0x1f274746,
        LightLevel = 0x17dc9a1c,
        MagneticFieldLevel = 0x12fe180f,
        RotaryEncoder = 0x10fa29c9,
        Led = 0x1609d4f0,
        Servo = 0x12fc9103,
    }
}
