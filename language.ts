namespace microcode {
    export interface Constraints {
        provides?: number[]
        requires?: number[]
        only?: (string | number)[]
        allow?: (string | number)[]
        disallow?: (string | number)[]
    }

    export function mergeConstraints(src: Constraints, dst: Constraints) {
        if (!src) {
            return
        }
        if (src.provides) {
            src.provides.forEach(item => dst.provides.push(item))
        }
        if (src.requires) {
            src.requires.forEach(item => dst.requires.push(item))
        }
        if (src.only) {
            src.only.forEach(item => dst.only.push(item))
        }
        if (src.allow) {
            src.allow.forEach(item => dst.allow.push(item))
        }
        if (src.disallow) {
            src.disallow.forEach(item => dst.disallow.push(item))
        }
    }

    export function isCompatibleWith(
        src: Constraints,
        c: Constraints
    ): boolean {
        if (!src) return true
        if (src.requires) {
            let compat = false
            src.requires.forEach(
                req => (compat = compat || c.provides.some(pro => pro === req))
            )
            if (!compat) return false
        }
        return true
    }

    export function filterModifierCompat(
        tile: Tile,
        category: string | number,
        c: Constraints
    ): boolean {
        const tid = getTid(tile)
        const only = c.only.some(cat => cat === category || cat === tid)
        if (only) return true
        if (c.only.length) return false

        const allows = c.allow.some(cat => cat === category || cat === tid)
        if (!allows) return false

        const disallows = !c.disallow.some(
            cat => cat === category || cat === tid
        )
        if (!disallows) return false

        return true
    }

    export type Tile = number | ModifierEditor

    export function getTid(tile: Tile): number {
        if (tile instanceof ModifierEditor) return tile.tid
        return tile
    }

    export function getIcon(tile: Tile) {
        if (tile instanceof ModifierEditor) return tile.getIcon()
        return tidToString(tile)
    }

}
