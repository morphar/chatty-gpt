export default function detectOS () {
  const platform = (navigator.userAgentData && navigator.userAgentData.platofrm) ? navigator.userAgentData.platform : navigator.platform

  if (platform.indexOf('Win') !== -1) {
    return 'Windows'
  } else if (platform.indexOf('Mac') !== -1) {
    return 'macOS'
  } else if (navigator.userAgent.indexOf('iPhone') !== -1) {
    return 'iOS'
  } else if (navigator.userAgent.indexOf('iPad') !== -1) {
    return 'iOS'
  } else if (navigator.userAgent.indexOf('iPod') !== -1) {
    return 'iOS'
  } else if (navigator.userAgent.indexOf('Android') !== -1) {
    return 'Android'
  } else if (platform.indexOf('Linux') !== -1) {
    return 'Linux'
  }
}
