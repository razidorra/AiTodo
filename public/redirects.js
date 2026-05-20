export function getTodoAppUrl() {
    if (window.location.port === "5500") {
        return `${window.location.origin}/public/index.html`;
    }
    return `${window.location.origin}/`;
}
export function getLoginUrl() {
    if (window.location.port === "5500") {
        return `${window.location.origin}/public/login.html`;
    }
    return `${window.location.origin}/login`;
}
export function getRegisterUrl() {
    if (window.location.port === "5500") {
        return `${window.location.origin}/public/register.html`;
    }
    return `${window.location.origin}/register`;
}
