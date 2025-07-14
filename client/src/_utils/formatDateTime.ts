function formatDateTime(isoString: string) {
  const dateObj = new Date(isoString);

  // Format date: yyyy-mm-dd
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  const date = `${year}-${month}-${day}`;

  // Format time: hh:mm AM/PM
  let hours = dateObj.getHours();
  const minutes = String(dateObj.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12; // convert 0 to 12 for 12 AM
  const time = `${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;

  return { date, time };
}
export default formatDateTime;
