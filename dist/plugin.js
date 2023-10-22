exports.version = 2.1
exports.description = "Customize file icons"
exports.apiRequired = 8.1 // entryIcon
exports.frontend_js = 'main.js'
exports.repo = "rejetto/file-icons"

exports.configDialog = {
    sx: { maxWidth: '40em' },
}

const fileMask = '*.png|*.ico|*.jpg|*.jpeg|*.gif|*.svg'
exports.config = {
    folders: { frontend: true, type: 'real_path', fileMask, label: "Icon for folders" },
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

exports.init = api => ({
    middleware: ctx => {
        const {fileIcon} = ctx.query
        if (!fileIcon) return
        const {matches} = api.require('./misc')
        const icon = fileIcon === '.' ? api.getConfig('folders')
            : fileIcon === '*' ? api.getConfig('files')
                : api.getConfig('icons')?.find(x => matches(fileIcon, x.ext))?.iconFile
        if (!icon) return
        const {serveFile} = api.require('./serveFile')
        return serveFile(ctx, icon)
    }
})