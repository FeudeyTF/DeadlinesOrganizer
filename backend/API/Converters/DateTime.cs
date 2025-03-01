using System.Globalization;

namespace DeadlineOrganizerBackend.API.Converters
{
    public class DateTimeConverter
    {
        private const string DateFormat = "yyyy-MM-dd'T'HH:mm";

        public static DateTime StringToDate(string? dateTime)
        {
            if (dateTime == null)
                return DateTime.MinValue;
            return DateTime.ParseExact(dateTime, DateFormat, CultureInfo.InvariantCulture);
        }

        public static string DateToString(DateTime dateTime)
        {
            return dateTime.ToString(DateFormat, CultureInfo.InvariantCulture);
        }
    }
}
