export function formatTimeAgo(
    dateInput: Date | string | number,
    nowMs?: number
) {
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput)
    const now = typeof nowMs === 'number' ? nowMs : Date.now()

    if (Number.isNaN(date.getTime())) return ''

    const diffInSeconds = Math.max(0, Math.floor((now - date.getTime()) / 1000))

    if (diffInSeconds < 60) return `${diffInSeconds}s`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d`
    return `${Math.floor(diffInSeconds / 2592000)}mo`
}
export function getInitials(name: string) {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
}
