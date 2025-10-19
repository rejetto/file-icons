"use strict";{
    const cfg = HFS.getPluginConfig()
    const exts = cfg.icons && cfg.icons.map(x => x.ext)
    if (cfg.systemExt)
        exts.push(cfg.systemExt)
    const isByExt = HFS.misc.makeMatcher(exts.join('|'))
    const isIndividual = HFS.misc.makeMatcher(cfg.systemIndividual)
    const { folders, files } = cfg
    const { h, prefixUrl } = HFS
    HFS.onEvent('entryIcon', ({ entry: { ext, isFolder, uri } }) => {
        if (!isFolder && isIndividual(ext))
            return h('img', { src: uri + '?fileIcon=|', className: 'icon custom-icon' })
        const icon = isFolder ? folders && '.' : isByExt(ext) ? ext : (files && '*')
        if (icon)
            return h('img', { src: prefixUrl + '/?fileIcon=' + icon, className: 'icon custom-icon' })
    })
}
