"use strict";{
    const cfg = HFS.getPluginConfig()
    const exts = cfg.icons.map(x => x.ext.split('|')).flat()
    const { folders, files } = cfg
    const { h, prefixUrl } = HFS
    HFS.onEvent('entryIcon', ({ entry: { ext, isFolder } }, tools, output) => {
        if (output.some(Boolean)) return // skip if another plugin already set an icon
        const icon = isFolder ? folders && '.' : exts.includes(ext) ? ext : (files && '*')
        if (icon)
            return h('img', { src: prefixUrl + '/?fileIcon=' + icon, className: 'icon custom-icon' })
    })
}
