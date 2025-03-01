using DeadlineOrganizerBackend.API.Converters;

namespace DeadlineOrganizerBackend.API
{
    internal static class Extensions
    {
        public static DateTime ToDate(this string? str)
            => DateTimeConverter.StringToDate(str);

        public static string ToApiFormat(this DateTime date)
            => DateTimeConverter.DateToString(date);
    }
}
