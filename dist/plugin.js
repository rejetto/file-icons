exports.version = 1.0
exports.description = "Customize file icons"
exports.apiRequired = 8.1 // entryIcon
exports.frontend_js = 'main.js'
exports.repo = 'rejetto/file-icons'

exports.config = {
    icons: {
        frontend: true,
        label: '',
        type: 'array',
        sx: { width: 'min(90vw, 30em)'  },
        fields: {
            ext: { placeholder: 'Example: pdf', helperText: "File extension. Don't include dot" },
            iconFile: { type: 'real_path', $width: 3, fileMask: '*.png|*.ico|*.jpg|*.jpeg|*.gif|*.svg' },
        }
    }
}

exports.init = api => ({
    middleware: ctx => {
        const {fileIcon} = ctx.query
        if (!fileIcon) return
        const icons = api.getConfig('icons')
        const {matches} = api.require('./misc')
        const icon = icons?.find(x => matches(fileIcon, x.ext))
        if (!icon) return
        const { iconFile } = icon
        if (!iconFile) return
        const {serveFile} = api.require('./serveFile')
        return serveFile(ctx, iconFile)
    }
})