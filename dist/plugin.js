exports.version = 3
exports.description = "Customize file icons"
exports.apiRequired = 8.891 // singleWorkerFromBatchWorker-returning
exports.frontend_js = 'main.js'
exports.repo = "rejetto/file-icons"

exports.configDialog = {
    sx: { maxWidth: '40em' },
}

const fileMask = '*.png|*.ico|*.jpg|*.jpeg|*.gif|*.svg'
exports.config = {
    folders: { frontend: true, type: 'real_path', fileMask, label: "Icon for folders" },
    system: { frontend: true, defaultValue: '', label: "Use system icon for", placeholder: 'Example: pdf|doc', helperText: "⚠️ Windows only" },
    icons: {
        frontend: true,
        label: "Icons for files by extension",
        type: 'array',
        fields: {
            ext: { placeholder: 'Example: pdf|doc', helperText: "File extension(s). Don't include dot" },
            iconFile: { type: 'real_path', $width: 3, fileMask },
        }
    },
    files: { frontend: true, type: 'real_path', fileMask, label: "Icon for other files" },
}

exports.init = api => {
    const { matches, basename } = api.require('./misc')
    const { runCmd } = api.require('./util-os')
    const { readFile, unlink } = api.require('fs/promises')

    const getIcon = api.require('./misc').singleWorkerFromBatchWorker(async jobs => {
        const sources = jobs.flat()
        await runCmd('powershell -ExecutionPolicy Bypass -File exicon.ps1', sources, { cwd: __dirname })
        return Promise.all(sources.map(fn => {
            fn += '_icon.png'
            return readFile(fn).then(x => {
                unlink(fn)
                return x
            }, api.log)
        }))
    }, { maxWait: 500 })

    const cache = {}
    const sampleFiles = {}

    return {
        async middleware(ctx) {
            const { fileIcon } = ctx.query
            if (!fileIcon) return
            if (matches(fileIcon, api.getConfig('system'))) {
                const sample = sampleFiles[fileIcon.toLowerCase()]
                if (sample) {
                    ctx.type = 'image/png'
                    ctx.body = await (cache[fileIcon] ||= getIcon(sample))
                    return
                }
            }
            const icon = fileIcon === '.' ? api.getConfig('folders')
                : fileIcon === '*' ? api.getConfig('files')
                    : api.getConfig('icons')?.find(x => matches(fileIcon, x.ext))?.iconFile
            if (!icon) return
            const { serveFile } = api.require('./serveFile')
            ctx.state.considerAsGui = true
            return serveFile(ctx, icon)
        },
        onDirEntry({ node: { source } }) {
            const ext = basename(source).split('.')[1].toLowerCase()
            if (ext && !sampleFiles[ext] && matches(ext, api.getConfig('system'))) //TODO optimize
                sampleFiles[ext] = source
        }
    }
}