{
    const cfg = HFS.getPluginConfig()
    const exts = cfg.icons?.map(x => x.ext.split('|')).flat()
    const { h } = HFS
    HFS.onEvent('entryIcon', ({ entry: { ext } }, tools, output) => {
        if (output.find(Boolean)) return // no multiple icons
        if (exts.includes(ext))
            return h('img', { src: '/?fileIcon=' + ext, className: 'icon custom-icon' })
    })
}
