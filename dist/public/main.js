{
    const cfg = HFS.getPluginConfig()
    const exts = cfg.icons?.map(x => x.ext.split('|')).flat()
    const { h, prefixUrl } = HFS
    HFS.onEvent('entryIcon', ({ entry: { ext } }, tools, output) => {
        if (output.find(Boolean)) return // no multiple icons
        if (exts.includes(ext))
            return h('img', { src: prefixUrl + '/?fileIcon=' + ext, className: 'icon custom-icon' })
    })
}
