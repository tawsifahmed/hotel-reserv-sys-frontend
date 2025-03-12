export default function accessPermission(permission) {
    const userType = useCookie('userType')?.value;

    if (userType === permission) {
      return true;
    } else {
      return false;
    }
}