function blob2file(blob: Blob, filename: string) {
    return new File([blob], filename, { type: "application/pdf", lastModified: new Date().getTime() })

}

export function canShare(data: File | { blob: Blob, filename: string }) {
    if ("canShare" in navigator && "share" in navigator) {
        if (data instanceof File) return navigator.canShare({ files: [data] })
        return navigator.canShare({ files: [blob2file(data.blob, data.filename)] })
    }
}


export function share(data: File | { blob: Blob, filename: string }) {
    const file = data instanceof File ? data : blob2file(data.blob, data.filename)
    if (canShare(file)) {
        return navigator.share({ files: [file] })
    }
}