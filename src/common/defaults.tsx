export const themeDefault = 'dark'

export function getImageExtension(content: string | null | undefined) {
    let extension: string | undefined = undefined
    switch (content?.charAt(0)) {
        case 'i': {
            extension = 'png'
            break;
        }
        case '/': {
            extension = 'jpg'
            break;
        }
        case 'R': {
            extension = 'gif'
        }
    }
    return extension
}