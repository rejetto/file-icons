exports.version = 3.31
exports.description = "Customize file icons"
exports.apiRequired = 8.891 // singleWorkerFromBatchWorker-returning
exports.repo = "rejetto/file-icons"
exports.frontend_js = 'main.js'

exports.configDialog = {
    sx: { maxWidth: '40em' },
}

const imageFileMask = '*.png|*.ico|*.jpg|*.jpeg|*.gif|*.svg'
exports.config = {
    folders: { frontend: true, type: 'real_path', fileMask: imageFileMask, label: "Icon for folders" },
    systemExt: { frontend: true, label: "Use system icon for each extension", defaultValue: '', placeholder: 'Example: pdf|doc', helperText: "⚠️ Windows only. Use this when icon is the same for all files with same extension" },
    systemIndividual: { frontend: true, label: "System icon for each file", defaultValue: '', placeholder: 'Example: exe', helperText: "⚠️ Windows only. This is normally useful only with exe files." },
    icons: {
        frontend: true,
        label: "Icons for files by extension",
        type: 'array',
        fields: {
            ext: { placeholder: 'Example: pdf|doc', helperText: "File extension(s). Don't include dot" },
            iconFile: { type: 'real_path', $width: 3, fileMask: imageFileMask },
        },
		defaultValue: []
    },
    files: { frontend: true, type: 'real_path', fileMask: imageFileMask, label: "Icon for other files" },
}

exports.init = api => {
    const { matches, basename, randomId } = api.require('./misc')
    const { readFile, unlink } = api.require('fs/promises')
    const { exec } = api.require('child_process')
    const { resolve } = api.require('path')

    const getIcon = api.require('./misc').singleWorkerFromBatchWorker(async jobs => {
        const sourcesWithId = jobs.flat().map(x => [randomId(5), resolve(x)])
        const params = sourcesWithId.map(x => `"${x.join('|').replaceAll('"', '\\"')}"`).join(' ')
        await new Promise((resolve, reject) =>
            exec('powershell -ExecutionPolicy Bypass -File exicon.ps1 ' + params, { cwd: __dirname, windowsHide: true }, (err, stdout, stderr) => {
                if (err ||= stderr) {
                    console.debug(err)
                    return reject(err)
                }
                resolve()
            }) )
        return Promise.all(sourcesWithId.map(([id]) => {
            const fn = `${api.storageDir}/${id}`
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
            if (fileIcon === '|') // systemIndividual
                return async () => { // wait to get fileSource
                    const { fileSource } = ctx.state
                    if (!fileSource) return
                    ctx.body = await (cache[fileSource] ||= getIcon(fileSource))
                    ctx.type = 'image/png'
                }
            if (matches(fileIcon, api.getConfig('systemExt'))) {
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
        onDirEntry({ node: { source, isFolder } }) {
            const ext = !isFolder && source && basename(source).split('.').at(-1)?.toLowerCase()
            if (ext && !sampleFiles[ext] && matches(ext, api.getConfig('systemExt')))  //TODO optimize
                sampleFiles[ext] = source // collect source for the file we'll use to extract the icon
        }
    }
}
