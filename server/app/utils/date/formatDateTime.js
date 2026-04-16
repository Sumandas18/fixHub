module.exports = function formatDateTime(date, time) {
    const formattedDate = new Date(date).toLocaleDateString("en-IN", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
    });

    // Convert 24h time to 12h format
    const [hours, minutes] = time.split(":");
    const hour = Number(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedTime = `${hour % 12 || 12}:${minutes} ${ampm}`;

    return `${formattedDate} at ${formattedTime}`;
};